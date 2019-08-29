import { LanguageService } from './language-service';

describe('LanguageService test', () => {

  let languageService: LanguageService;

  beforeEach(() => {
    languageService = new LanguageService('en', ['de', 'fr']);
  });

  describe('isLanguagePresent', () => {

    it('should return true if language is in languages list', () => {
      // Given some languages
      languageService.setLanguages(['de', 'fr']);

      // When checking if French is present
      const result = languageService.isLanguagePresent('fr');

      // Then result should be true
      expect(result).toBeTruthy();
    });
    it('should return true if language is default language', () => {
      // Given some languages
      languageService.setLanguages(['en', 'de', 'fr']);

      // When checking if en is present
      const result = languageService.isLanguagePresent('en');

      // Then result should be true
      expect(result).toBeTruthy();
    });
    it('should return false if language is not present', () => {
      // Given some languages
      languageService.setLanguages(['de', 'es']);

      // When checking if French is present
      const result = languageService.isLanguagePresent('fr');

      // Then result should be false
      expect(result).toBeFalsy();
    });
    it('should return false if no language is defined', () => {
      // Given no languages
      languageService.setLanguages([]);

      // When checking if english is present
      const result = languageService.isLanguagePresent('en');

      // Then result should be false
      expect(result).toBeFalsy();
    });
    it('should return false if language to check is null', () => {
      // Given some languages
      languageService.setLanguages(['de']);

      // When language is null
      const result = languageService.isLanguagePresent(null);

      // Then result should be false
      expect(result).toBeFalsy();
    });
  });

  describe('setCurrentLanguage', () => {

    beforeEach(() => {
      languageService.setDefaultLanguage('en');
    });

    it('should set fr', () => {
      // Given some languages
      languageService.setLanguages(['de', 'fr']);

      const lang = languageService.setCurrentLanguage('fr');

      expect(languageService.getCurrentLanguage()).toEqual('fr');
      expect(languageService.getDefaultLanguage()).toEqual('en');
      expect(lang).toEqual('fr');
    });
    it('should set default language if no export in given language', () => {
      // Given some languages
      languageService.setLanguages(['it']);

      const lang = languageService.setCurrentLanguage('fr');

      expect(languageService.getCurrentLanguage()).toEqual('en');
      expect(languageService.getDefaultLanguage()).toEqual('en');
      expect(lang).toEqual('en');
    });
    it('should set default language if not defined', () => {
      // Given current language is fr, and there is NO content in fr in the exported context
      languageService.setLanguages(['it']);

      const lang = languageService.setCurrentLanguage(undefined);

      expect(languageService.getCurrentLanguage()).toEqual('en');
      expect(languageService.getDefaultLanguage()).toEqual('en');
      expect(lang).toEqual('en');
    });
  });

});
