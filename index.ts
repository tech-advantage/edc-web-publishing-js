import { EdcClient } from './src/edc-client';

declare let window: any;
window.EdcClient = EdcClient;

export * from './src/edc-client';
export {Article} from './src/entities/article';
export {Documentation} from './src/entities/documentation';
export {Toc} from './src/entities/toc';
export {InformationMap} from './src/entities/information-map';
export {Helper} from './src/entities/helper';
