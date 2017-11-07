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
import { getPluginIdFromDocumentId } from './edc-client-service';
import { DocumentationTransfer } from './entities/documentation-transfer';
import { Info } from './entities/info';

export class EdcClient {
  context: any;
  globalToc: MultiToc;
  currentPluginId: string;
  contextReady: Promise<any>;
  globalTocReady: Promise<MultiToc>;
  baseURL: string;

  constructor(baseURL?: string, exportId?: string) {
    this.baseURL = baseURL;
    this.init(exportId);
  }

  init(pluginId?: string) {
    this.globalTocReady = this.initMultiToc();
    this.contextReady = this.initContext(pluginId);
  }

  initMultiToc(): Promise<MultiToc> {
    return edcClientService.createMultiToc(this.baseURL)
      .then((multiToc: MultiToc) => this.globalToc = multiToc);
  }

  initContext(pluginId?: string): Promise<any> {
    return this.globalTocReady
      .then(() => this.getContext(pluginId))
      .then(context => this.context = context)
      .catch(err => {
        console.warn(`Edc-client-js : could not get context from plugin [${this.currentPluginId}]`);
      });
  }

  /**
   * get the toc for the given export
   * if exportId is not defined return the toc for the current export
   * @param {string} targetPluginId the identifier of the export
   * @return {Promise<Toc>} the toc of the export
   */
  getToc(targetPluginId?: string): Promise<Toc> {
    return this.globalTocReady.then((tocs: MultiToc) => {
      const pluginId = this.checkPluginId(targetPluginId);
      if (pluginId) {
        return get<Toc>(edcClientService.findExportById(tocs.exports, pluginId), 'toc');
      }
    });
  }

  /**
   * return the info content from the export "info" file
   * @param {string} pluginId
   * @return {Promise<any>}
   */
  getInfo(pluginId?: string): Promise<Info> {
    return this.getHelpContent(pluginId, ContentTypeSuffix.TYPE_INFO_SUFFIX);
  }

  /**
   * return the contextual Help from the export "context" file
   * if the pluginId defining the export is not defined, use current export or the export by default
   * @param {string} pluginId the identifier of the plugin associated with the export
   * @return {Promise<any>} the
   */
  getContext(pluginId?: string): Promise<any> {
    // set the current export before requesting help content to make sure we hit the right context
    this.setCurrentPluginId(pluginId);
    return this.getHelpContent(pluginId, ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
  }

  getHelpContent(targetExport: string, suffix: ContentTypeSuffix): Promise<any> {
    if (isNil(this.currentPluginId)) {
      return this.globalTocReady.then(() => {
        const exportId = this.checkPluginId(targetExport);
        if (exportId) {
          return edcClientService.getHelpContent(`${this.baseURL}/${exportId}`, suffix);
        }
      });
    }
    return edcClientService.getHelpContent(`${this.baseURL}/${this.currentPluginId}`, suffix);
  }

  /**
   * return contextual help content
   * if pluginId is not defined, it will try and find the content in the current plugin Id export
   * @param {string} mainKey the main key of the requested contextual help element
   * @param {string} subKey the secondary key of the requested contextual help element
   * @param {string} pluginId the pluginId defining the export the contextual help element belongs to
   * @param {string} lang the identifier of the used lang
   * @return {Promise<Helper>} a promise containing the contextual help content
   */
  getHelper(mainKey: string, subKey: string, pluginId: string, lang = 'en'): Promise<Helper> {
    let helper: Helper;
    let deferred: Promise<any> = this.contextReady;
    if (!deferred || (pluginId && this.currentPluginId !== pluginId)) {
      // if context is not ready or we're trying to reach another product content, reinitialize context with the new plugin Id
      deferred = this.initContext(pluginId);
    }
    return deferred
      .then(() => {
        helper = this.getKey(mainKey, subKey, lang);
        if (helper) {
          return PromiseEs6.all(
            [ edcClientService.getContent<Helper>(this.baseURL, helper), ...helper.articles.map(article => edcClientService.getContent<Article>(this.baseURL, article)) ]
          );
        } else {
          console.warn(`Edc-client-js : Contextual help not found for the main key [${mainKey}] and subKey [${subKey}]`);
        }
      })
      .then(() => helper);
  }

  /**
   * get the documentation from its id
   * and set the requested documentation's export as the current one
   * @param {number} id the identifier of the documentation
   * @return {Promise<Documentation>} an object containing the requested doc and a boolean true if export's context has changed
   */
  getDocumentation(id: number): Promise<DocumentationTransfer> {
    return this.globalTocReady.then(() => {
      const docFromId = edcClientService.getDocumentationById(this.globalToc, id);
      if (docFromId) {
        return edcClientService.getContent<Documentation>(this.baseURL, docFromId).then((doc => {
          const exportId = getPluginIdFromDocumentId(this.globalToc, id);
          const hasExportChanged = this.isPluginIdNew(exportId);
          this.setCurrentPluginId(exportId);
          doc.exportId = this.currentPluginId;
          return new DocumentationTransfer(doc, hasExportChanged);
        }));
      } else {
        console.warn(`Edc-client-js : Documentation [${id}] not found in table of content`);
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

  getPluginId(): string {
    return this.getCurrentPluginId();
  }

  getKey(key: string, subKey: string, lang: string): Helper {
    return get<Helper>(this.context, `['${key}']['${subKey}']['${lang}']`);
  }

  getCurrentPluginId(): string {
    if (!isNil(this.currentPluginId)) {
      return this.currentPluginId;
    }
    return get<string>(this.globalToc, 'exports[0].pluginId');
  }

  setCurrentPluginId(newPluginId: string): void {
    this.currentPluginId = this.checkPluginId(newPluginId);
  }

  checkPluginId(pluginId: string): string {
    if (this.isPluginIdNew(pluginId) && this.isPluginIdPresent(pluginId)) {
      return pluginId;
    }
    return this.getCurrentPluginId();
  }

  isPluginIdPresent(pluginId: string): boolean {
    if (!this.globalToc || isEmpty(this.globalToc.exports)) {
      return false;
    }
    return !isNil(pluginId) && some(this.globalToc.exports, (docExport: DocumentationExport) => docExport.pluginId === pluginId);
  }

  isPluginIdNew(newPluginId: string): boolean {
    return newPluginId && this.currentPluginId !== newPluginId;
  }

}
