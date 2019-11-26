import { InformationMap } from '../entities/information-map';
import { Documentation } from '../entities/documentation';
import { mock } from '../utils/test-utils';

export const informationMap1: InformationMap = {
  id: 1,
  en: mock(Documentation, {
    id: 1,
    topics: [
      mock(Documentation, { id: 2 }),
      mock(Documentation, {
          id: 3, topics: [
            mock(Documentation, { id: 4, topics: [mock(Documentation, { id: 5 })] }),
            mock(Documentation, { id: 6 })
          ]
        }
      )
    ]
  }),
  fr: mock(Documentation, {
    id: 1,
    topics: [
      mock(Documentation, { id: 2 }),
      mock(Documentation, {
          id: 3, topics: [
            mock(Documentation, { id: 4, topics: [mock(Documentation, { id: 5 })] }),
            mock(Documentation, { id: 6 })
          ]
        }
      )
    ]
  })
};

export const informationMap3: InformationMap = {
  id: 3,
  en: mock(Documentation, {
    id: 41,
    label: 'document 41 in english',
    topics: [
      mock(Documentation, { id: 42 }),
      mock(Documentation, {
          id: 43, topics: [
            mock(Documentation, { id: 44, topics: [mock(Documentation, { id: 45 })] }),
            mock(Documentation, { id: 46 })
          ]
        }
      )
    ]
  }),
  fr: mock(Documentation, {
    id: 41,
    label: 'document 41 in french',
    topics: [
      mock(Documentation, { id: 42 }),
      mock(Documentation, {
          id: 43, topics: [
            mock(Documentation, { id: 44, topics: [mock(Documentation, { id: 45 })] }),
            mock(Documentation, { id: 46 })
          ]
        }
      )
    ]
  })
};

export const informationMap4: InformationMap = {
  id: 4,
  en: mock(Documentation, {
    id: 61,
    topics: [
      mock(Documentation, { id: 62 }),
      mock(Documentation, {
          id: 43, topics: [
            mock(Documentation, { id: 64, topics: [mock(Documentation, { id: 65 })] }),
            mock(Documentation, { id: 66 })
          ]
        }
      )
    ]
  }),
  fr: mock(Documentation, {
    id: 61,
    topics: [
      mock(Documentation, { id: 62 }),
      mock(Documentation, {
          id: 43, topics: [
            mock(Documentation, { id: 64, topics: [mock(Documentation, { id: 65 })] }),
            mock(Documentation, { id: 66 })
          ]
        }
      )
    ]
  })
};

export const informationMap7: InformationMap = {
  id: 7,
  en: mock(Documentation, {
    id: 81,
    topics: [
      mock(Documentation, {
          id: 83, topics: [
            mock(Documentation, { id: 84, topics: [mock(Documentation, { id: 85 })] }),
            mock(Documentation, { id: 86 })
          ]
        }
      ),
      mock(Documentation, { id: 82 })
    ]
  }),
  de: mock(Documentation, {
    id: 81,
    topics: [
      mock(Documentation, {
          id: 83, topics: [
            mock(Documentation, { id: 84, topics: [mock(Documentation, { id: 85 })] }),
            mock(Documentation, { id: 86 })
          ]
        }
      ),
      mock(Documentation, { id: 82 })
    ]
  })
};

export const informationMap11: InformationMap = {
  id: 11,
  ru: mock(Documentation, {
    id: 100,
    topics: [
      mock(Documentation, {
          id: 101, topics: [
            mock(Documentation, { id: 102, topics: [mock(Documentation, { id: 103 })] }),
            mock(Documentation, { id: 104 })
          ]
        }
      )
    ]
  }),
  es: mock(Documentation, {
    id: 100,
    topics: [
      mock(Documentation, {
          id: 101, topics: [
            mock(Documentation, { id: 102, topics: [mock(Documentation, { id: 103 })] }),
            mock(Documentation, { id: 104 })
          ]
        }
      )
    ]
  })
};

export const informationMaps = new Map([
  ['toc-1.json', informationMap1],
  ['toc-3.json', informationMap3],
  ['toc-4.json', informationMap4],
  ['toc-7.json', informationMap7],
  ['toc-11.json', informationMap11]
]);
