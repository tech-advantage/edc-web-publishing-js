import { LANGUAGE_CODES } from '../language-codes';

export class LanguageService {

  static readonly SYS_DEFAULT = 'en';
  static readonly LANG_SEPARATOR = '[langCode]';

  private static instance: LanguageService;

  private defaultLanguage: string;
  private currentLanguage: string;
  private languages: string[] = [];

  private constructor() {}

  public static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  init(defaultLanguage: string, currentLanguage: string, languages: string[]): string {
    this.setLanguages(languages);
    this.setDefaultLanguage(defaultLanguage);
    this.setCurrentLanguage(currentLanguage);
    return this.currentLanguage;
  }

  getDefaultLanguage(): string {
    return this.defaultLanguage;
  }

  setDefaultLanguage(code: string): void {
    this.defaultLanguage = LANGUAGE_CODES.some(c => c === code) ? code.substr(0, 2) : LanguageService.SYS_DEFAULT;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setCurrentLanguage(code: string): string {
    if (!code) {
      // If code is not defined, we'll try and use current language
      code = this.getCurrentLanguage();
    }
    this.currentLanguage = this.isLanguagePresent(code) ? code : this.defaultLanguage;
    return this.currentLanguage;
  }

  getLanguages(): string[] {
    return this.languages;
  }

  setLanguages(languages: string[] = []): void {
    this.languages = languages.filter(code => LANGUAGE_CODES.some(c => c === code));
  }

  isLanguagePresent(langCode: string): boolean {
    return this.languages && this.languages.some(code => code === langCode);
  }

  isLanguageValid(langCode: string): boolean {
    return LANGUAGE_CODES.some(code => code === langCode);
  }
}
