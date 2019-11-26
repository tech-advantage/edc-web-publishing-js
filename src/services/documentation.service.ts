import { MultiToc } from '../entities/multi-toc';
import { Promise as PromiseEs6 } from 'es6-promise';
import { ExportInfo } from '../entities/export-info';
import { DocumentationExport } from '../entities/documentation-export';
import { BaseToc, Toc, TocInfo } from '../entities/toc';
import { EdcHttpClient } from '../http/edc-http-client';
import { ContentTypeSuffix } from '../entities/content-type';
import { InformationMap } from '../entities/information-map';
import { Utils } from '../utils/utils';
import { Documentation } from '../entities/documentation';
import { DocumentationUtil } from '../utils/documentation-util';
import { LanguageService } from './language.service';

export class DocumentationService {
  private static instance: DocumentationService;

  private globalToc: MultiToc;
  private globalTocReady: PromiseEs6<MultiToc>;

  private constructor(private readonly httpClient: EdcHttpClient) {
  }

  public static getInstance(): DocumentationService {
    if (!DocumentationService.instance) {
      DocumentationService.instance = new DocumentationService(EdcHttpClient.getInstance());
    }
    return DocumentationService.instance;
  }

  initMultiToc(exportInfos: Map<string, ExportInfo>): PromiseEs6<MultiToc> {
    this.globalToc = null;
    this.globalTocReady = this.readTocs(exportInfos)
      .then((documentationExports: DocumentationExport[]) => PromiseEs6.resolve(this.createMultiToc(documentationExports)))
      .then((multiToc: MultiToc) => PromiseEs6.resolve(this.globalToc = multiToc))
      .then(() => {
      return PromiseEs6.resolve(this.globalToc);
    });
    return this.globalTocReady;
  }

  getDocumentation(id: number, langCode: string, defaultLang?: string): PromiseEs6<Documentation> {
    return this.globalTocReady.then((multiToc: MultiToc) => DocumentationUtil.findDocumentationFromId(multiToc, id, langCode, defaultLang))
      .then((doc: Documentation) => Utils.getContent<Documentation>(doc, this.httpClient));
  }

  findPluginIdFromDocumentationId(docId: number): PromiseEs6<string> {
    return this.globalTocReady
      .then(() => DocumentationUtil.findPluginIdFromDocumentationId(this.globalToc, docId));
  }

  getInformationMapFromDocId(id: number): PromiseEs6<InformationMap> {
    return this.globalTocReady
      .then(() => DocumentationUtil.findIMFromDocumentationId(this.globalToc, id));
  }

  getToc(pluginId: string): PromiseEs6<Toc> {
    return this.globalTocReady.then(() => {
      const docExport = this.globalToc.exports
        .find((documentationExport: DocumentationExport) => documentationExport.pluginId === pluginId);
      return Utils.safeGet<DocumentationExport, Toc>(docExport, ['toc']);
    });
  }

  readTocs(productInfos: Map<string, ExportInfo>): PromiseEs6<DocumentationExport[]> {
    if (!productInfos || !productInfos.size) {
      return PromiseEs6.resolve([]);
    }

    return PromiseEs6.all(
      Array.from(productInfos.entries(),
        ([exportId, exportInfo]: [string, ExportInfo]) => this.readSingleToc(exportId, exportInfo)
      )
    ).then((docExports: DocumentationExport[]) => docExports ? docExports.filter(Boolean) : []);
  }

  private readSingleToc(exportId: string, exportInfo: ExportInfo): PromiseEs6<DocumentationExport> {
    return this.httpClient.getContent(ContentTypeSuffix.TYPE_TOC_SUFFIX, exportId)
      .then((toc: BaseToc) => this.readInformationMaps(exportId, toc))
      .then((toc: Toc) => {
        return new DocumentationExport(
          exportId,
          exportInfo.productId,
          toc,
          exportInfo.info.defaultLanguage,
          exportInfo.info.languages
        );
      })
      .catch((err: Error) => {
        console.warn('Could not find table of contents for export : {}, {}', exportId, err);
        return PromiseEs6.resolve(null);
      });
  }

  private readInformationMaps(exportId: string, toc: BaseToc): PromiseEs6<Toc> {
    const { toc: tocInfos } = toc;
    return PromiseEs6.all(tocInfos.map((tocInfo: TocInfo) => this.httpClient.getFile(tocInfo.file, exportId)))
      .then((ims: InformationMap[]) => new Toc(toc.label, ims))
      .catch(err => {
        console.error('Could not get toc ', toc, err);
        return PromiseEs6.resolve(null);
      });
  }

  private createMultiToc(documentationExports: DocumentationExport[]): MultiToc {
    if (!documentationExports || !documentationExports.length) {
      return null;
    }
    const index = this.createIndex(documentationExports);
    return new MultiToc(documentationExports, index);
  }

  createIndex(documentationExports: DocumentationExport[]): { [key: string]: string } {
    return documentationExports.reduce((memo: { [key: string]: string }, docExport: DocumentationExport, index: number) => {
      const partialIndex = this.createIndexOfExport(docExport, index);
      if (partialIndex) {
        Object.assign(memo, partialIndex);
      }
      return memo;
    }, {});
  }

  createIndexOfExport(docExport: DocumentationExport, index: number): { [key: string]: string } {
    if (!docExport || !docExport.toc || !docExport.toc.toc || !docExport.toc.toc.length) {
      console.warn('Could not create index for documentation export: ', docExport);
      return null;
    }
    const informationMaps: InformationMap[] = docExport.toc.toc;
    // Reduce the informationMaps into the key index
    return informationMaps.reduce((indexTree: { [key: string]: string }, im: InformationMap, imIndex: number) => {
      // All languages of the information map contents have the same tree structure, use the first available one for indexation
      const rootTopics: Documentation = DocumentationUtil.findFirstContent<InformationMap, Documentation>(im);
      if (!rootTopics) {
        console.error('No content found for the information map', im);
        return indexTree;
      }
      // We found some content, we can add it to the index tree
      // Specify the root prefix - here LANG_SEPARATOR is an anchor, meant to be replaced by a real language code during content retrieving
      const rootPrefix = `exports[${index}].toc.toc[${imIndex}]${LanguageService.LANG_SEPARATOR}`;
      // Add the partial index corresponding to this information map to the export index tree
      Object.assign(indexTree, DocumentationUtil.indexTree([rootTopics], rootPrefix, true));
      return indexTree;
    }, {});
  }
}
