import { Utils } from './utils';
import { mock } from './test-utils';
import { ContextualHelp } from '../entities/contextual-help';
import { Helper } from '../entities/helper';

describe('utils', () => {

  describe('safeGet', () => {
    let sourceObj: ContextualHelp;

    beforeEach(() => {
      sourceObj = {
        'main.key': {
          'sub.key.one': {},
          'sub.key.two': {
            en: mock(Helper, {description: 'description 2 in english'})
          }
        }
      };
    });
    it('should return the property', () => {
      const property = Utils.safeGet<ContextualHelp, string>(sourceObj, ['main.key', 'sub.key.two', 'en', 'description']);

      expect(property).toEqual('description 2 in english');
    });

    it('should return null if one property is not defined', () => {
      const property = Utils.safeGet<ContextualHelp, string>(sourceObj, ['main.key', 'sub.key.two', 'description']);

      expect(property).toEqual(null);
    });

    it('should return null if main object is undefined', () => {
      const property = Utils.safeGet<ContextualHelp, string>(undefined, ['main.key', 'sub.key.two', 'description']);

      expect(property).toEqual(null);
    });

    it('should return null if main object is null', () => {
      const property = Utils.safeGet<ContextualHelp, string>(null, ['main.key', 'sub.key.two', 'description']);

      expect(property).toEqual(null);
    });

    it('should return null if keys are undefined', () => {
      const property = Utils.safeGet<ContextualHelp, string>(sourceObj, undefined);

      expect(property).toEqual(null);
    });
  });
});
