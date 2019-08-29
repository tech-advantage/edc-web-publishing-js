import { assign, find, get, isEmpty, isNil, map, size } from 'lodash';
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
import { Info } from './entities/info';

export function createMultiToc(baseURL: string, lang: string): PromiseEs6<MultiToc> {
  const newMultiToc = new MultiToc();
  return getHelpContent(baseURL, ContentTypeSuffix.TYPE_MULTI_TOC_SUFFIX)
    .then((exports: DocumentationExport[]) => createExportsFromContent(exports))
    .then((exports: DocumentationExport[]) => initEachToc(baseURL, exports, newMultiToc, lang))
    .then(() => newMultiToc)
    .catch((err: Error): MultiToc => {
      console.warn(`Edc-client-js : Could not create multiToc from baseUrl [${baseURL}] ${err}`);
      return null;
    });
}

export function getPluginIds(baseURL: string): PromiseEs6<string[]> {
  return getHelpContent(baseURL, ContentTypeSuffix.TYPE_MULTI_TOC_SUFFIX)
    .then((exports: DocumentationExport[]) => map(exports, (exp: DocumentationExport) => exp.pluginId));
}

/**
 * Return the title of current documentation by language
 * If translation not found, will return the default name
 *
 * @param info the info content of current export
 * @param currentLang the code of the current language
 * @param defaultLang the code of the default language
 */
export function getTitle(info: Info, currentLang: string, defaultLang: string): string {
  if (!info || (!currentLang && !defaultLang)) {
    return '';
  }
  let title;
  // Try and get title for current language
  if (currentLang && info.titles && info.titles[currentLang]) {
    title = info.titles[currentLang].title;
  } else if (defaultLang && info.titles && info.titles[defaultLang]) {
    // Try with default language
    title = info.titles[defaultLang].title;
  }
  // Return title or system default name
  return title || info.name;
}

export function getHelpContent(baseUrl: string, suffix: ContentTypeSuffix): any {
  return axios.get(`${baseUrl}${suffix}`)
    .then((res: AxiosResponse) => get(res, 'status') === 200 ? res.data : null,
      (err: AxiosError) => PromiseEs6.reject(err));
}

export function getDocumentationById(globalToc: MultiToc, id: number): Documentation {
  const path = get(globalToc, `index[${id}]`);
  return get(globalToc, path);
}

export function getContent<T extends Loadable>(baseURL: string, item: T): PromiseEs6<T> {
  if (!baseURL || !item) {
    return null;
  }
  return getHelpContent(`${baseURL}/${item.url}`, ContentTypeSuffix.TYPE_EMPTY_SUFFIX)
    .then((content: string) => {
      item.content = content;
      return item;
    }, (): T => null)
    .catch((): T => null);
}

export function createExportsFromContent(exportsContent: DocumentationExport[]): DocumentationExport[] {
  if (Utils.checkMultiDocContent(exportsContent)) {
    return map(exportsContent, (exportContent: DocumentationExport) => createExportFromContent(exportContent));
  }
  return [];
}

export function createExportFromContent(exportContent: DocumentationExport): DocumentationExport {
  return assign(exportContent, { toc: new Toc() });
}

export function findExportById(exports: DocumentationExport[], id: string): DocumentationExport {
  return find(exports, (docExport: DocumentationExport) => docExport.pluginId === id);
}

export function initEachToc(baseURL: string, exports: DocumentationExport[], multiToc: MultiToc, lang: string): any {
  if (isEmpty(exports)) {
    return PromiseEs6.reject('Error in reading multi-doc.json file');
  }
  return PromiseEs6.all(map(exports, (singleExport: DocumentationExport) => addTocIMsToIndex(baseURL, singleExport, multiToc, lang)));
}

export function addTocIMsToIndex(baseUrl: string, sourceExport: DocumentationExport, multiToc: MultiToc, lang: string): PromiseEs6<DocumentationExport> {
  const pluginId = get(sourceExport, 'pluginId');
  if (!pluginId) {
    return null;
  }
  const rootUrl = `${baseUrl}/${pluginId}`;

  // get the content of the toc.json file for this export and add its content to the index and to the multiToc file
  return getHelpContent(rootUrl, ContentTypeSuffix.TYPE_TOC_SUFFIX)
    .then((currentToc: Toc) => addExportToGlobalToc(rootUrl, currentToc, sourceExport, multiToc, lang),
      (err: Error): DocumentationExport => {
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
function addExportToGlobalToc(rootUrl: string, currentToc: Toc, sourceExport: DocumentationExport, multiToc: MultiToc, lang: string): PromiseEs6<DocumentationExport> {
  const informationMaps: InformationMap[] = get(currentToc, 'toc');
  if (!informationMaps) {
    return null;
  }
  return addInformationMapsToIndex(rootUrl, informationMaps, multiToc, lang)
    .then(() => addTocToExport(sourceExport, currentToc, multiToc));
}

function addInformationMapsToIndex(rootUrl: string, informationMaps: InformationMap[], multiToc: MultiToc, lang: string): PromiseEs6<any> {
  return PromiseEs6.all(map(informationMaps, (informationMap: InformationMap, key: number) => getHelpContent(`${rootUrl}/${informationMap.file}`, ContentTypeSuffix.TYPE_EMPTY_SUFFIX)
    .then((content: InformationMap) => addSingleIMContentToIndex(informationMap, content, key, multiToc, lang))));
}

function addSingleIMContentToIndex(im: InformationMap, content: InformationMap, key: number, multiToc: MultiToc, lang: string): void {
  if (!im || !content) {
    return null;
  }
  // get the index of the current export after it will be pushed into the multiToc exports array
  const newExportIndex = size(get(multiToc, 'exports'));
  // Get information map name
  const label: string = get(content, `[${lang}].label`);
  im = assign(im, content, { label });
  // define topics property from current language
  im.topics = [get(content, `[${lang}]`)];
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

/**
 * Return the export Id from the given documentation id
 * @param multiToc
 * @param docId
 */
export function findPluginIdFromDocumentId(globalToc: MultiToc, docId: number): string {
  const docPath: string = get(globalToc, `index[${docId}]`);
  return get(globalToc, Utils.findExportPathFromDocPath(docPath));
}

/**
 * Return the information map from the given documentation id
 * Will extract the information map index path from the doc path
 * @param multiToc
 * @param docId
 */
export function findIMFromDocumentationId(multiToc: MultiToc, docId: number): InformationMap {
  let informationMap;
  if (!isNil(docId) && multiToc && multiToc.index && multiToc.exports) {
    const docPath = multiToc.index[docId];
    const iMPath = Utils.findIMPathFromDocPath(docPath);
    informationMap = get(multiToc, iMPath);
  }
  if (!informationMap) {
    throw Error(`Could not find informationMap from documentation id : ${docId}`);
  }
  return informationMap;
}
