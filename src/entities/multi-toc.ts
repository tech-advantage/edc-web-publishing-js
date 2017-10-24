import { DocumentationExport } from './documentation-export';

export class MultiToc {

  constructor(
    public exports: DocumentationExport[] = [],
    public index: {[key: string]: string} = {}) {}
}
