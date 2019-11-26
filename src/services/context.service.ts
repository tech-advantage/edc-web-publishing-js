import { ContentTypeSuffix } from '../entities/content-type';
import { Promise as PromiseEs6 } from 'es6-promise';
import { EdcHttpClient } from '../http/edc-http-client';
import { Helper } from '../entities/helper';
import { ContextualHelp } from '../entities/contextual-help';
import { Utils } from '../utils/utils';
import { ContextualExport } from '../entities/ContextualExport';
import { Article } from '../entities/article';

/**
 * For reading and returning the documentation context content
 *
 * This content is requested by the popovers, and the web explorer when called from a brick's article
 */
export class ContextService {
  private static instance: ContextService;
  context: ContextualExport;
  contextReady: PromiseEs6<ContextualHelp>;

  private constructor(private readonly httpClient: EdcHttpClient) {}

  public static getInstance(): ContextService {
    if (!ContextService.instance) {
      ContextService.instance = new ContextService(EdcHttpClient.getInstance());
    }
    return ContextService.instance;
  }

  initContext(pluginId: string): PromiseEs6<ContextualHelp> {
    if (!this.context || (pluginId && this.context.pluginId !== pluginId)) {
      this.contextReady = this.readContext(pluginId)
        .then((context: ContextualExport) => {
          this.context = context;
          return context.contextualHelp;
        })
        .catch(err => {
          console.warn(`Edc-client-js : could not get context from plugin [${pluginId}]: ${err}`);
          return PromiseEs6.resolve(null);
        });
    }
    return this.contextReady;
  }

  /**
   * return the contextual Help from the export "context" file
   * if the pluginId defining the export is not defined, use current export or the export by default
   * @param {string} pluginId the identifier of the plugin associated with the export
   * @return {Promise<any>} the
   */
  readContext(pluginId: string): PromiseEs6<ContextualExport> {
    return this.httpClient.getContent(ContentTypeSuffix.TYPE_CONTEXT_SUFFIX, pluginId)
      .then((contextualHelp: ContextualHelp) => new ContextualExport(pluginId, contextualHelp));
  }

  getContext(mainKey: string, subKey: string, pluginId: string, lang?: string): PromiseEs6<Helper> {
    return this.initContext(pluginId).then(() => {
      if (!this.context || !this.context.contextualHelp) {
        return null;
      }
      const helper: Helper = Utils.safeGet<ContextualHelp, Helper>(this.context.contextualHelp, [mainKey, subKey, lang]);
      if (!helper) {
        return null;
      }
      helper.language = lang;
      helper.exportId = pluginId;
      return PromiseEs6.all(
              [this.httpClient.getItemContent<Helper>(helper),
                ...helper.articles.map(article => this.httpClient.getItemContent<Article>(article))]
            ).then(() => helper);
    });
  }

}
