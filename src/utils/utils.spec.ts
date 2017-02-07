import { Utils } from './utils';
import { mock } from './test-utils';
import { Documentation } from '../entities/documentation';

describe('utils', () => {
  it('should return the paths map', () => {

    let tree: Documentation[] = [
        mock(Documentation, {
          id: 1,
          children: [
            { id: 10 },
            {
              id: 11,
              children: [
                {
                  id: 110,
                  children: []
                }
              ]
            }
          ]
        })
      ];

    expect(Utils.indexTree(tree, 'informationMaps[0]', true)).toEqual({
      10: 'informationMaps[0].children[0]',
      11: 'informationMaps[0].children[1]',
      110: 'informationMaps[0].children[1].children[0]'
    });
  });
})
;
