import { ContentService } from './content.service';
import { async, mockHttpClientGet, mockHttpClientGetContent } from '../utils/test-utils';
import { EdcHttpClient } from '../http/edc-http-client';
import { informationMaps } from '../test/information-maps-stub';
import { ExportInfo } from '../entities/export-info';

describe('Content helper test', () => {
  let contentService: ContentService;

  beforeEach(() => {
    contentService = ContentService.getInstance();
  });

  beforeEach(() => {
    spyOn(EdcHttpClient.getInstance(), 'getContent').and.callFake(mockHttpClientGetContent);
    spyOn(EdcHttpClient.getInstance(), 'getFile').and.callFake(mockHttpClientGet(informationMaps));
  });

  describe('init ContentService', () => {
    it('should create Instance', () => {
      expect(contentService).toBeDefined();
    });

    it('should init and select first product', async(() => {
      return contentService.initContent().then((exportInfo: ExportInfo) => {
        expect(contentService.getContentReady()).toBeDefined();
        expect(exportInfo).toBeDefined();

        expect(contentService.getInfos()).toBeDefined();
        expect(contentService.getInfos().get('myProduct1')).toBeDefined();
        expect(contentService.getInfos().get('myProduct1').info.defaultLanguage).toEqual('en');
        expect(contentService.getCurrentPluginId()).toEqual('myProduct1');
      });
    }));

    it('should init with myProduct5', async(() => {
      return contentService.initContent('myProduct5').then((exportInfo: ExportInfo) => {
        expect(contentService.getContentReady()).toBeDefined();
        expect(exportInfo).toBeDefined();
        expect(contentService.getInfos()).toBeDefined();
        expect(contentService.getInfos().get('myProduct5')).toBeDefined();
        expect(contentService.getInfos().get('myProduct5').info.defaultLanguage).toEqual('es');
        expect(contentService.getCurrentPluginId()).toEqual('myProduct5');
      });
    }));
  })

});
