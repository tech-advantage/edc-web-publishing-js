import { EdcClient } from './edc-client';
import axios from 'axios';
import { Promise } from 'es6-promise';
import { Documentation } from './entities/documentation';
import { mock, async } from './utils/test-utils';
import { Toc } from './entities/toc';
import { Utils } from './utils/utils';

describe('EDC client', () => {
  let edcClient: EdcClient;
  let toc;

  describe('init', () => {
    it('should init edc client', () => {
      spyOn(axios, 'create');
      spyOn(axios, 'get').and.returnValue(Promise.resolve({}));
      edcClient = new EdcClient('http://base.url:8080/help');

      Promise.all([edcClient.contextReady, edcClient.tocReady]).then(() => {
        expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://base.url:8080/help'});
        expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/context.json');
        expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/toc.json');
      });
    });
  });

  describe('runtime', () => {
    let context;

    beforeEach(() => {
      spyOn(EdcClient.prototype, 'init');
      edcClient = new EdcClient();
      edcClient.baseURL = 'http://base.url:8080/help';

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

     toc = {
       label: 'EDC IDE Eclipse',
       toc: [
         {
           id: '2',
           file: 'toc-2.json'
         }
       ]
     };

      edcClient.context = context;
      edcClient.toc = toc;
    });

    it('should get context', () => {
      spyOn(axios, 'get').and.returnValue(Promise.resolve({}));

      edcClient.getContext();

      expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/context.json');
    });

    describe('should test getToc()', () => {

      let infoMap;
      let promises;
      let indexTree;

      beforeEach(() => {
        infoMap = { id: 2, en: { id: 5 } };
        // promises to return from the axios.get callFakes
        promises = {
          'http://base.url:8080/help/toc.json': Promise.resolve({ data: toc }),
          'http://base.url:8080/help/toc-2.json': Promise.resolve({ data: infoMap })
        };

        // indexTree generated from toc's infomap
        indexTree = {
          5: 'toc[0].topics[0]'
        };
        spyOn(axios, 'get').and.callFake((arg: any): Promise<any> => promises[arg]);
        spyOn(Utils, 'indexTree').and.returnValue(indexTree);
      });

      it('should get table of content', async(() => {

        // return - for the async function
        return edcClient.getToc().then((res) => {
          expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/toc.json');

          // it's a little bit dirty but it works
          // checking the mapping of the toc
          expect(res.toc[0].topics).toEqual([{ id: 5 }]);
          expect(edcClient.toc.index).toEqual(indexTree);
          expect(axios.get).toHaveBeenCalledWith('http://base.url:8080/help/toc-2.json');
        });
      }));
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
      edcClient.contextReady = Promise.resolve();

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
      edcClient.contextReady = Promise.resolve();
      edcClient.getHelper('foo', 'foo').then(helper => {
        expect(helper).toBe(undefined);
      });
    });

    it('should get the documentation', () => {
      spyOn(edcClient, 'getContent').and.returnValue(Promise.resolve('baz'));

      let tree: Documentation[] = [
        mock(Documentation, {
          id: 1,
          topics: [
            { id: 10 },
            {
              id: 11,
              topics: [
                {
                  id: 110,
                  url: 'foo/bar',
                  topics: []
                }
              ]
            }
          ]
        })
      ];
      edcClient.toc = mock(Toc, {
        informationMaps: tree,
        index: {
          10: 'toc[0].topics[0]',
          11: 'toc[0].topics[1]',
          110: 'toc[0].topics[1].topics[0]'
        }
      });
      edcClient.tocReady = Promise.resolve(edcClient.toc);


      edcClient.getDocumentation(110).then(doc => {
        expect(doc).toEqual({
          id: 110,
          topics: []
        });

        expect(edcClient.getContent).toHaveBeenCalledWith('foo/bar');
      });
    });
  });
});
