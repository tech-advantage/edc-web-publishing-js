import { Link } from './link';
import { Article } from './article';

export interface Linkable {
  links: Link[];
  articles?: Article[];
}
