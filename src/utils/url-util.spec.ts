import { UrlUtil } from './url-util';

describe('url util', () => {
    const urlUtil = new UrlUtil('http://localhost:8080', 'http://localhost:8080/help');
    it('should return the documentation url', () => {
        expect(urlUtil.getDocumentationUrl(12)).toEqual('http://localhost:8080/help/doc/12');
    });

    it('should return the conxtextual url', () => {
        expect(urlUtil.getContextUrl('edcHelp', 'fr.techad.edc', 'types', 'en', 1)).toEqual('http://localhost:8080/help/context/edcHelp/fr.techad.edc/types/en/1');
    });

    it('should return the error url', () => {
        expect(urlUtil.getErrorUrl()).toEqual('http://localhost:8080/help/error');
    });

    it('should return the home url', () => {
        expect(urlUtil.getHomeUrl()).toEqual('http://localhost:8080/help/home');
    });
});
