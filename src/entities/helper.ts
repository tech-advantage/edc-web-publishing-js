import { Article } from './article';
import { Loadable } from './loadable';
import { Link } from './link';
import { Linkable } from './linkable';

export class Helper implements Loadable, Linkable {
  exportId: string;
  label: string;
  description: string;
  url: string;
  content?: string;
  articles: Article[];
  links: Link[];
}
