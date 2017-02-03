import { Promise } from 'es6-promise';
import axios from 'axios';
import { Helper } from './entities/helper';
import { Loadable } from './entities/loadable';

export class EdcClient {
  context: any;
  ready: Promise<any>;
  baseURL: string;

  constructor(baseURL?: string) {
    this.init(baseURL);
  }

  init(baseURL: string) {
    this.baseURL = baseURL;
    axios.create();

    this.ready = this.getContext();
  }

  getContext(): Promise<any> {
    return axios.get(`${this.baseURL}/context.json`).then(res => this.context = res.data);
  }

  getHelper(key: string, subKey: string, lang: string = 'en'): Promise<Helper> {
    let helper = this.getKey(key, subKey, lang);
    if (!helper) {
      return Promise.resolve(undefined);
    }

    return Promise.all([this.getContent(helper), ...helper.articles.map(article => this.getContent(article))])
      .then(() => helper);
  }

  getContent(item: Loadable): Promise<Loadable> {
    return axios.get(`${this.baseURL}/${item.url}`)
      .then(res => {
        item.content = res.data;
        return item;
      });
  }

  getKey(key: string, subKey: string, lang: string): Helper {
    if (this.context[key] &&
      this.context[key][subKey] &&
      this.context[key][subKey][lang]) {
      return this.context[key][subKey][lang];
    }
  }
}
