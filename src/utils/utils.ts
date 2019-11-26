import { Promise as PromiseEs6 } from 'es6-promise';
import { Loadable } from '../entities/loadable';
import { EdcHttpClient } from '../http/edc-http-client';

export class Utils {

  // static checkMultiDocContent(content: any): boolean {
  //   if (typeof content === 'string') {
  //     return false;
  //   }
  //   return Utils.isMultiTocContentValid(content);
  // }
  //
  // static isMultiTocContentValid(exportsContent: any[]): boolean {
  //   const result = !chain(exportsContent)
  //     .map((exportContent: any) => exportContent.pluginId)
  //     .isEmpty()
  //     .valueOf();
  //   return result;
  // }

  static safeGet<T, G>(source: T, properties: string[]): G {
    if (!properties || !properties.length) {
      return null;
    }
    let currentSrc: {[key: string]: any} = source;
    properties.forEach((prop: string) => {
      currentSrc = prop && currentSrc && currentSrc[prop] ? currentSrc[prop] : null;
    });
    return currentSrc as G;
  }

  static getContent<T extends Loadable>(item: T, httpClient: EdcHttpClient): PromiseEs6<T> {
    if (!item || !item.url || !httpClient) {
      return null;
    }
    return httpClient.getFile(item.url)
      .then((content: string) => {
        item.content = content;
        return item;
      }, (): T => null)
      .catch((): T => null);
  }

}
