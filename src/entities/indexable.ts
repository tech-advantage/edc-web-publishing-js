import { Documentation } from './documentation';

export interface Indexable {
  id: number;
  children?: Documentation[];
}
