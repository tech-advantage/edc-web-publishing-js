import { ExportInfo } from '../entities/export-info';
import { ExportInfoService } from './export-info.service';
import { firstInfo, secondInfo, thirdInfo } from '../test/myFirstProduct/info';
import { async, mockHttpClientGetContent, mock } from '../utils/test-utils';
import { EdcHttpClient } from '../http/edc-http-client';
import { LanguageService } from './language.service';
import { Info } from '../entities/info';

describe('Test info helper', () => {
  let infoService: ExportInfoService;
  let languageService: LanguageService;

  let info1: Info;
  let info2: Info;
  let info3: Info;

  beforeEach(() => {
    infoService = ExportInfoService.getInstance();
    languageService = LanguageService.getInstance();
  });

  beforeEach(() => {
    info1 = firstInfo;
    info2 = secondInfo;
    info3 = thirdInfo;
  });

  beforeEach(() => {
    spyOn(EdcHttpClient.getInstance(), 'getContent').and.callFake(mockHttpClientGetContent);
  });

  beforeEach(() => {
    infoService.initInfos();
  });

  describe('initInfos', () => {
    it('should init all product infos', async(() => {
      return infoService.initInfos().then((res: Map<string, ExportInfo>) => {
        expect(res.size).toEqual(3);
        expect(res.get('myProduct1').info).toEqual(info1);
        expect(res.get('myProduct3').info).toEqual(info2);
        expect(res.get('myProduct5').info).toEqual(info3);
        expect(infoService.getCurrentExportId()).toEqual('myProduct1');
      }).catch((err: Error) => console.error('err', err));

    }));
  });

  describe('getInfo', () => {
    it('should throw an error if no info.json found', () => {
      expect(() => infoService.getInfo(null, 'myProduct1')).toThrowError('Info.json file of plugin myProduct1 is not valid');
    });
    it('should throw an error if no info.json identifier found', () => {
      const testInfo = new Info();
      expect(testInfo.identifier).toBeUndefined();
      expect(() => infoService.getInfo(testInfo, 'myProduct2')).toThrowError('Info.json file of plugin myProduct2 is not valid');
    });
    it('should return the info', () => {
      const testInfo = mock(Info, {
          identifier: 'myProduct2',
          vendor: 'MyCompany',
          version: 'Version2',
          name: 'My title',
          defaultLanguage: 'ru',
          languages: ['ru', 'es']
        }
      );
      const resultInfo = infoService.getInfo(testInfo, 'myProduct2');

      expect(resultInfo.identifier).toEqual('myProduct2');
      expect(resultInfo.vendor).toEqual('MyCompany');
      expect(resultInfo.version).toEqual('Version2');
      expect(resultInfo.name).toEqual('My title');
      expect(resultInfo.defaultLanguage).toEqual('ru');
      expect(resultInfo.languages).toEqual(['ru', 'es']);
    });
    it('should return the info using system language if no language found', () => {
      const testInfo = mock(Info, {
          identifier: 'myProduct2',
          vendor: 'MyCompany',
          version: 'Version2',
          name: 'My title',
          defaultLanguage: undefined,
          languages: undefined
        }
      );

      const resultInfo = infoService.getInfo(testInfo, 'myProduct2');

      expect(resultInfo.identifier).toEqual('myProduct2');
      expect(resultInfo.vendor).toEqual('MyCompany');
      expect(resultInfo.version).toEqual('Version2');
      expect(resultInfo.name).toEqual('My title');
      expect(resultInfo.defaultLanguage).toEqual('en');
      expect(resultInfo.languages).toEqual(['en']);
    });
  });

  describe('getTitle', () => {
    beforeEach(() => {
      infoService.initInfos().then(() => {});
    });

    it('should return the title in default language', async(() => {
      return infoService.initInfos().then(() => infoService.getTitle())
        .then(title => {
          expect(title).toEqual('MyFirstProduct');
        })
    }));
    it('should return the title of current export in default language', async(() => {
      return infoService.initInfos().then(() => infoService.getTitle())
        .then(title => {
          expect(title).toEqual('MyFirstProduct');
          expect(infoService.getCurrentExportId()).toEqual('myProduct1');
          expect(languageService.getDefaultLanguage()).toEqual('en');
          expect(languageService.getCurrentLanguage()).toEqual('en');
          expect(languageService.getLanguages()).toEqual(['de', 'en', 'fr']);
        })
    }));
    it('should return the title of current export in current language', async(() => {
      infoService.setCurrentExportId('myProduct1');
      return infoService.initInfos('myProduct1', true, 'de').then(() => infoService.getTitle())
        .then(title => {
          expect(title).toEqual('MyFirstProduct in de');
          expect(infoService.getCurrentExportId()).toEqual('myProduct1');
          expect(languageService.getDefaultLanguage()).toEqual('en');
          expect(languageService.getCurrentLanguage()).toEqual('de');
          expect(languageService.getLanguages()).toEqual(['de', 'en', 'fr']);
        })
    }));
    it('should return the title of current export in another language', async(() => {
      return infoService.initInfos('myProduct5').then(() => infoService.getTitle())
        .then(title => {
          expect(title).toEqual('MyThirdProduct in es');
          expect(infoService.getCurrentExportId()).toEqual('myProduct5');
          expect(languageService.getDefaultLanguage()).toEqual('es');
          expect(languageService.getCurrentLanguage()).toEqual('es');
          expect(languageService.getLanguages()).toEqual(['es', 'fr']);
        })
    }));
  })

});
