import { EdcClient } from './edc-client';
import { mock, async, mockHttpClientGetContent, mockHttpClientGet } from './utils/test-utils';
import { MultiToc } from './entities/multi-toc';
import { ContextualHelp } from './entities/contextual-help';
import { Helper } from './entities/helper';
import { Article } from './entities/article';
import { Info } from './entities/info';
import { EdcHttpClient } from './http/edc-http-client';
import { informationMaps } from './test/information-maps-stub';
import { ExportInfo } from './entities/export-info';

describe('EDC client', () => {
  let edcClient: EdcClient;
  let info: Info;
  let globalToc: MultiToc;
  let context: ContextualHelp;

  beforeEach(() => {

    info = mock(Info, {
      defaultLanguage: 'ru',
      languages: ['ru', 'en', 'fr']
    });

    context = {
      'mainKey': {
        'subKey': {
          'en': mock(Helper, {
            'description': 'fake context',
            'articles': [
              mock(Article, {
                'label': 'abc',
                'url': 'def'
              })
            ]
          })
        }
      }
    };
    const docExportsData = [
      {
        pluginId: 'myExportId1',
        productId: 'myProductId1'
      },
      {
        pluginId: 'myExportId2',
        productId: 'myProductId2'
      }
    ];

    globalToc = mock(MultiToc, { exports: docExportsData });
  });

  beforeEach(() => {
  });

  describe('init', () => {

    beforeEach(() => {
      spyOn(EdcHttpClient.getInstance(), 'getContent').and.callFake(mockHttpClientGetContent);
      spyOn(EdcHttpClient.getInstance(), 'getFile').and.callFake(mockHttpClientGet(informationMaps));
    });

    it('should init edc client', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      edcClient = new EdcClient(baseURL);

      return edcClient.getContent().then((exportInfo: ExportInfo) => {
        expect(exportInfo).toBeDefined();
        expect(edcClient.getCurrentLanguage()).toEqual('en');
        expect(edcClient.getDefaultLanguage()).toEqual('en');
      });
    }));

    it('should init with right product if constructor is called with myProduct5', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myProduct5');
      return edcClient.getContent().then((exportInfo: ExportInfo) => {
        expect(exportInfo).toBeDefined();

        expect(edcClient.getCurrentLanguage()).toEqual('es');
        expect(edcClient.getDefaultLanguage()).toEqual('es');
      });
    }));
  });

  describe('Runtime', () => {

    beforeEach(() => {
      spyOn(EdcHttpClient.getInstance(), 'getContent').and.callFake(mockHttpClientGetContent);
      spyOn(EdcHttpClient.getInstance(), 'getFile').and.callFake(mockHttpClientGet(informationMaps));
    });

    it('should get documentation url with default language', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myProduct5');
      return edcClient.getContent().then(() => {
        expect(edcClient.getDocumentationWebHelpUrl(12)).toEqual('http://base.url:8080/help/doc/myProduct5/12/es');
      });
    }));

    it('should get documentation url with requested language', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myProduct5');
      return edcClient.getContent().then(() => {
        expect(edcClient.getDocumentationWebHelpUrl(12, 'fr')).toEqual('http://base.url:8080/help/doc/myProduct5/12/fr');
      });
    }));

    it('should get documentation url with no language if requested is not valid', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myProduct5');
      return edcClient.getContent().then(() => {
        expect(edcClient.getDocumentationWebHelpUrl(12, 'xx')).toEqual('http://base.url:8080/help/doc/myProduct5/12/es');
      });
    }));

    it('should get context url with default publication Id', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myProduct1');
      return edcClient.getContent().then(() => {
        expect(edcClient.getContextWebHelpUrl('fr.techad.edc', 'types', 'en', 1)).toEqual('http://base.url:8080/help/context/myProduct1/fr.techad.edc/types/en/1');
      });
    }));

    it('should get context url with other publication Id', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myProduct5');
      return edcClient.getContent().then(() => {
        expect(edcClient.getContextWebHelpUrl('fr.techad.edc', 'types', 'en', 1, 'edcHelp')).toEqual('http://base.url:8080/help/context/edcHelp/fr.techad.edc/types/en/1');
      });
    }));

    it('should get home url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');
      return edcClient.getContent().then(() => {
        expect(edcClient.getHomeWebHelpUrl()).toEqual('http://base.url:8080/help/home');
      });
    }));

    it('should get error url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');
      return edcClient.getContent().then(() => {
        expect(edcClient.getErrorWebHelpUrl()).toEqual('http://base.url:8080/help/error');
      });
    }));

    it('should get popover i18n url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');

      return edcClient.getContent().then(() => {
        expect(edcClient.getPopoverI18nUrl()).toEqual('http://base.url:8080/doc/i18n/popover');
      });
    }));

    it('should get web help i18n url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');

      return edcClient.getContent().then(() => {
        expect(edcClient.getWebHelpI18nUrl()).toEqual('http://base.url:8080/doc/i18n/web-help');
      });
    }));

    it('should get custom i18n url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      const i18nURL = 'http://base.url:8080/customI18N/i18n/custom';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2', true, i18nURL);

      return edcClient.getContent().then(() => {
        expect(edcClient.getPopoverI18nUrl()).toEqual(i18nURL);
        expect(edcClient.getWebHelpI18nUrl()).toEqual(i18nURL);
      });
    }));
  });
});
