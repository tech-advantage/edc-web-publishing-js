import { EdcClient } from './edc-client';
import { Promise } from 'es6-promise';
import { mock, async } from './utils/test-utils';
import { MultiToc } from './entities/multi-toc';
import * as edcClientService from './edc-client-service';
import { ContentTypeSuffix } from './entities/content-type';
import { ContextualHelp } from './entities/contextual-help';
import { Helper } from './entities/helper';
import { Article } from './entities/article';
import { Info } from './entities/info';

describe('EDC client', () => {
  let edcClient: EdcClient;
  let info: Info;
  let globalToc: MultiToc;
  let context: ContextualHelp;

  beforeEach(() => {

    info = mock(Info, {
      languageId: 'ru'
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
    spyOn(edcClientService, 'createMultiToc').and.returnValue(Promise.resolve(globalToc));
    spyOn(edcClientService, 'getHelpContent').and.callFake((exportIdentifier: string, suffix: ContentTypeSuffix) => {
      if (suffix === ContentTypeSuffix.TYPE_CONTEXT_SUFFIX) {
        return Promise.resolve(context);
      }
      if (suffix === ContentTypeSuffix.TYPE_INFO_SUFFIX) {
        return Promise.resolve(info);
      }
    });
    spyOn(edcClientService, 'getPluginIds').and.returnValue(Promise.resolve(['myExportId1', 'myExportId2']));
  });

  describe('init', () => {

    it('should init edc client', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      edcClient = new EdcClient(baseURL);

      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {

        expect(edcClientService.createMultiToc).toHaveBeenCalledWith(baseURL);
        expect(edcClient.globalToc).toEqual(globalToc);
        expect(edcClient.context).toEqual(context);
        expect(edcClient.urlUtil.getBaseUrl()).toEqual(baseURL);
        expect(edcClient.currentPluginId).toEqual('myExportId1');
        expect(edcClient.globalToc).toEqual(globalToc);

        expect(edcClientService.getHelpContent).toHaveBeenCalledWith('http://base.url:8080/doc/myExportId1', ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
      });
    }));

    it('should init with right product if constructor is called with product2', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');

      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {

        expect(edcClientService.createMultiToc).toHaveBeenCalledWith(baseURL);
        expect(edcClientService.getPluginIds).toHaveBeenCalledWith(baseURL);
        expect(edcClient.globalToc).toEqual(globalToc);
        expect(edcClient.context).toEqual(context);
        expect(edcClient.urlUtil.getBaseUrl()).toEqual(baseURL);
        expect(edcClient.currentPluginId).toEqual('myExportId2');

        expect(edcClientService.getHelpContent).toHaveBeenCalledWith('http://base.url:8080/doc/myExportId2', ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
      });
    }));

    it('should init contextual help only if boolean is true', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2', true);

      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {

        expect(edcClientService.createMultiToc).toHaveBeenCalledTimes(0);
        expect(edcClientService.getPluginIds).toHaveBeenCalledWith(baseURL);
        expect(edcClient.globalToc).toBeUndefined();
        expect(edcClient.context).toEqual(context);
        expect(edcClient.urlUtil.getBaseUrl()).toEqual(baseURL);
        expect(edcClient.currentPluginId).toEqual('myExportId2');
        // Should have init based on info.json defaultLanguageId value
        expect(edcClient.languageService.getDefaultLanguage()).toEqual('ru');
        expect(edcClient.languageService.getCurrentLanguage()).toEqual('ru');

        expect(edcClientService.getHelpContent).toHaveBeenCalledWith('http://base.url:8080/doc/myExportId2', ContentTypeSuffix.TYPE_INFO_SUFFIX);
        expect(edcClientService.getHelpContent).toHaveBeenCalledWith('http://base.url:8080/doc/myExportId2', ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
      });
    }));
  });

  describe('Runtime', () => {

    it('should get documentation url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');
      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {
        expect(edcClient.getDocumentationWebHelpUrl(12)).toEqual('http://base.url:8080/help/doc/12');
      });
    }));

    it('should get context url with default publication Id', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');
      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {
        expect(edcClient.getContextWebHelpUrl('fr.techad.edc', 'types', 'en', 1)).toEqual('http://base.url:8080/help/context/myExportId2/fr.techad.edc/types/en/1');
      });
    }));

    it('should get context url with other publication Id', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');
      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {
        expect(edcClient.getContextWebHelpUrl('fr.techad.edc', 'types', 'en', 1, 'edcHelp')).toEqual('http://base.url:8080/help/context/edcHelp/fr.techad.edc/types/en/1');
      });
    }));

    it('should get home url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');
      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {
        expect(edcClient.getHomeWebHelpUrl()).toEqual('http://base.url:8080/help/home');
      });
    }));

    it('should get error url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');
      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {
        expect(edcClient.getErrorWebHelpUrl()).toEqual('http://base.url:8080/help/error');
      });
    }));

    it('should get default i18n url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2');

      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {
        expect(edcClient.getI18nUrl()).toEqual('http://base.url:8080/doc/i18n');
      });
    }));

    it('should get custom i18n url', async(() => {
      const baseURL = 'http://base.url:8080/doc';
      const helpURL = 'http://base.url:8080/help';
      const i18nURL = 'http://base.url:8080/customI18N/i18n';
      edcClient = new EdcClient(baseURL, helpURL, 'myExportId2', true, i18nURL);

      return Promise.all([edcClient.contextReady, edcClient.globalTocReady]).then(() => {
        expect(edcClient.getI18nUrl()).toEqual('http://base.url:8080/customI18N/i18n');
      });
    }));
  });
});
