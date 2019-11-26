import { UrlUtil } from './url-util';

describe('url util', () => {
  describe('getFileUrl', () => {
    it('should return the file url', () => {
        const fileUrl = UrlUtil.getFileUrl('http://localhost/doc', 'my-file.json');
        expect(fileUrl).toEqual('http://localhost/doc/my-file.json');
    });
    it('should return the file url with export prefix', () => {
        const fileUrl = UrlUtil.getFileUrl('http://localhost/doc', 'my-file.json', 'myExport1');
        expect(fileUrl).toEqual('http://localhost/doc/myExport1/my-file.json');
    });
  });
});
