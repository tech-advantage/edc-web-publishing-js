import { InformationMap } from './information-map';

export class Toc {
  label: string;
  toc: InformationMap[];
  index: {[key: string]: string};
}
