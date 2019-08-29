import { LANGUAGE_CODES } from './language-codes';

export class LanguageService {

  static readonly SYS_DEFAULT = 'en';

  private defaultLanguage: string;
  private currentLanguage: string;
  private languages: string[];

  constructor(defaultLanguage?: string, languages: string[] = []) {
    this.setDefaultLanguage(defaultLanguage);
    this.setLanguages(languages);
    this.setCurrentLanguage(defaultLanguage);
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
    this.currentLanguage = this.isLanguagePresent(code) ? code.substr(0, 2) : this.defaultLanguage;
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
}
