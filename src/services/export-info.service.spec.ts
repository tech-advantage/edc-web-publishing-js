import { ExportInfo } from '../entities/export-info';
import { ExportInfoService } from './export-info.service';
import { firstInfo } from '../test/myFirstProduct/info';
import { async, mockHttpClientGetContent } from '../utils/test-utils';
import { EdcHttpClient } from '../http/edc-http-client';
import { LanguageService } from './language.service';

describe('Test info helper', () => {
  let infoService: ExportInfoService;
  let languageService: LanguageService;

  beforeEach(() => {
    infoService = ExportInfoService.getInstance();
    languageService = LanguageService.getInstance();
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
        expect(res.get('myProduct1').info).toEqual(firstInfo);
      }).catch((err: Error) => console.error('err', err));

    }));
    it('should init all plugin infos and select the first product', async(() => {
      return infoService.initInfos().then((res: Map<string, ExportInfo>) => {
        expect(res.size).toEqual(3);
        expect(res.get('myProduct1').info).toEqual(firstInfo);
      }).catch((err: Error) => console.error('err', err));
    }));
  });

  describe('getTitle', () => {
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
    it('should return the title of current export in default language', async(() => {
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
