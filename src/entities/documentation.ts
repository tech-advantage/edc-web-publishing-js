import { Loadable } from './loadable';
import { Indexable } from './indexable';

export class Documentation implements Loadable, Indexable {
  id: number;
  label: string;
  children: Documentation[];
  url: string;
  content?: string;
}
