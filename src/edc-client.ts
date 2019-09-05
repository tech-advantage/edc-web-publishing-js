import { first, isEmpty, some } from 'lodash';
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
import { UrlUtil } from './utils/url-util';
import { LanguageService } from './language-service';
import { ContextualHelp } from './entities/contextual-help';
import { Utils } from './utils/utils';
import { DocumentationExport } from './entities/documentation-export';

export class EdcClient {
  context: ContextualHelp;
  globalToc: MultiToc;
  currentPluginId: string;
  contextReady: PromiseEs6<ContextualHelp>;
  infoReady: PromiseEs6<Info>;
  globalTocReady: PromiseEs6<MultiToc>;
  urlUtil: UrlUtil;
  languageService: LanguageService = new LanguageService();
  contextOnly: boolean;

  constructor(baseURL?: string, helpURL?: string, exportId?: string, contextOnly?: boolean, i18nUrl?: string, lang?: string) {
    this.urlUtil = new UrlUtil(baseURL, helpURL, i18nUrl);
    this.contextOnly = contextOnly;
    this.init(exportId, contextOnly, lang);
  }

  init(pluginId?: string, contextOnly?: boolean, lang?: string) {
    this.infoReady = this.initInfo(pluginId, lang);
    this.contextReady = this.initContext(pluginId);
    if (!contextOnly) {
      this.globalTocReady = this.initMultiToc();
    }
  }

  initInfo(pluginId?: string, lang?: string): PromiseEs6<Info> {
    return this.getInfo(pluginId)
      .then((info: Info) => this.initLanguages(info, lang));
  }

  initContext(pluginId?: string): PromiseEs6<ContextualHelp> {
    return this.infoReady
      .then(() => this.getContext(pluginId))
      .then((context: ContextualHelp) => this.context = context)
      .catch((err: Error): ContextualHelp => {
        console.warn(`Edc-client-js : could not get context from plugin [${this.currentPluginId}]: ${err}`);
        return null;
      });
  }

  initMultiToc(): PromiseEs6<MultiToc> {
    return this.infoReady
      .then(() => edcClientService.createMultiToc(this.urlUtil.getBaseUrl(), this.languageService.getCurrentLanguage()))
      .then((multiToc: MultiToc) => this.globalToc = multiToc);
  }

  initLanguages(info: Info, currentLanguage?: string): Info {
    // First set default language
    this.languageService.setDefaultLanguage(info.defaultLanguage);
    // Then translations
    this.languageService.setLanguages(info.languages);
    // Finally the current language, if available
    this.languageService.setCurrentLanguage(currentLanguage);
    return info;
  }

  getTitle(pluginId: string, lang?: string): PromiseEs6<string> {
    return this.infoReady.then((info: Info) => {
      const langToUse: string = this.languageService.isLanguagePresent(lang) ? lang : this.languageService.getCurrentLanguage();
      return edcClientService.getTitle(info, langToUse, this.languageService.getDefaultLanguage());
    });
  }

  /**
   * get the toc for the given export
   * if exportId is not defined return the toc for the current export
   * @param {string} targetPluginId the identifier of the export
   * @return {PromiseEs6<Toc>} the toc of the export
   */
  getToc(targetPluginId?: string): PromiseEs6<Toc> {
    return this.globalTocReady.then((tocs: MultiToc) => {
      const pluginId = targetPluginId || this.currentPluginId;
      if (pluginId) {
        return Utils.safeGet<DocumentationExport, Toc>(edcClientService.findExportById(tocs.exports, pluginId), ['toc']);
      }
    });
  }

  /**
   * return the info content from the export "info" file
   * @param {string} pluginId
   * @return {PromiseEs6<any>}
   */
  getInfo(pluginId?: string): PromiseEs6<Info> {
    return this.getHelpContent(pluginId, ContentTypeSuffix.TYPE_INFO_SUFFIX);
  }

  /**
   * return the contextual Help from the export "context" file
   * if the pluginId defining the export is not defined, use current export or the export by default
   * @param {string} pluginId the identifier of the plugin associated with the export
   * @return {PromiseEs6<any>} the
   */
  getContext(pluginId: string = this.currentPluginId): PromiseEs6<ContextualHelp> {
    // set the current export before requesting help content to make sure we hit the right context
    return this.getHelpContent(pluginId, ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
  }

  getHelpContent(targetExport: string, suffix: ContentTypeSuffix): PromiseEs6<any> {
    if (this.isPluginIdNew(targetExport)) {
      return this.initPluginId(targetExport)
        .then((exportId: string) => edcClientService.getHelpContent(`${this.urlUtil.getBaseUrl()}/${exportId}`, suffix));
    }
    return edcClientService.getHelpContent(`${this.urlUtil.getBaseUrl()}/${this.currentPluginId}`, suffix);
  }

  /**
   * return contextual help content
   * if pluginId is not defined, it will try and find the content in the current plugin Id export
   * @param {string} mainKey the main key of the requested contextual help element
   * @param {string} subKey the secondary key of the requested contextual help element
   * @param {string} pluginId the pluginId defining the export the contextual help element belongs to
   * @param {string} lang the identifier of the used lang
   * @return {PromiseEs6<Helper>} a promise containing the contextual help content
   */
  getHelper(mainKey: string, subKey: string, pluginId: string, lang?: string): PromiseEs6<Helper> {
    lang = this.languageService.isLanguagePresent(lang) ? lang : this.languageService.getCurrentLanguage();
    let helper: Helper;
    let deferred: PromiseEs6<any> = this.contextReady;
    if (!deferred || this.isPluginIdNew(pluginId)) {
      // if context is not ready or we're trying to reach another product content, initialize context with the new plugin Id
      deferred = this.initContext(pluginId);
    }
    return deferred
      .then(() => {
        helper = Utils.safeGet<ContextualHelp, Helper>(this.context, [mainKey, subKey, lang]);
        if (helper) {
          return PromiseEs6.all(
            [edcClientService.getContent<Helper>(this.urlUtil.getBaseUrl(), helper),
              ...helper.articles.map(article => edcClientService.getContent<Article>(this.urlUtil.getBaseUrl(), article))]
          );
        }
      })
      .then(() => helper);
  }

  /**
   * return the documentation from its id
   * and set the requested documentation's export as the current one
   * @param {number} id the identifier of the documentation
   * @return {PromiseEs6<Documentation>} an object containing the requested doc and a boolean true if export's context has changed
   */
  getDocumentation(id: number): PromiseEs6<DocumentationTransfer> {
    return this.globalTocReady.then(() => {
      const docFromId = edcClientService.getDocumentationById(this.globalToc, id);
      if (docFromId) {
        return edcClientService.getContent<Documentation>(this.urlUtil.getBaseUrl(), docFromId)
          .then(((doc: Documentation) => {
            const exportId = edcClientService.findPluginIdFromDocumentId(this.globalToc, id);
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

  /**
   * Return the contextual web help url
   * @param mainKey the main key
   * @param subKey the sub key
   * @param languageCode the language code
   * @param articleIndex  the article index
   * @param publicationId the publication identifier (optional, if not defined, use the default publication identifier)
   */
  getContextWebHelpUrl(mainKey: string, subKey: string, languageCode: string, articleIndex: number, publicationId?: string): string {
    const pluginId = publicationId || this.currentPluginId;
    const lang = this.isLanguagePresent(languageCode) ? languageCode : this.languageService.getCurrentLanguage();
    return this.urlUtil.getContextUrl(pluginId, mainKey, subKey, lang, articleIndex);
  }

  /**
   * Return the documentation web help url.
   * @param id the documentation identifier
   * @param languageCode the language code to use
   */
  getDocumentationWebHelpUrl(id: number, languageCode?: string): string {
    const lang = this.isLanguagePresent(languageCode) ? languageCode : this.languageService.getCurrentLanguage();
    return this.urlUtil.getDocumentationUrl(id, lang);
  }

  /**
   * Return the home web help url
   */
  getHomeWebHelpUrl(): string {
    return this.urlUtil.getHomeUrl();
  }

  /**
   * Return the error web help url
   */
  getErrorWebHelpUrl(): string {
    return this.urlUtil.getErrorUrl();
  }

  /**
   * Return the url for i18n Popover translation files
   * (for translating labels and other component's contents)
   *
   */
  getPopoverI18nUrl(): string {
    return this.urlUtil.getPopoverI18nUrl();
  }

  /**
   * Return the url for i18n WebHelp translation files
   * (for translating labels and other component's contents)
   *
   */
  getWebHelpI18nUrl(): string {
    return this.urlUtil.getWebHelpI18nUrl();
  }

  getInformationMapFromDocId(id: number): PromiseEs6<InformationMap> {
    return this.globalTocReady
      .then( () => edcClientService.findIMFromDocumentationId(this.globalToc, id))
      .catch(() => PromiseEs6.resolve(null));
  }

  setCurrentPluginId(newPluginId: string): void {
    this.currentPluginId = newPluginId;
  }

  initPluginId(pluginId: string): PromiseEs6<string> {
    return edcClientService.getPluginIds(this.urlUtil.getBaseUrl())
      .then((pluginIds: string[]) => {
        if (isEmpty(pluginIds)) {
          throw new Error(`Could not init plugin : no available plugins`);
        }
        if (!isEmpty(pluginId) && !some(pluginIds, (id: string) => id === pluginId)) {
          throw new Error(`Could not init plugin : No plugin was found with id "${pluginId}"`);
        }

        this.currentPluginId = pluginId || first(pluginIds);
        return this.currentPluginId;
      });
  }

  isPluginIdNew(newPluginId: string): boolean {
    return isEmpty(this.currentPluginId) || (newPluginId && this.currentPluginId !== newPluginId);
  }

  /**
   * Return the default language code (2 letters) used in current documentation
   *
   */
  getDefaultLanguage(): string {
    return this.languageService.getDefaultLanguage();
  }

  /**
   * Return true if language was exported, as translation or default language
   *
   * @param lang the code of the language
   */
  isLanguagePresent(lang: string): boolean {
    return this.languageService.isLanguagePresent(lang);
  }

  /**
   * Set the current language used for current documentation
   * update of context and globalToc
   *
   * @param lang the 2 letters language code (en, fr..) to set
   */
  changeCurrentLanguage(lang: string): PromiseEs6<string> {
    const currentLang = this.languageService.getCurrentLanguage();
    if (lang && lang !== currentLang) {
      // Reinitialize global information, including languages
      this.infoReady = this.initInfo(this.currentPluginId, lang);
      // Reinitialize context
      this.contextReady = this.initContext(this.currentPluginId);
      let deferred: PromiseEs6<ContextualHelp | MultiToc> = this.contextReady;
      if (!this.contextOnly) {
        // If for the web explorer, reset the multiToc as well
        this.globalTocReady = this.initMultiToc();
        deferred = this.globalTocReady;
      }
      return deferred.then(() => this.languageService.getCurrentLanguage());
    }
    return PromiseEs6.resolve(currentLang);
  }

}
