import { EdcClient } from './src/edc-client';

declare let window: any;
window.EdcClient = EdcClient;

export * from './src/edc-client';
export {Article} from './src/entities/article';
export {Helper} from './src/entities/helper';