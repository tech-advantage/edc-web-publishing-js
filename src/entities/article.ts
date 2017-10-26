import { Loadable } from './loadable';

export class Article implements Loadable {
  exportId: string;
  label: string;
  url: string;
  content?: string;
}
