import { EdcClient } from './src/edc-client';

declare const window: any;
window.EdcClient = EdcClient;

export * from './src/edc-client';
export { Article } from './src/entities/article';
export { Documentation } from './src/entities/documentation';
export { Info } from './src/entities/info';
export { ExportInfo } from './src/entities/export-info';
export { Link } from './src/entities/link';
export { Linkable } from './src/entities/linkable';
export { ArticleType } from './src/entities/article-type';
export { Toc } from './src/entities/toc';
export { InformationMap } from './src/entities/information-map';
export { Helper } from './src/entities/helper';
export { DocumentationTransfer } from './src/entities/documentation-transfer';
export { PopoverLabel } from './src/entities/popover-label'
