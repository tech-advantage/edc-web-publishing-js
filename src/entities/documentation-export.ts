import { Toc } from './toc';

export class DocumentationExport {

  constructor(public pluginId: string,
              public productId: number,
              public toc: Toc = new Toc()) {}
}
