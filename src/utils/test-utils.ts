import { assign } from 'lodash';

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
