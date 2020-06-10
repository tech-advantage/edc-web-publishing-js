import { Loadable } from './loadable';

export class PopoverLabel implements Loadable {
  exportId: string;
  url: string;
  content?: string;
  articles?: string;
  links?: string;
}
