import { Article } from './article';
import { Loadable } from './loadable';

export class Helper implements Loadable {
  label: string;
  description: string;
  url: string;
  content?: string;
  articles: Article[];
}
