export enum ContentTypeSuffix {
  TYPE_MULTI_TOC_SUFFIX = '/multi-doc.json',
  TYPE_CONTEXT_SUFFIX = '/context.json',
  TYPE_INFO_SUFFIX = '/info.json',
  TYPE_TOC_SUFFIX = '/toc.json',
  TYPE_EMPTY_SUFFIX = ''
}

// Types of content that are under the exportId directory
export const ContentsPresentInExports = [
  ContentTypeSuffix.TYPE_INFO_SUFFIX,
  ContentTypeSuffix.TYPE_CONTEXT_SUFFIX,
  ContentTypeSuffix.TYPE_TOC_SUFFIX
];
