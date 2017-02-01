import { Loadable } from './loadable';

export class Article implements Loadable {
  label: string;
  url: string;
  content?: string;
}
