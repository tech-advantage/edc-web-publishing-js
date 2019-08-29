export class Info {
  vendor: string;
  version: string;
  name: string;
  titles: { [key: string]: {title: string} };
  identifier: string;
  defaultLanguage: string; // Language used by default
  languages: string[]; // Languages presents in this export
}
