import { Helper } from './entities/helper';
import { Toc } from './entities/toc';
import { InformationMap } from './entities/information-map';
import { Promise as PromiseEs6 } from 'es6-promise';
import { DocumentationTransfer } from './entities/documentation-transfer';
import { ContentService } from './services/content.service';
import { UrlConfigService } from './services/url-config.service';
import { LanguageService } from './services/language.service';
import { ExportInfo } from './entities/export-info';

export class EdcClient {
  private contentService: ContentService;
  private urlConfigService: UrlConfigService;

  private languageService: LanguageService;

  constructor(baseURL?: string, helpURL?: string, exportId?: string, contextOnly?: boolean, i18nUrl?: string, lang?: string) {
    this.urlConfigService = UrlConfigService.getInstance();
    this.urlConfigService.setURLs(baseURL, helpURL, i18nUrl);
    this.languageService = LanguageService.getInstance();
    this.contentService = ContentService.getInstance();
    this.contentService.initContent(exportId, contextOnly, lang);
  }

  /**
   * Return the current content
   * Will perform content initialization if it wasn't loaded yet
   *
   * The requested language will be set if it was present in the export
   * if not, default language will be used instead
   * Current language of the export info specifies which language was used for the requested content
   *
   * @param exportId the identifier of the export
   * @param contextOnly will skip the loading of the table of content if true
   * @param langCode the requested language to use as default
   *
   * @return {PromiseEs6<ExportInfo>} a promise containing the export information
   */
  getContent(exportId?: string, contextOnly?: boolean, langCode?: string): any {
    return this.contentService.getContentReady(exportId, contextOnly, langCode);
  }


  /**
   * Return the title of the current export Id
   * Will perform content initialization if it wasn't loaded yet
   *
   * @return {PromiseEs6<string>} a promise containing the title
   */
  getTitle(): any {
    return this.contentService.getTitle();
  }

  /**
   * Get the table of content (toc) for the given export
   * if exportId is not defined return the toc for the current export
   *
   * @param {string} exportId the identifier of the export
   * @return {PromiseEs6<Toc>} the toc of the export
   */
  getToc(exportId?: string): PromiseEs6<Toc> {
    return this.contentService.getToc(exportId);
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
  getHelper(mainKey: string, subKey: string, pluginId: string, lang?: string): any {
    return this.getContent().then(() => this.contentService.getContext(mainKey, subKey, pluginId, lang));
  }

  /**
   * Return the documentation from its id
   * and set the requested documentation's export as the current one
   * @param {number} id the identifier of the documentation
   * @param {string} langCode the 2 letters code of the requested language
   * @param {string} exportId id the identifier of the documentation export
   * @return {PromiseEs6<DocumentationTransfer>} an object containing the requested doc transfer
   */
  getDocumentation(id: number, langCode: string, exportId?: string): PromiseEs6<DocumentationTransfer> {
    return this.getContent().then(() => this.contentService.getDocumentation(id, langCode, exportId));
  }

  /**
   * Returns the url for loading the contextual help in the web help explorer (edc-help-ng).
   *
   * @param mainKey the main key
   * @param subKey the sub key
   * @param languageCode the language code
   * @param articleIndex  the article index
   * @param publicationId the publication identifier (optional, if not defined, use the default publication identifier)
   */
  getContextWebHelpUrl(mainKey: string, subKey: string, languageCode: string, articleIndex: number, publicationId?: string): string {
    const pluginId = publicationId || this.contentService.getCurrentPluginId();
    const lang = this.languageService.isLanguageValid(languageCode) ? languageCode : this.languageService.getCurrentLanguage();
    return this.urlConfigService.getContextUrl(pluginId, mainKey, subKey, lang, articleIndex);
  }

  /**
   * Returns the url for loading the documentation in the web help explorer (edc-help-ng).
   *
   * @param id the documentation identifier
   * @param languageCode the language code to use
   */
  getDocumentationWebHelpUrl(id: number, languageCode?: string): string {
    const lang = this.languageService.isLanguagePresent(languageCode) ? languageCode : this.languageService.getCurrentLanguage();
    const exportId = this.contentService.getCurrentPluginId();
    return this.urlConfigService.getDocumentationUrl(id, lang, exportId);
  }

  /**
   * Return the home web help url
   */
  getHomeWebHelpUrl(): string {
    return this.urlConfigService.getHomeUrl();
  }

  /**
   * Return the error web help url
   */
  getErrorWebHelpUrl(): string {
    return this.urlConfigService.getErrorUrl();
  }

  /**
   * Return the url for i18n Popover translation files
   * (for translating labels and other component's contents)
   *
   */
  getPopoverI18nUrl(): string {
    return this.urlConfigService.getPopoverI18nUrl();
  }

  /**
   * Return the url for i18n WebHelp translation files
   * (for translating labels and other component's contents)
   *
   */
  getWebHelpI18nUrl(): string {
    return this.urlConfigService.getWebHelpI18nUrl();
  }

  /**
   * Returns the information map of the given documentation.
   *
   * @param id: the identifier of the documentation
   */
  getInformationMapFromDocId(id: number): PromiseEs6<InformationMap> {
    return this.contentService.getInformationMapFromDocId(id);
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

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }

}
