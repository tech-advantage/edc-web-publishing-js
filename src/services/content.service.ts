import { ContextService } from './context.service';
import { LanguageService } from './language.service';
import { DocumentationService } from './documentation.service';
import { ExportInfoService } from './export-info.service';
import { Promise as PromiseEs6 } from 'es6-promise';
import { ExportInfo } from '../entities/export-info';
import { Helper } from '../entities/helper';
import { DocumentationTransfer } from '../entities/documentation-transfer';
import { InformationMap } from '../entities/information-map';
import { Toc } from '../entities/toc';
import { Documentation } from '../entities/documentation';
import {PopoverLabel} from '../entities/popover-label';

/**
 * The main service handling the contents for all the exports (aka plugins)
 * It will coordinate and manage:
 *  - the export information (as export id, available content languages, default content language..),
 *  - the documentation help context content, for the popover and for the web explorer
 *  - the documentation contents, extracted from the Table of contents (TOC), structured by information map, for each export
 *  - the current state of the documentation content (current exportId, current language..).
 *
 * Main rules for content:
 *  - Every time a content is requested in a given language, it will automatically switch to the default language if
 * it wasn't found in the requested one. The default language then becomes the current one.
 *  - Every time a requested content belongs to a different export, this export is stored as the current export,
 * and language settings are updated based on this new export information.
 *  - When selecting a new export, current language will remain the same if available in this export.
 *  - All the documentation exports share the same default language, so it should always be an effective fallback.
 *
 */
export class ContentService {

  private static instance: ContentService;

  private contentReady: PromiseEs6<ExportInfo>;

  private constructor(private readonly infoService: ExportInfoService,
                      private readonly contextService: ContextService,
                      private readonly translationService: LanguageService,
                      private readonly documentationService: DocumentationService) {
  }

  public static getInstance() {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService(ExportInfoService.getInstance(),
        ContextService.getInstance(),
        LanguageService.getInstance(),
        DocumentationService.getInstance()
      );
    }
    return ContentService.instance;
  }

  initContent(pluginId?: string, contextOnly?: boolean, lang?: string): PromiseEs6<ExportInfo> {
    this.contentReady = this.infoService.initInfos(pluginId, true, lang)
      .then(() => this.contextService.initContext(this.infoService.getCurrentExportId()))
      .then(() => contextOnly ? null : this.documentationService.initMultiToc(this.infoService.getExportInfoValues()))
      .then(() => this.getExportInfo())
      .catch((err: Error) => {
        console.error('Could not load help content', err);
        return null;
      });
    return this.contentReady;
  }

  getTitle(): PromiseEs6<string> {
    return this.getContentReady().then(() => this.infoService.getTitle());
  }

  getToc(pluginId?: string, langCode?: string): PromiseEs6<Toc> {
    return this.getContentReady()
      .then(() => this.infoService.setCurrentExportId(pluginId, langCode))
      .then(() => this.documentationService.getToc(this.getCurrentPluginId()));
  }

  getExportInfo(): PromiseEs6<ExportInfo> {
    return this.infoService.getCurrentExportInfo();
  }

  getInfos(): Map<string, ExportInfo> {
    return this.infoService.getExportInfoValues();
  }

  getCurrentPluginId(): string {
    return this.infoService.getCurrentExportId();
  }

  getContentReady(pluginId?: string, contextOnly?: boolean, lang?: string): PromiseEs6<ExportInfo> {
    if (!this.contentReady) {
      return this.initContent(pluginId, contextOnly, lang);
    }
    return this.contentReady || this.initContent(pluginId, contextOnly, lang);
  }

  getContext(mainKey: string, subKey: string, pluginId: string, lang?: string): PromiseEs6<Helper> {
    return this.getContentReady()
      .then(() => this.infoService.setCurrentExportId(pluginId, lang))
      .then(() => this.contextService.initContext(pluginId))
      .then(() => this.contextService.getContext(mainKey, subKey, this.infoService.getCurrentExportId(), this.translationService.getCurrentLanguage()));
  }

  /**
   * Return the documentation by id
   * The content will be in the requested language if present, or in the default language
   * Also, if the documentation was found, it will set the current export and language from this documentation values
   *
   * If not present, it will try and set the source export as current export
   *
   * @param id the identifier of the documentation
   * @param langCode the 2 letters code of the requested language (en, fr..)
   * @param sourceExportId the identifier of the export from where the request was made
   */
  getDocumentation(id: number, langCode: string, sourceExportId?: string): PromiseEs6<DocumentationTransfer> {
    // Save current export for further comparisons
    const currentExportId = this.infoService.getCurrentExportId();
    return this.contentReady
      .then(() => this.documentationService.findPluginIdFromDocumentationId(id))// Retrieve the export of the requested documentation
      .then((exportId: string) => this.infoService.setCurrentExportId(exportId, langCode)) // Check this export id and language, and set new current values
      .then(() => this.documentationService.getDocumentation(id, this.translationService.getCurrentLanguage(), this.translationService.getDefaultLanguage()))
      .then((documentation: Documentation) => {
        // If no documentation was found, try and restore the export where this documentation was being called from
        if (!documentation) {
          this.infoService.setCurrentExportId(sourceExportId, langCode);
        }
        const hasExportChanged = currentExportId !== this.infoService.getCurrentExportId();
        return new DocumentationTransfer(documentation, this.infoService.getCurrentExportId(), hasExportChanged, this.translationService.getCurrentLanguage());
      });
  }

  getInformationMapFromDocId(id: number): PromiseEs6<InformationMap> {
    return this.contentReady.then(() => this.documentationService.getInformationMapFromDocId(id));
  }

  getPopoverLabel(langCode: string, sourceExportId: string, url: string): PromiseEs6<PopoverLabel> {
    return this.contentReady.then(() => this.contextService.getPopoverLabel(langCode, sourceExportId, url));
  }
}
