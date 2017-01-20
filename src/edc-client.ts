import { Promise } from 'es6-promise';
import axios from 'axios';

declare let window: any;

export class EdcClient {
  context: any;

  constructor(baseURL?: string) {
    axios.create({baseURL});

    this.getContext();
  }

  getContext(): Promise<any> {
    return axios.get('/context.json').then(res => this.context = res.data);
  }

  getHelper(primaryKey: string, subKey: string, lang: string = 'en') {
    if (this.context[primaryKey] &&
      this.context[primaryKey][subKey] &&
      this.context[primaryKey][subKey][lang]) {
      return this.context[primaryKey][subKey][lang];
    }
  }
}
