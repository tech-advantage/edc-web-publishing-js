import { ContextualHelp } from './entities/contextual-help';

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

  setCurrentLanguage(context: ContextualHelp, code: string): string {
    // Before setting a current language, check if there's any present content in context helper for the requested language
    if (!context || !this.isTranslationPresent(context, code)) {
      // If not, then use default
      code = this.getDefaultLanguage();
    }
    this.currentLanguage = code ? code.substr(0, 2) : this.defaultLanguage;
    return this.currentLanguage;
  }

  isTranslationPresent(context: ContextualHelp, langCode: string): boolean {
    return Object.keys(context).some(contextKey => Object.keys(context[contextKey])
      .some(subKey => Object.keys(context[contextKey][subKey]).some(lang => lang === langCode))
    );
  }
}
