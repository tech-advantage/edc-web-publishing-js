export class Utils {

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

}
