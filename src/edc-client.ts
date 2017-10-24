import { get, isEmpty, isNil, join, some, split } from 'lodash';
import { Helper } from './entities/helper';
import { Toc } from './entities/toc';
import { MultiToc } from './entities/multi-toc';
import { Documentation } from './entities/documentation';
import { InformationMap } from './entities/information-map';
import { Promise as PromiseEs6 } from 'es6-promise';
import { Article } from './entities/article';
import { DocumentationExport } from './entities/documentation-export';
import * as edcClientService from './edc-client-service';
import { ContentTypeSuffix } from './entities/content-type';

export class EdcClient {
  context: any;
  globalToc: MultiToc;
  currentExportId: string;
  contextReady: Promise<any>;
  globalTocReady: Promise<MultiToc>;
  baseURL: string;

  constructor(baseURL?: string, exportId?: string) {
    this.baseURL = baseURL;
    this.currentExportId = exportId;
    this.init(exportId);
  }

  init(exportId?: string) {
    this.globalTocReady = this.initMultiToc();
    this.contextReady = this.initContext(exportId);
  }

  initMultiToc(): Promise<MultiToc> {
    return edcClientService.createMultiToc(this.baseURL)
      .then((multiToc: MultiToc) => this.globalToc = multiToc);
  }

  initContext(exportId?: string): Promise<any> {
    return this.globalTocReady
      .then(() => this.getContext())
      .then(context => {
        this.setCurrentExport(exportId);
        return this.context = context;
      });
  }

  setCurrentExport(newExportId: string): void {
    this.currentExportId = this.checkExportId(newExportId);
  }

  /**
   * get the toc for a given export from its exportId
   * if exportId is not defined return the toc for the current export
   * @param {string} targetExport the identifier of the export
   * @return {Promise<Toc>} the toc of the export
   */
  getToc(targetExport?: string): Promise<Toc> {
    return this.globalTocReady.then((tocs: MultiToc) => {
      const exportId = this.checkExportId(targetExport);
      return get<Toc>(edcClientService.findExportById(tocs.exports, exportId), 'toc');
    });
  }

  getInfo(targetExport?: string): Promise<any> {
    return this.getHelpContent(targetExport, ContentTypeSuffix.TYPE_INFO_SUFFIX);
  }

  getContext(targetExport?: string): Promise<any> {
    return this.getHelpContent(targetExport, ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
  }

  getHelpContent(targetExport: string, suffix: ContentTypeSuffix): Promise<any> {
    if (isNil(this.currentExportId)) {
      return this.globalTocReady.then(() => {
        const exportId = this.checkExportId(targetExport);
        return edcClientService.getHelpContent(`${this.baseURL}/${exportId}`, suffix);
      });
    }
    return edcClientService.getHelpContent(`${this.baseURL}/${this.currentExportId}`, suffix);
  }

  getHelper(key: string, subKey: string, lang: string = 'en'): Promise<Helper> {
    let helper: Helper;
    let deferred: Promise<any> = this.contextReady;
    if (!deferred) {
      deferred = this.initContext();
    }
    return deferred
      .then(() => {
        helper = this.getKey(key, subKey, lang);
        if (helper) {
          return PromiseEs6.all(
            [ edcClientService.getContent<Helper>(this.baseURL, helper), ...helper.articles.map(article => edcClientService.getContent<Article>(this.baseURL, article)) ]
          );
        } else {
          return PromiseEs6.reject(undefined);
        }
      })
      .then(() => helper);
  }

  /**
   * get the documentation from its id
   * will set the current export to that of the requested documentation
   * @param {number} id
   * @return {Promise<Documentation>}
   */
  getDocumentation(id: number): Promise<Documentation> {
    return this.globalTocReady.then(() => {
      const doc = edcClientService.getDocumentationById(this.globalToc, id);
      if (doc) {
        return edcClientService.getContent<Documentation>(this.baseURL, doc);
      } else {
        console.error(`Documentation [${id}] not found in table of content`);
      }
    });
  }

  getInformationMapFromDocId(id: number): Promise<InformationMap> {
    return this.globalTocReady.then(() => {
      const docPath = this.globalToc.index[ id ];
      const iMPath = join(split(docPath, '.', 3), '.');
      return get<InformationMap>(this.globalToc, iMPath);
    });
  }

  getKey(key: string, subKey: string, lang: string): Helper {
    return get<Helper>(this.context, `['${key}']['${subKey}']['${lang}']`);
  }

  checkExportId(exportId: string): string {
    if (this.isExportPresent(exportId)) {
      return exportId;
    }
    return this.getCurrentExportId();
  }

  isExportPresent(exportId: string): boolean {
    if (!this.globalToc || isEmpty(this.globalToc.exports)) {
      return false;
    }
    return !isNil(exportId) && some(this.globalToc.exports, (docExport: DocumentationExport) => docExport.pluginId === exportId);
  }

  getCurrentExportId(): string {
    if (!isNil(this.currentExportId)) {
      return this.currentExportId;
    }
    return get<string>(this.globalToc, 'exports[0].pluginId');
  }

}
