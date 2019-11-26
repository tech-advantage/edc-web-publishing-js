import { ContextService } from './context.service';
import { EdcHttpClient } from '../http/edc-http-client';
import { mockHttpClientGetContent, async } from '../utils/test-utils';
import { ContextualHelp } from '../entities/contextual-help';

describe('ContextService Test', () => {
  let service: ContextService;

  beforeEach(() => {
    service = ContextService.getInstance();
  });

  beforeEach(() => {
    spyOn(EdcHttpClient.getInstance(), 'getContent').and.callFake(mockHttpClientGetContent);
  });

  describe('initialization', () => {

    it('should create service', () => {
      expect(service).toBeDefined();
    });

    it('should initialize contextual help', async(() => {
      return service.initContext('product1').then((context: ContextualHelp) => {
        expect(context).toBeDefined();
      });
    }));
  });

});
