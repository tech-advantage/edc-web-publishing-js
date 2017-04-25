import { assign, map, get, split } from 'lodash';
import axios from 'axios';
import { Promise } from 'es6-promise';
import { Helper } from './entities/helper';
import { Loadable } from './entities/loadable';
import { Toc } from './entities/toc';
import { Utils } from './utils/utils';
import { Documentation } from './entities/documentation';
import { InformationMap } from './entities/information-map';
import { Info } from './entities/info';
import { ResourceType, ResouceExtension, ResourceName } from './entities/resource-type';

export class EdcClient {
  context: any;
  info: Info;
  toc: Toc;
  contextReady: Promise<any>;
  tocReady: Promise<Toc>;
  baseURL: string;

  constructor(baseURL?: string) {
    this.init(baseURL);
  }

  init(baseURL: string) {
    this.baseURL = baseURL;
    axios.create();

    this.contextReady = this.getContext();
    this.tocReady = this.initToc();
  }

  getInfo(): Promise<Info> {
    return axios.get(`${this.baseURL}/info.json`).then(res => this.info = res.data);
  }

  getContext(): Promise<any> {
    return axios.get(`${this.baseURL}/context.json`).then(res => this.context = res.data);
  }

  getResource(type: ResourceType): Promise<any> {
    return axios.get(`${this.baseURL}/${ResourceName[type]}`, {responseType: 'arraybuffer'}).then(res => this.encode(res.data, type));
  }

  getToc() {
    return this.tocReady;
  }

  /**
   * returns a promise retrieving all the informationMaps of the table of contents
   * for each informationMap, generates the indexTree and assign it to the general toc index
   * @return {Promise<R>} a promise containing the table of contents and setting the general toc index
   */
  initToc(): Promise<any> {
    return axios.get(`${this.baseURL}/toc.json`)
      .then(res => this.toc = <Toc>res.data)
      .then(res => {
        const tocs = get<InformationMap[]>(res, 'toc');
        return Promise.all(map(tocs, (toc, key) => axios.get(`${this.baseURL}/${toc.file}`)
          .then(content => {
            toc = assign(toc, content.data);
            // define topics property so informationMap can implement Indexable
            toc.topics = [toc.en];
            // then assign the generated index tree to the toc index
            this.toc.index = assign(this.toc.index, Utils.indexTree([toc], `toc[${key}]`, true));
          }))).then(() => res);
      });
  }

  getHelper(key: string, subKey: string, lang: string = 'en'): Promise<Helper> {
    let helper: Helper;
    return this.contextReady
      .then(() => {
        helper = this.getKey(key, subKey, lang);
        if (helper) {
          return Promise.all([ this.getContent(helper), ...helper.articles.map(article => this.getContent(article)) ]);
        } else {
          return Promise.reject(undefined);
        }
      })
      .then(() => helper);
  }

  getDocumentation(id: number): Promise<Documentation> {
    return this.tocReady.then(() => {
      let path = this.toc.index[id];
      let doc = get<Documentation>(this.toc, path);
      return this.getContent(doc);
    });
  }

  getInformationMapFromDocId(id: number): Promise<InformationMap> {
    return this.tocReady.then(() => {
      const path = this.toc.index[id];
      const imPath = split(path, '.')[0];
      return get<InformationMap>(this.toc, imPath);
    });
  }

  getContent(item: Loadable): Promise<Loadable> {
    return axios.get(`${this.baseURL}/${item.url}`)
      .then(res => {
        item.content = res.data;
        return item;
      });
  }

  getKey(key: string, subKey: string, lang: string): Helper {
    return get<Helper>(this.context, `['${key}']['${subKey}']['${lang}']`);
  }

  private encode(arrayBuffer: Uint8Array, type: ResourceType) {
    const b64encoded = btoa([].reduce.call(new Uint8Array(arrayBuffer), (p: any, c: any) => p + String.fromCharCode(c), ''));
    const mimetype = `image/${ResouceExtension[type]}`;
    return `data:${mimetype};base64,${b64encoded}`;
  }

}
