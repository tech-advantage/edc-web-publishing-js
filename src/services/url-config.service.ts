import { ContentTypeSuffix } from '../entities/content-type';
import { UrlUtil } from '../utils/url-util';

export class UrlConfigService {

  static readonly I18N_ROOT_FOLDER = 'i18n';
  static readonly I18N_POPOVER_FOLDER = 'popover';
  static readonly I18N_WEB_HELP_FOLDER = 'web-help';

  private static instance: UrlConfigService;

  private baseURL: string;
  private helpURL: string;
  private i18nURL: string;

  private constructor() {}

  public static getInstance(): UrlConfigService {
    if (!UrlConfigService.instance) {
      UrlConfigService.instance = new UrlConfigService();
    }
    return UrlConfigService.instance;
  }

  setURLs(baseURL: string, helpURL: string, i18nURL: string) {
    this.baseURL = baseURL;
    this.helpURL = helpURL;
    this.i18nURL = i18nURL;
  }

  getBaseUrl(): string {
    return this.baseURL;
  }

  getHomeUrl(): string {
    return this.helpURL + '/home';
  }

  getErrorUrl(): string {
    return this.helpURL + '/error';
  }

  getContextUrl(publicationId: string, mainKey: string, subKey: string, languageCode: string, articleIndex: number): string {
    return `${this.helpURL}/context/${publicationId}/${mainKey}/${subKey}/${languageCode}/${articleIndex}`;
  }

  getDocumentationUrl(id: number, lang?: string, exportId?: string): string {
    const exportIdPrefix = exportId ? `${exportId}/` : '';
    const langSuffix = lang ? `/${lang}` : '';
    return `${this.helpURL}/doc/${exportIdPrefix}${id}${langSuffix}`;
  }

  getI18nBaseUrl(): string {
    return `${this.baseURL}/${UrlConfigService.I18N_ROOT_FOLDER}`;
  }

  getWebHelpI18nUrl(): string {
    return `${this.getI18nBaseUrl()}/${UrlConfigService.I18N_WEB_HELP_FOLDER}`;
  }

  getPopoverI18nUrl(): string {
    return `${this.getI18nBaseUrl()}/${UrlConfigService.I18N_POPOVER_FOLDER}`;
  }

  getFileUrl(fileUrl: string, exportId?: string): string {
    return UrlUtil.getFileUrl(this.getBaseUrl(), fileUrl, exportId);
  }

  getContentUrl(contentType: ContentTypeSuffix, exportId?: string): string {
    return UrlUtil.getContentUrl(this.getBaseUrl(), contentType, exportId);
  }

  getPopoverLabelsPath(lang: string): string {
    return `${UrlConfigService.I18N_ROOT_FOLDER}/${UrlConfigService.I18N_POPOVER_FOLDER}/${lang}.json`;
  }
}
