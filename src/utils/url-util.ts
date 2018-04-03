export class UrlUtil {

    private readonly helpURL: string;

    constructor(helpURL: string) {
        this.helpURL = helpURL;
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
}
