import { assign, find, get, map } from 'lodash';
import axios, { AxiosResponse } from 'axios';
import { DocumentationExport } from './entities/documentation-export';
import { Toc } from './entities/toc';
import { InformationMap } from './entities/information-map';
import { Promise as PromiseEs6 } from 'es6-promise';
import { MultiToc } from './entities/multi-toc';
import { Utils } from './utils/utils';
import { ContentTypeSuffix } from './entities/content-type';
import { Documentation } from './entities/documentation';
import { Loadable } from './entities/loadable';

export function createMultiToc(baseURL: string): Promise<MultiToc> {
  const newMultiToc = new MultiToc();
  return getHelpContent(baseURL, ContentTypeSuffix.TYPE_MULTI_TOC_SUFFIX)
    .then((exports: DocumentationExport[]) => createExportsFromContent(exports))
    .then((exports: DocumentationExport[]) => initEachToc(baseURL, exports, newMultiToc))
    .then(() => newMultiToc);
}

export function getHelpContent(baseUrl: string, suffix: ContentTypeSuffix): Promise<any> {
  return axios.get(`${baseUrl}/${suffix}`)
    .then((res: AxiosResponse<any>) => get<number>(res, 'status') === 200 ? res.data : []);
}

export function addTocIMsToIndex(baseUrl: string, sourceExport: DocumentationExport, exportIndex: number, multiToc: MultiToc): Promise<DocumentationExport> {
  const rootUrl = `${baseUrl}/${sourceExport.pluginId}`;

  return getHelpContent(rootUrl, ContentTypeSuffix.TYPE_TOC_SUFFIX)
    .then((currentToc: Toc) => {
      const tocs = get<InformationMap[]>(currentToc, 'toc');
      return PromiseEs6.all(map(tocs, (toc, key) => getHelpContent(`${rootUrl}/${toc.file}`, ContentTypeSuffix.TYPE_EMPTY_SUFFIX)
        .then((content: InformationMap) => addSingleIMContentToIndex(toc, content, exportIndex, key, multiToc))))
        .then(() => addTocToExport(sourceExport, currentToc, multiToc));
    });
}

export function getDocumentationById(globalToc: MultiToc, id: number): Documentation {
  const path = get(globalToc, `index[${id}]`);
  return get<Documentation>(globalToc, path);
}

export function getContent<T extends Loadable>(baseURL: string, item: T): Promise<T> {
  return getHelpContent(`${baseURL}/${item.url}`, ContentTypeSuffix.TYPE_EMPTY_SUFFIX)
    .then(content => {
      item.content = content;
      return item;
    });
}

export function findExportById(exports: DocumentationExport[], id: string): DocumentationExport {
  return find(exports, (docExport: DocumentationExport) => docExport.pluginId === id);
}

function addSingleIMContentToIndex(im: InformationMap, content: InformationMap, exportIndex: number, key: number, multiToc: MultiToc): void {
  im = assign(im, content);
  // define topics property so informationMap can implement Indexable
  im.topics = [ im.en ];
  // build the root prefix from the productIndex and the toc key
  const rootPrefix = `exports[${exportIndex}].toc.toc[${key}]`;
  // then assign the generated index tree to the multi Toc index
  multiToc.index = assign(multiToc.index, Utils.indexTree([ im ], rootPrefix, true));
}

function addTocToExport(sourceExport: DocumentationExport, currentToc: Toc, multiToc: MultiToc): DocumentationExport {
  sourceExport.toc = currentToc;
  multiToc.exports.push(sourceExport);
  return sourceExport;
}

function createExportsFromContent(exportsContent: DocumentationExport[]): DocumentationExport[] {
  return map(exportsContent, (exportContent: DocumentationExport) => createExportFromContent(exportContent));
}

function createExportFromContent(exportContent: DocumentationExport): DocumentationExport {
  return assign<DocumentationExport>(exportContent, { toc: new Toc() });
}

function initEachToc(baseURL: string, exports: DocumentationExport[], multiToc: MultiToc): any {
  return PromiseEs6.all(map(exports, (singleExport: DocumentationExport, index) => addTocIMsToIndex(baseURL, singleExport, index, multiToc)));
}
