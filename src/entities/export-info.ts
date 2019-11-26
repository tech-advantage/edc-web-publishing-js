import { Info } from './info';

export class ExportInfo {
  constructor(public pluginId: string,
              public productId: number,
              public info?: Info,
              public currentLanguage?: string) {
  }
}
