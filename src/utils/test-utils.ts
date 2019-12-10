import { assign } from 'lodash';
import { Helper } from '../entities/helper';
import { ContextualHelp } from '../entities/contextual-help';
import { ContentTypeSuffix } from '../entities/content-type';
import { Promise as PromiseEs6 } from 'es6-promise';
import { ExportInfo } from '../entities/export-info';
import { firstInfo, secondInfo, thirdInfo } from '../test/myFirstProduct/info';
import { Info } from '../entities/info';
import { firstProductToc, secondProductToc, thirdProductToc } from '../test/stub-tocs';
import { BaseToc } from '../entities/toc';
import { InformationMap } from '../entities/information-map';
import { Article } from '../entities/article';

export function mock<T>(type: new(...args: any[]) => T, objet: any): T {
  const entity: T = new type();
  assign(entity, objet);
  return entity;
}

export function async(fn: any) {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;
  return function(done: () => void) {
    const result = fn();
    result.then(() => {
      done();
    });
  };
}

export const mockHttpClientGetContent = (suffix: ContentTypeSuffix, exportId?: string) => {
  const productKeys = [
    new ExportInfo('myProduct1', 1),
    new ExportInfo('myProduct3', 3),
    new ExportInfo('myProduct5', 5),
    new ExportInfo('myProduct8', 8)
  ];
  const mockedInfos = [
    firstInfo,
    secondInfo,
    thirdInfo
  ];
  const mockedTocs: BaseToc[] = [
    firstProductToc,
    secondProductToc,
    thirdProductToc
  ];
  let response: any;
  switch (suffix) {
    case ContentTypeSuffix.TYPE_MULTI_TOC_SUFFIX: {
      response = PromiseEs6.resolve(productKeys);
      break;
    }
    case ContentTypeSuffix.TYPE_INFO_SUFFIX: {
      const info: Info = mockedInfos.find((currentInfo: Info) => exportId === currentInfo.identifier);
      response = info ? PromiseEs6.resolve(info) : PromiseEs6.reject('Info not Found');
      break;
    }
    case ContentTypeSuffix.TYPE_CONTEXT_SUFFIX:
      response = PromiseEs6.resolve(mock(ContextualHelp, {
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
      }));
      break;
    case ContentTypeSuffix.TYPE_TOC_SUFFIX: {
      const foundToc: BaseToc = mockedTocs.find((toc: BaseToc) => toc.label === exportId);
      response = foundToc ? PromiseEs6.resolve(foundToc) : PromiseEs6.reject('Toc not found for export :' + exportId);
      break;
    }
    default: {
      response = PromiseEs6.resolve(null);
      break;
    }
  }
  return response;
};

export const mockHttpClientGet = (informationMaps: Map<string, InformationMap>) => (url: string) => {
  const [exportId, informationMap] = Array.from(informationMaps.entries())
    .find(([key, value]) => url.indexOf(key) > -1);

  return PromiseEs6.resolve(informationMap);
};
