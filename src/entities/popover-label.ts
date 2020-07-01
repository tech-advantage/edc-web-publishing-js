import { Loadable } from './loadable';
import { PopoverError } from './popover-error';

export class PopoverLabel implements Loadable {
  exportId: string;
  url: string;
  content?: string;
  articles?: string;
  links?: string;
  iconAlt?: string;
  comingSoon?: string;
  errorTitle?: string;
  errors: PopoverError;
}
