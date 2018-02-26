import { EdcClient } from './edc-client';
import { Promise } from 'es6-promise';
import { mock, async } from './utils/test-utils';
import {} from 'jasmine';
import { MultiToc } from './entities/multi-toc';
import * as edcClientService from './edc-client-service';
import { ContentTypeSuffix } from './entities/content-type';

describe('EDC client', () => {
  let edcClient: EdcClient;
  let globalToc: MultiToc;

  describe('init', () => {
    let context;
    beforeEach(() => {
      context = {
        'mainKey': {
          'subKey': {
            'en': {
              'description': 'fake context',
              'articles': [
                {
                  'label': 'abc',
                  'url': 'def'
                }
              ]
            }
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

      globalToc = mock(MultiToc, {exports: docExportsData});
    });

    beforeEach(() => {
      spyOn(edcClientService, 'createMultiToc').and.returnValue(Promise.resolve(globalToc));
      spyOn(edcClientService, 'getHelpContent').and.returnValue(Promise.resolve(context));
      spyOn(edcClientService, 'getPluginIds').and.returnValue(Promise.resolve(['myExportId1', 'myExportId2']));
    });

    it('should init edc client', async(() => {
      const baseURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL);

      return Promise.all([ edcClient.contextReady, edcClient.globalTocReady ]).then(() => {

        expect(edcClientService.createMultiToc).toHaveBeenCalledWith(baseURL);
        expect(edcClient.globalToc).toEqual(globalToc);
        expect(edcClient.context).toEqual(context);
        expect(edcClient.baseURL).toEqual(baseURL);
        expect(edcClient.currentPluginId).toEqual('myExportId1');
        expect(edcClient.globalToc).toEqual(globalToc);

        expect(edcClientService.getHelpContent).toHaveBeenCalledWith('http://base.url:8080/help/myExportId1', ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
      });
    }));

    it('should init with right product if constructor is called with product2', async(() => {
      const baseURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, 'myExportId2');

      return Promise.all([ edcClient.contextReady, edcClient.globalTocReady ]).then(() => {

        expect(edcClientService.createMultiToc).toHaveBeenCalledWith(baseURL);
        expect(edcClientService.getPluginIds).toHaveBeenCalledWith(baseURL);
        expect(edcClient.globalToc).toEqual(globalToc);
        expect(edcClient.context).toEqual(context);
        expect(edcClient.baseURL).toEqual(baseURL);
        expect(edcClient.currentPluginId).toEqual('myExportId2');

        expect(edcClientService.getHelpContent).toHaveBeenCalledWith('http://base.url:8080/help/myExportId2', ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
      });
    }));

    it('should init contextual help only if boolean is true', async(() => {
      const baseURL = 'http://base.url:8080/help';
      edcClient = new EdcClient(baseURL, 'myExportId2', true);

      return Promise.all([ edcClient.contextReady, edcClient.globalTocReady ]).then(() => {

        expect(edcClientService.createMultiToc).toHaveBeenCalledTimes(0);
        expect(edcClientService.getPluginIds).toHaveBeenCalledWith(baseURL);
        expect(edcClient.globalToc).toBeUndefined();
        expect(edcClient.context).toEqual(context);
        expect(edcClient.baseURL).toEqual(baseURL);
        expect(edcClient.currentPluginId).toEqual('myExportId2');

        expect(edcClientService.getHelpContent).toHaveBeenCalledWith('http://base.url:8080/help/myExportId2', ContentTypeSuffix.TYPE_CONTEXT_SUFFIX);
      });
    }));
  });
});
