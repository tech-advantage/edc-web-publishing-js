import { DocumentationService } from './documentation.service';
import { ExportInfo } from '../entities/export-info';
import { mock, mockHttpClientGetContent, async, mockHttpClientGet } from '../utils/test-utils';
import { Info } from '../entities/info';
import { EdcHttpClient } from '../http/edc-http-client';
import {
  informationMap1,
  informationMap3,
  informationMap4,
  informationMap7,
  informationMap11,
  informationMaps
} from '../test/information-maps-stub';
import { DocumentationExport } from '../entities/documentation-export';
import { Toc } from '../entities/toc';
import { Documentation } from '../entities/documentation';
import { InformationMap } from '../entities/information-map';

describe('DocumentationService test', () => {

  let service: DocumentationService;

  // Data
  let productInfo1: ExportInfo;
  let productInfo2: ExportInfo;
  let productInfo3: ExportInfo;
  let productInfos: Map<string, ExportInfo> = new Map();

  beforeEach(() => {
    service = DocumentationService.getInstance();
  });

  beforeEach(() => {
    productInfo1 = mock(ExportInfo, {
      exportId: 'myProduct1',
      productId: 1,
      info: mock(Info, {
        defaultLanguage: 'en'
      })
    });
    productInfo2 = mock(ExportInfo, {
      exportId: 'myProduct3',
      productId: 3,
      info: mock(Info, {
        defaultLanguage: 'fr'
      })
    });
    productInfo3 = mock(ExportInfo, {
      exportId: 'myProduct5',
      productId: 5,
      info: mock(Info, {
        defaultLanguage: 'ru'
      })
    });
    productInfos.clear();
    productInfos.set('myProduct1', productInfo1);
    productInfos.set('myProduct3', productInfo2);
    productInfos.set('myProduct5', productInfo3);
  });

  beforeEach(() => {
    spyOn(EdcHttpClient.getInstance(), 'getContent').and.callFake(mockHttpClientGetContent);
    spyOn(EdcHttpClient.getInstance(), 'getFile').and.callFake(mockHttpClientGet(informationMaps));
  });

  describe('init', () => {
    it('should create instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('readTocs', () => {
    it('should read tocs', async(() => {
      return service.readTocs(productInfos).then((docExports: DocumentationExport[]) => {
        expect(docExports).toBeDefined();
        expect(docExports.length).toEqual(3);
        expect(docExports[0].toc.toc.length).toEqual(3);
        expect(docExports[0].toc.toc[0]).toEqual(informationMap1);
        expect(docExports[0].toc.toc[1]).toEqual(informationMap3);
        expect(docExports[0].toc.toc[2]).toEqual(informationMap4);
        expect(docExports[1].toc.toc.length).toEqual(1);
        expect(docExports[1].toc.toc[0]).toEqual(informationMap7);
        expect(docExports[2].toc.toc.length).toEqual(1);
        expect(docExports[2].toc.toc[0]).toEqual(informationMap11);
      })
    }));
  });

  describe('createIndex', () => {
    let docExport: DocumentationExport;
    let docExport2: DocumentationExport;
    let docExport3: DocumentationExport;
    let docExports: DocumentationExport[];
    beforeEach(() => {
      docExport = mock(DocumentationExport, {
        pluginId: 'myProduct1',
        toc: mock(Toc, { label: 'myProduct1', toc: [informationMap1, informationMap4, informationMap1] })
      });
      docExport2 = mock(DocumentationExport, {
        pluginId: 'myProduct2',
        toc: mock(Toc, { label: 'myProduct2', toc: [informationMap7] })
      });
      docExport3 = mock(DocumentationExport, {
        pluginId: 'myProduct3',
        toc: mock(Toc, { label: 'myProduct3', toc: [informationMap11] })
      });
      docExports = [docExport, docExport2];
    });
    it('should generate index', () => {
      const index = service.createIndex(docExports);
      expect(index).toBeDefined();
    });
  });

  describe('createIndexOfExport', () => {
    let docExport: DocumentationExport;
    beforeEach(() => {
      docExport = mock(DocumentationExport, {
        pluginId: 'myProduct1',
        toc: mock(Toc, { label: 'myProduct1', toc: [informationMap1, informationMap4, informationMap1] })
      });
    });
    it('should generate index', () => {
      const index = service.createIndexOfExport(docExport, 0);
      expect(index).toBeDefined();
    });
  });

  describe('Runtime', () => {
    beforeEach(() => {
      return service.initMultiToc(productInfos);
    });

    describe('getDocumentation', () => {
      it('should return the right documentation in the right language', () => {
        service.getDocumentation(41, 'fr')
          .then((documentation: Documentation) => {
            expect(documentation).toBeDefined();
            expect(documentation.id).toEqual(41);
            expect(documentation.label).toEqual('document 41 in french');
            expect(documentation.topics).toBeDefined();
          });
      });

      it('should return the right documentation in the default language', () => {
        service.getDocumentation(41,  'ru', 'en')
          .then((documentation: Documentation) => {
            expect(documentation).toBeDefined();
            expect(documentation.id).toEqual(41);
            expect(documentation.label).toEqual('document 41 in english');
            expect(documentation.topics).toBeDefined();
          });
      });

    });

    describe('findPluginIdFromDocumentationId', () => {
      it('should return the right plugin id', () => {
        service.findPluginIdFromDocumentationId(100).then(pluginId => {
          expect(pluginId).toEqual('myProduct5');
        });
      });
      it('should return undefined', () => {
        service.findPluginIdFromDocumentationId(undefined).then(pluginId => {
          expect(pluginId).toBeUndefined();
        });
      });
    });

    describe('getInformationMapFromDocId', () => {
      it('should return the right plugin id', () => {
        service.getInformationMapFromDocId(100).then((informationMap: InformationMap) => {
          expect(informationMap).toBeDefined();
          expect(informationMap.id).toEqual(11);
        });
      });
      it('should return the right plugin id', () => {
        service.getInformationMapFromDocId(undefined).then((informationMap: InformationMap) => {
          expect(informationMap).toBeUndefined();
        });
      });
    })

  });

});
