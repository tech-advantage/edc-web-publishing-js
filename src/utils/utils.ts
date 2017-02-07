import { reduce } from 'lodash';
import { Documentation } from '../entities/documentation';
import assign = require('lodash/assign');
import { Indexable } from '../entities/indexable';

export class Utils {

  /**
   * creates a map of paths from the documentations of the given tree
   * following the structure : [0].children[1].children[0]
   * @param indexables : indexable item list of the Tree
   * @param prefix: concatenation of parents id
   * @param isRoot: true if indexables is a root
   * @return {{}} returns a map with the paths of all documentations of the tree
   */
  static indexTree(indexables: Indexable[], prefix?: string, isRoot?: boolean): Map<string, string> {
    // iterate through children and reduce the documentations concatenating the path with parents
    return reduce(indexables, (memo: any, {id, children}: Documentation, index: number) => {
      let newPrefix: string;
      // if it's not the root, append the prefix with keyword children
      if (!isRoot) {
        newPrefix = `${prefix}.children[${index}]`;
        memo[id] = newPrefix;
      } else {
        // if it is the root, just append the first index
        newPrefix = prefix;
      }

      // recall the function upon children until finding the leaf
      return assign(memo, this.indexTree(children, newPrefix));
    }, {});
  }
}
