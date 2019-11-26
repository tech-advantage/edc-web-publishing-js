import { InformationMap } from './information-map';

export class Toc {
  label: string;
  toc: InformationMap[];

  constructor(label?: string, toc?: InformationMap[]) {
    this.label = label;
    this.toc = toc;
  }
}

export class BaseToc {
  label: string;
  toc: TocInfo[];
}

export class TocInfo {
  id: string;
  file: string;
}
