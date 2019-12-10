import { Documentation } from './documentation';

export class DocumentationTransfer {
  constructor(public doc: Documentation,
              public exportId: string,
              public hasExportChanged: boolean,
              public resolvedLanguage: string) {}
}
