import { ContentTypeSuffix } from '../entities/content-type';
import { Promise as PromiseEs6 } from 'es6-promise';
import { EdcHttpClient } from '../http/edc-http-client';
import { Helper } from '../entities/helper';
import { ContextualHelp } from '../entities/contextual-help';
import { Utils } from '../utils/utils';
import { ContextualExport } from '../entities/ContextualExport';
import { Article } from '../entities/article';
import { PopoverLabel } from '../entities/popover-label';
import { UrlConfigService } from './url-config.service';
import { PopoverError } from '../entities/popover-error';

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

  getPopoverLabel(langCode: string, pluginId: string, url: UrlConfigService): PromiseEs6<PopoverLabel> {
    return this.initContext(pluginId).then(() => {
      // To make sure that context is initialized and usable
      if (!this.context || !this.context.contextualHelp) {
        return null;
      }

      const labels: PopoverLabel = new PopoverLabel();
      labels.url = url.getPopoverLabelsPath(langCode);
      return this.httpClient.getItemContent<PopoverLabel>(labels)
        .then(label => {
          if (!label) {
            return PromiseEs6.reject('Can\'t fetch popover labels !');
          }
          const tmpLabel = Utils.safeGet<any, {}>(label.content, ['labels']);
          const tmpError = Utils.safeGet<any, {}>(label.content, ['errors']);
          if (tmpLabel && tmpError) {
            label.articles = Utils.safeGet<any, string>(tmpLabel, ['articles']);
            label.links = Utils.safeGet<any, string>(tmpLabel, ['links']);
            label.iconAlt = Utils.safeGet<any, string>(tmpLabel, ['iconAlt']);
            label.comingSoon = Utils.safeGet<any, string>(tmpLabel, ['comingSoon']);

            const errorLabels = new PopoverError();
            errorLabels.failedData = Utils.safeGet<any, string>(tmpError, ['failedData']);

            label.errors = errorLabels;
          } else {
            return PromiseEs6.reject('Can\'t find required data in fetched popover labels !');
          }
          return label;
        });
    });
  }
}
