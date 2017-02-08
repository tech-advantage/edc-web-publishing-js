import { assign, map, get } from 'lodash';
import { Promise } from 'es6-promise';
import axios from 'axios';
import { Helper } from './entities/helper';
import { Loadable } from './entities/loadable';
import { Toc } from './entities/toc';
import { Utils } from './utils/utils';
import { Documentation } from './entities/documentation';

export class EdcClient {
  context: any;
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
    this.tocReady = this.getToc();
  }

  getContext(): Promise<any> {
    return axios.get(`${this.baseURL}/context.json`).then(res => this.context = res.data);
  }

  /**
   * returns a promise retrieving all the informationMaps of the table of contents
   * for each informationMap, generates the indexTree and assign it to the general toc index
   * @return {Promise<R>} a promise containing the informationMaps and setting the general toc index
   */
  getToc(): Promise<any> {
    return axios.get(`${this.baseURL}/toc.json`)
      .then(res => this.toc = <Toc>res.data)
      .then(res => {

        return Promise.all(map(res.informationMaps, (informationMap, key) => axios.get(`${this.baseURL}/${informationMap.file}`)
          .then(content => {
          informationMap = assign(informationMap, content.data);
          // define children property so informationMap can implement Indexable
          informationMap.children = [informationMap.en];
          // then assign the generated index tree to the toc index
            this.toc.index = assign(this.toc.index, Utils.indexTree([informationMap], `informationMaps[${key}]`, true));
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
}
