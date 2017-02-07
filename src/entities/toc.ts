import { InformationMap } from './information-map';

export class Toc {
  label: string;
  informationMaps: InformationMap[];
  index: {[key: string]: string};
}
