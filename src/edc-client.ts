import { Promise } from 'es6-promise';
import axios from 'axios';

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

  getHelper(primaryKey: string, subKey: string, lang: string = 'en') {
    if (this.context[primaryKey] &&
      this.context[primaryKey][subKey] &&
      this.context[primaryKey][subKey][lang]) {
      return this.context[primaryKey][subKey][lang];
    }
  }
}
