import { assign, find, first, get, isEmpty, map, size, split } from 'lodash';
import axios, { AxiosResponse, AxiosError } from 'axios';
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
    .then(() => newMultiToc)
    .catch((err) => {
      console.warn(`Edc-client-js : Could not create multiToc from baseUrl [${baseURL}] ${err}`);
      return null;
    });
}

export function getPluginIds(baseURL: string): Promise<string[]> {
  return getHelpContent(baseURL, ContentTypeSuffix.TYPE_MULTI_TOC_SUFFIX)
    .then((exports: DocumentationExport[]) => map(exports, exp => exp.pluginId));
}

export function getHelpContent(baseUrl: string, suffix: ContentTypeSuffix): Promise<any> {
  return axios.get(`${baseUrl}${suffix}`)
    .then((res: AxiosResponse) => get<number>(res, 'status') === 200 ? res.data : null,
      (err: AxiosError) => PromiseEs6.reject(err));
}

export function getDocumentationById(globalToc: MultiToc, id: number): Documentation {
  const path = get(globalToc, `index[${id}]`);
  return get<Documentation>(globalToc, path);
}

export function getContent<T extends Loadable>(baseURL: string, item: T): Promise<T> {
  if (!baseURL || !item) {
    return null;
  }
  return getHelpContent(`${baseURL}/${item.url}`, ContentTypeSuffix.TYPE_EMPTY_SUFFIX)
    .then(content => {
      item.content = content;
      return item;
    }, (err) => {
      console.warn(`Edc-client-js : could not read content from base url [${baseURL}] and file [${item.url}] ${err}`);
      return null;
    });
}

export function createExportsFromContent(exportsContent: DocumentationExport[]): DocumentationExport[] {
  if (Utils.checkMultiDocContent(exportsContent)) {
    return map(exportsContent, (exportContent: DocumentationExport) => createExportFromContent(exportContent));
  }
  return [];
}

export function createExportFromContent(exportContent: DocumentationExport): DocumentationExport {
  return assign<DocumentationExport>(exportContent, { toc: new Toc() });
}

export function findExportById(exports: DocumentationExport[], id: string): DocumentationExport {
  return find(exports, (docExport: DocumentationExport) => docExport.pluginId === id);
}

export function getPluginIdFromDocumentId(globalToc: MultiToc, docId: number): string {
  const docPath = get<string>(globalToc, `index[${docId}]`);
  const exportPath = first(split(docPath, '.'));
  return get<string>(globalToc, `${exportPath}.pluginId`);
}

export function initEachToc(baseURL: string, exports: DocumentationExport[], multiToc: MultiToc): any {
  if (isEmpty(exports)) {
    return PromiseEs6.reject('Error in reading multi-doc.json file');
  }
  return PromiseEs6.all(map(exports, (singleExport: DocumentationExport) => addTocIMsToIndex(baseURL, singleExport, multiToc)));
}

export function addTocIMsToIndex(baseUrl: string, sourceExport: DocumentationExport, multiToc: MultiToc): Promise<DocumentationExport> {
  const pluginId = get<string>(sourceExport, 'pluginId');
  if (!pluginId) {
    return null;
  }
  const rootUrl = `${baseUrl}/${pluginId}`;

  // get the content of the toc.json file for this export and add its content to the index and to the multiToc file
  return getHelpContent(rootUrl, ContentTypeSuffix.TYPE_TOC_SUFFIX)
    .then((currentToc: Toc) => addExportToGlobalToc(rootUrl, currentToc, sourceExport, multiToc),
      (err) => {
        console.warn(`Edc-client-js : could not read toc.json file from plugin [${pluginId}] ${err}`);
        return null;
      });
}

/**
 * add the content of the current toc to the multiToc file
 * populate the global index with the content of all information maps of the current toc
 * then add the current toc to the exports array of the multiToc object
 * @param {string} rootUrl the root to use for this export
 * @param {Toc} currentToc the toc of the processed export
 * @param {DocumentationExport} sourceExport the currently processed export, that will contain the current toc
 * @param {MultiToc} multiToc the global toc object, containing all the tocs of the different exports
 * @return {Promise<DocumentationExport>} returns a promise containing the current export
 */
function addExportToGlobalToc(rootUrl: string, currentToc: Toc, sourceExport: DocumentationExport, multiToc: MultiToc): PromiseEs6<DocumentationExport> {
  const informationMaps = get<InformationMap[]>(currentToc, 'toc');
  if (!informationMaps) {
    return null;
  }
  return addInformationMapsToIndex(rootUrl, informationMaps, multiToc)
    .then(() => addTocToExport(sourceExport, currentToc, multiToc));
}

function addInformationMapsToIndex(rootUrl: string, informationMaps: InformationMap[], multiToc: MultiToc): PromiseEs6<void[]> {
  return PromiseEs6.all(map(informationMaps, (informationMap, key) => getHelpContent(`${rootUrl}/${informationMap.file}`, ContentTypeSuffix.TYPE_EMPTY_SUFFIX)
    .then((content: InformationMap) => addSingleIMContentToIndex(informationMap, content, key, multiToc))));
}

function addSingleIMContentToIndex(im: InformationMap, content: InformationMap, key: number, multiToc: MultiToc): void {
  if (!im || !content) {
    return null;
  }
  // get the index of the current export after it will be pushed into the multiToc exports array
  const newExportIndex = size(get(multiToc, 'exports'));
  im = assign(im, content);
  // define topics property so informationMap can implement Indexable
  im.topics = [im.en];
  // build the root prefix from the productIndex and the toc key
  const rootPrefix = `exports[${newExportIndex}].toc.toc[${key}]`;
  // then assign the generated index tree to the multi Toc index
  multiToc.index = assign(multiToc.index, Utils.indexTree([im], rootPrefix, true));
}

/**
 * add toc to the documentation Export and push the documentation export into the multiToc exports collection
 * @param {DocumentationExport} sourceExport the sourceExport being created
 * @param {Toc} currentToc the toc being processed
 * @param {MultiToc} multiToc the final multiToc to save the created source export into
 * @returns {DocumentationExport} the source export containing the currently processed toc
 */
function addTocToExport(sourceExport: DocumentationExport, currentToc: Toc, multiToc: MultiToc): DocumentationExport {
  if (sourceExport) {
    sourceExport.toc = currentToc;
    multiToc.exports.push(sourceExport);
  }
  return sourceExport;
}
