import { assign } from 'lodash';
import { Helper } from '../entities/helper';
import { ContextualHelp } from '../entities/contextual-help';

export function mock<T>(type: { new(... args: any[]): T; }, objet: any): T {
  const entity: T = new type();
  assign(entity, objet);
  return entity;
}

export function async(fn: any) {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;
  return function (done: () => void) {
    const result = fn();
    result.then(() => {
      done();
    });
  };
}

export function mockContext(translations: string[]): any {

  let contextWithFr: ContextualHelp;
  let contextWithOutFr: ContextualHelp;
  let contextIncomplete: ContextualHelp;

  contextWithFr = {
    'main.key.one': {
      'sub.key.one': {},
      'sub.key.two': {}
    },
    'main.key.two': {
      'sub.key.one.bis': {
        en: mock(Helper, { description: 'description in english' }),
        fr: mock(Helper, { description: 'description en français' }),
      }
    }
  };
  contextWithOutFr = {
    'other.main.key': {
      'sub.key.one': {},
      'sub.key.two': {
        en: mock(Helper, { description: 'description 2 in english' })
      }
    },
    'main.key.two': {
      'sub.key.one.bis': {}
    }
  };
  contextIncomplete = {
    'main.key.one': {},
  };
}
