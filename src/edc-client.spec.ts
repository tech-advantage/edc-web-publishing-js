import { EdcClient } from './edc-client';
import axios from 'axios';
import { Promise } from 'es6-promise';

describe('EDC client', () => {
  let edcClient: EdcClient;

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
    let context;

    beforeEach(() => {
      edcClient = new EdcClient('http://base.url:8080/help');

      context = {
        'foo' : {
          'bar': {
            'en': {
              'description': 'Comments help',
              'articles': [
                {
                  'label': 'foo',
                  'url': 'bar'
                }
              ]
            }
          }
        }
      };

      edcClient.context = context;
    });

    it('should get context', () => {
      spyOn(axios, 'get').and.returnValue(Promise.resolve({}));

      edcClient.getContext();

      expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/context.json');
    });

    it('should get key', () => {
      expect(edcClient.getKey('foo', 'bar', 'en')).toEqual({
        'description': 'Comments help',
        'articles': [
          {
            'label': 'foo',
            'url': 'bar'
          }
        ]
      });
    });

    it('should get article content', () => {
      spyOn(axios, 'get').and.returnValue(Promise.resolve('baz'));
      let article = edcClient.context.foo.bar.en.articles[0];


      edcClient.getContent(article).then(() => {
        expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/bar');
        expect(article.content).toBe('baz');
      });
    });

    it('should get helper', () => {
      spyOn(edcClient, 'getContent').and.returnValue(Promise.resolve('baz'));

      edcClient.getHelper('foo', 'bar').then(helper => {
        expect(edcClient.getContent).toHaveBeenCalledWith(helper.articles[0]);
        expect(helper.articles.length).toBe(1);
        expect(helper.articles[0]).toEqual({
          label: 'foo',
          url: 'bar',
          content: 'baz'
        });
      });
    });

    it('should get undefined helper', () => {
      edcClient.getHelper('foo', 'foo').then(helper => {
        expect(helper).toBe(undefined);
      });
    });
  });
});
