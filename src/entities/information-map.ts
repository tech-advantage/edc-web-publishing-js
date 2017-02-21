import { Documentation } from './documentation';
import { Indexable } from './indexable';

export class InformationMap implements Indexable {
  id: number;
  label: string;
  file: string;
  topics?: Documentation[];
  en: Documentation;
}
