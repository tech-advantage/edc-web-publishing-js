import { Loadable } from './loadable';
import { Indexable } from './indexable';
import { Linkable } from './linkable';
import { Link } from './link';

export class Documentation implements Loadable, Indexable, Linkable {
  id: number;
  label: string;
  topics: Documentation[];
  url: string;
  content?: string;
  links: Link[];
}
