import { LanguageService } from './language-service';
import { ContextualHelp } from './entities/contextual-help';
import { mock } from './utils/test-utils';
import { Helper } from './entities/helper';

describe('LanguageService test', () => {
  let contextWithFr: ContextualHelp;
  let contextWithOutFr: ContextualHelp;
  let contextIncomplete: ContextualHelp;

  let languageService: LanguageService;

  beforeEach(() => {
    languageService = new LanguageService();
  });

  beforeEach(() => {
    contextWithFr = {
      'main.key.one': {
        'sub.key.one': {},
        'sub.key.two': {}
      },
      'main.key.two': {
        'sub.key.one.bis': {
          en: mock(Helper, { description: 'description in english' }),
          fr: mock(Helper, { description: 'description en français' }),
        }
      }
    };
    contextWithOutFr = {
      'other.main.key': {
        'sub.key.one': {},
        'sub.key.two': {
          en: mock(Helper, { description: 'description 2 in english' })
        }
      },
      'main.key.two': {
        'sub.key.one.bis': {}
      }
    };
    contextIncomplete = {
      'main.key.one': {},
    };
  });

  describe('isTranslationPresent', () => {
    it('should return true if language is present in any context content', () => {
      // Given we have a contextual helper with translations in french
      const contentToCheck = contextWithFr;

      // When checking if French is present
      const result = languageService.isTranslationPresent(contentToCheck, 'fr');

      // Then result should be true
      expect(result).toBeTruthy();
    });
    it('should return false if language is not present in any context content', () => {
      // Given we have a contextual helper with no translations in french
      const contentToCheck = contextWithOutFr;

      // When checking if French is present
      const result = languageService.isTranslationPresent(contentToCheck, 'fr');

      // Then result should be false
      expect(result).toBeFalsy();
    });
    it('should return true if only requested language is present', () => {
      // Given we have a contextual helper with translations in english
      const contentToCheck = contextWithOutFr;

      // When checking if english is present
      const result = languageService.isTranslationPresent(contentToCheck, 'en');

      // Then result should be true
      expect(result).toBeTruthy();
    });
    it('should return false if no key is present', () => {
      // Given we have a contextual helper with no content and incomplete keys/subkeys
      const contentToCheck = contextIncomplete;

      // When checking for a language presence
      const result = languageService.isTranslationPresent(contentToCheck, 'en');

      // Then result should be false
      expect(result).toBeFalsy();
    });
  });

  describe('setCurrentLanguage', () => {
    it('should set fr', () => {
      // Given current language is fr, and there is some content in fr in the exported context
      const contentToCheck = contextWithFr;

      const lang = languageService.setCurrentLanguage(contentToCheck, 'fr');

      expect(languageService.getCurrentLanguage()).toEqual('fr');
      expect(lang).toEqual('fr');
    });
    it('should set default language if no export in given language', () => {
      // Given current language is fr, and there is NO content in fr in the exported context
      const contentToCheck = contextWithOutFr;
      languageService.setDefaultLanguage('it');

      const lang = languageService.setCurrentLanguage(contentToCheck, 'fr');

      expect(languageService.getCurrentLanguage()).toEqual('it');
      expect(lang).toEqual('it');
    });
    it('should set default language if export is incomplete', () => {
      // Given current language is fr, and there is NO content in fr in the exported context
      const contentToCheck = contextIncomplete;
      languageService.setDefaultLanguage('ru');

      const lang = languageService.setCurrentLanguage(contentToCheck, 'fr');

      expect(languageService.getCurrentLanguage()).toEqual('ru');
      expect(lang).toEqual('ru');
    });
    it('should set default language if no export is found', () => {
      // Given current language is fr, and there is NO content in fr in the exported context
      languageService.setDefaultLanguage('de');

      const lang = languageService.setCurrentLanguage(undefined, 'fr');

      expect(languageService.getCurrentLanguage()).toEqual('de');
      expect(lang).toEqual('de');
    });
  });

});
