import { Promise } from 'es6-promise';
import axios from 'axios';
import { Article } from './entities/article';
import { Helper } from './entities/helper';

export class EdcClient {
  context: any;
  ready: Promise<any>;

  constructor(public baseURL?: string) {
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

    return Promise.all(helper.articles.map(article => {
        this.getArticle(article);
      }))
      .then(() => helper);
  }

  getArticle(article: Article): Promise<Article> {
    return axios.get(this.baseURL + article.url)
      .then(res => {
        article.content = res.data;
        return article;
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
