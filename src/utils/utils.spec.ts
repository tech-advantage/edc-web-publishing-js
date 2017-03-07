import { Utils } from './utils';
import { mock } from './test-utils';
import { Documentation } from '../entities/documentation';
import { } from 'jasmine';

describe('utils', () => {
  it('should return the paths map', () => {

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
                  topics: []
                }
              ]
            }
          ]
        })
      ];

    expect(Utils.indexTree(tree, 'toc[0]', true)).toEqual({
      10: 'toc[0].topics[0]',
      11: 'toc[0].topics[1]',
      110: 'toc[0].topics[1].topics[0]'
    });
  });
})
;
