import { Documentation } from './documentation';
import { Indexable } from './indexable';
import { Contents } from './contents';

export class InformationMap extends Contents<Documentation> implements Indexable {
  id: number;
  label: string;
  file: string;
  topics?: Documentation[];
}
