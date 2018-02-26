import { first, get, isEmpty, join, some, split } from 'lodash';
import { Helper } from './entities/helper';
import { Toc } from './entities/toc';
import { MultiToc } from './entities/multi-toc';
import { Documentation } from './entities/documentation';
import { InformationMap } from './entities/information-map';
import { Promise as PromiseEs6 } from 'es6-promise';
import { Article } from './entities/article';
import * as edcClientService from './edc-client-service';
import { ContentTypeSuffix } from './entities/content-type';
import { DocumentationTransfer } from './entities/documentation-transfer';
import { Info } from './entities/info';

export class EdcClient {
  context: any;
  globalToc: MultiToc;
  currentPluginId: string;
  contextReady: Promise<any>;
  globalTocReady: Promise<MultiToc>;
  baseURL: string;

  constructor(baseURL?: string, exportId?: string, contextOnly?: boolean) {
    this.baseURL = baseURL;
    this.init(exportId, contextOnly);
  }

  init(pluginId?: string, contextOnly?: boolean) {
    this.contextReady = this.initContext(pluginId);
    if (!contextOnly) {
      this.globalTocReady = this.initMultiToc();
    }
  }

  initContext(pluginId?: string): Promise<any> {
    return this.getContext(pluginId)
      .then(context => this.context = context)
      .catch(err => {
        console.warn(`Edc-client-js : could not get context from plugin [${this.currentPluginId}]: ${err}`);
      });
  }

  initMultiToc(): Promise<MultiToc> {
    return edcClientService.createMultiToc(this.baseURL)
      .then((multiToc: MultiToc) => this.globalToc = multiToc);
  }

  /**
   * get the toc for the given export
   * if exportId is not defined return the toc for the current export
   * @param {string} targetPluginId the identifier of the export
   * @return {Promise<Toc>} the toc of the export
   */
  getToc(targetPluginId?: string): Promise<Toc> {
    return this.globalTocReady.then((tocs: MultiToc) => {
      const pluginId = targetPluginId || this.currentPluginId;
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
    return this.getHelpContent(pluginId, ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
  }

  getHelpContent(targetExport: string, suffix: ContentTypeSuffix): Promise<any> {
    if (this.isPluginIdNew(targetExport)) {
      return this.initPluginId(targetExport)
        .then(exportId =>  edcClientService.getHelpContent(`${this.baseURL}/${exportId}`, suffix));
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
    if (!deferred || this.isPluginIdNew(pluginId)) {
      // if context is not ready or we're trying to reach another product content, initialize context with the new plugin Id
      deferred = this.initContext(pluginId);
    }
    return deferred
      .then(() => {
        helper = this.getKey(mainKey, subKey, lang);
        if (helper) {
          return PromiseEs6.all(
            [ edcClientService.getContent<Helper>(this.baseURL, helper),
              ...helper.articles.map(article => edcClientService.getContent<Article>(this.baseURL, article)) ]
          );
        }
      })
      .then(() => helper);
  }

  /**
   * return the documentation from its id
   * and set the requested documentation's export as the current one
   * @param {number} id the identifier of the documentation
   * @return {Promise<Documentation>} an object containing the requested doc and a boolean true if export's context has changed
   */
  getDocumentation(id: number): Promise<DocumentationTransfer> {
    return this.globalTocReady.then(() => {
      const docFromId = edcClientService.getDocumentationById(this.globalToc, id);
      if (docFromId) {
        return edcClientService.getContent<Documentation>(this.baseURL, docFromId).then((doc => {
          const exportId = edcClientService.getPluginIdFromDocumentId(this.globalToc, id);
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

  getKey(key: string, subKey: string, lang: string): Helper {
    return get<Helper>(this.context, `['${key}']['${subKey}']['${lang}']`);
  }

  setCurrentPluginId(newPluginId: string): void {
    this.currentPluginId = newPluginId;
  }

  initPluginId(pluginId: string): Promise<any> {
    return edcClientService.getPluginIds(this.baseURL)
      .then((pluginIds: string[]) => {
        if (isEmpty(pluginIds)) {
          throw new Error(`Could not init plugin : no available plugins`);
        }
        if (!isEmpty(pluginId) && !some(pluginIds, id => id === pluginId)) {
          throw new Error(`Could not init plugin : No plugin was found with id "${pluginId}"`);
        }

        this.currentPluginId = pluginId || first(pluginIds);
        return this.currentPluginId;
      });
  }

  isPluginIdNew(newPluginId: string): boolean {
    return isEmpty(this.currentPluginId) || (newPluginId && this.currentPluginId !== newPluginId);
  }

}
