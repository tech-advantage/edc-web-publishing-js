import { EdcClient } from './edc-client';
import axios from 'axios';
import { Promise } from 'es6-promise';

describe('EDC client', () => {
  let edcClient;

  describe('init', () => {
    it('should init edc client', () => {
      spyOn(axios, 'create');
      spyOn(axios, 'get').and.returnValue(Promise.resolve({}));

      edcClient = new EdcClient('http://base.url:8080/help');
      edcClient.ready.then(() => {
        expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://base.url:8080/help'});
        expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/context.json');
      });
    });
  });

  describe('runtime', () => {
    beforeEach(() => {
      edcClient = new EdcClient('http://base.url:8080/help');
    });

    it('should get context', () => {
      spyOn(axios, 'get').and.returnValue(Promise.resolve({}));

      edcClient.getContext();

      expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/context.json');
    });

    it('should get helper', () => {
      edcClient.context = {
        foo: {
          bar: {
            en: 'baz'
          }
        }
      };

      expect(edcClient.getHelper('foo', 'bar', 'en')).toBe('baz');

    });
  });
});
