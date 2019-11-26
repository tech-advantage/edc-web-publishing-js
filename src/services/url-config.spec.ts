import { UrlConfigService } from './url-config.service';

describe('url util', () => {
  let urlConfigService: UrlConfigService;
  beforeEach(() => {
    urlConfigService = UrlConfigService.getInstance();
    urlConfigService.setURLs('http://localhost:8080', 'http://localhost:8080/help', 'http://localhost:8080/doc/i18n');
  });

  it('should return the documentation url', () => {
    expect(urlConfigService.getDocumentationUrl(12)).toEqual('http://localhost:8080/help/doc/12');
  });

  it('should return the documentation url with requested language', () => {
    expect(urlConfigService.getDocumentationUrl(12, 'en')).toEqual('http://localhost:8080/help/doc/12/en');
  });

  it('should return the conxtextual url', () => {
    expect(urlConfigService.getContextUrl('edcHelp', 'fr.techad.edc', 'types', 'en', 1)).toEqual('http://localhost:8080/help/context/edcHelp/fr.techad.edc/types/en/1');
  });

  it('should return the error url', () => {
    expect(urlConfigService.getErrorUrl()).toEqual('http://localhost:8080/help/error');
  });

  it('should return the home url', () => {
    expect(urlConfigService.getHomeUrl()).toEqual('http://localhost:8080/help/home');
  });
});
