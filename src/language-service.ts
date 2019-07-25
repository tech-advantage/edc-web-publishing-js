export class LanguageService {

  static readonly SYS_DEFAULT = 'en';

  private defaultLanguage: string;
  private currentLanguage: string;

  constructor(defaultLanguage?: string) {
    this.defaultLanguage = defaultLanguage ? defaultLanguage.substr(0, 2) : LanguageService.SYS_DEFAULT;
    this.currentLanguage = defaultLanguage;
  }

  getDefaultLanguage(): string {
    return this.defaultLanguage;
  }

  setDefaultLanguage(code: string): void {
    this.defaultLanguage = code ? code.substr(0, 2) : LanguageService.SYS_DEFAULT;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setCurrentLanguage(code: string): void {
    this.currentLanguage = code ? code.substr(0, 2) : this.defaultLanguage;
  }
}
