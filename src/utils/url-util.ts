export class UrlUtil {

    static readonly I18N_DEFAULT_SUFFIX = 'i18n';

    private readonly baseURL: string;
    private readonly helpURL: string;
    private readonly i18nURL: string; // Url for the json translation files (labels and other texts internationalization)

    constructor(baseURL: string, helpURL: string, i18nURL?: string) {
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

    getDocumentationUrl(id: number): string {
        return `${this.helpURL}/doc/${id}`;
    }

    getI18nUrl(): string {
      return this.i18nURL || `${this.baseURL}/${UrlUtil.I18N_DEFAULT_SUFFIX}`;
    }
}
