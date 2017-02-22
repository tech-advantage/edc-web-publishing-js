import { ArticleType } from './article-type';

export class Link {
  constructor(
    public id: number,
    public label: string,
    public type: ArticleType,
    public url: string
  ) {}
}
