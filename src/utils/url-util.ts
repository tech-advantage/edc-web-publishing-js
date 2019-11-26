import { ContentsPresentInExports, ContentTypeSuffix } from '../entities/content-type';

export class UrlUtil {

    static getFileUrl(baseUrl: string, fileName: string, exportId?: string): string {
      const exportIdPrefix = exportId ? `${exportId}/` : '';
      return `${baseUrl}/${exportIdPrefix}${fileName}`;
    }

    static getContentUrl(baseUrl: string, contentType: ContentTypeSuffix, exportId?: string): string {
      const exportIdMissing = ContentsPresentInExports.indexOf(contentType) > -1 && !exportId;
      if (exportIdMissing) {
        return null;
      }
      const exportIdPrefix = exportId ? `${exportId}` : '';
      const typeSuffix = contentType ? `${contentType}` : '';

      return `${baseUrl}/${exportIdPrefix}${typeSuffix}`;
    }
}
