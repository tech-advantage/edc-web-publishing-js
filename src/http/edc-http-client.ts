import { get } from 'lodash';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Promise as PromiseEs6 } from 'es6-promise';
import { ContentTypeSuffix } from '../entities/content-type';
import { UrlConfigService } from '../services/url-config.service';

export class EdcHttpClient {

  private static instance: EdcHttpClient;

  private constructor(private readonly urlConfigService: UrlConfigService) {}

  public static getInstance(): EdcHttpClient {
    if (!EdcHttpClient.instance) {
      EdcHttpClient.instance = new EdcHttpClient(UrlConfigService.getInstance());
    }
    return EdcHttpClient.instance;
  }

  getFile(fileName: string, exportId?: string): any {
    const url = this.urlConfigService.getFileUrl(fileName, exportId);
    if (!url) {
      return PromiseEs6.reject('Invalid url');
    }
    return axios.get(url)
      .then((res: AxiosResponse) => get(res, 'status') === 200 ? res.data : null,
        (err: AxiosError) => PromiseEs6.reject(err));
  }

  getContent(suffix: ContentTypeSuffix, exportId?: string): any {
    const url = this.urlConfigService.getContentUrl(suffix, exportId);
    if (!url) {
      return PromiseEs6.reject('Invalid url');
    }
    return axios.get(url)
      .then((res: AxiosResponse) => get(res, 'status') === 200 ? res.data : null,
        (err: AxiosError) => PromiseEs6.reject(err));
  }
}
