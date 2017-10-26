import { Documentation } from './documentation';

export class DocumentationTransfer {
  constructor(public doc: Documentation, public hasExportChanged: boolean) {}
}
