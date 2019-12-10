# edc-client-js
_This project is meant to be used with **easy doc contents** (aka edc)._

edc is a simple yet powerful tool for agile-like documentation
management.

Learn more at [https://www.easydoccontents.com](https://www.easydoccontents.com).

## edc Version Compatibility

Current release is compatible with edc v3.0+

## Note

If you have an Angular application, you can use our **edc help angular component** available here :

https://github.com/tech-advantage/edc-popover-ng


## Dependencies

No dependencies.


## Installation
You can import your library with NPM in any Angular application by running:

```bash
$ npm install edc-client-js --save
```

with YARN, use:

```bash
$ yarn add edc-client-js

```

## Usage

The edc help client has been made to be used with any web framework.

### Instantiating a new EdcClient

To use the help client, you first have to instantiate a new EdcClient.

Below is an example for an Angular Typescript project, where exported documentation is served on `/doc` url :

```
this.edcClient = new EdcClient('/doc/');
```

Note that you can use ES6 imports to import classes from `edc-client-js` :

```
import { EdcClient, Documentation, Helper, InformationMap } from 'edc-client-js';
```

### Calling the help client 

The edc help client exposes several methods to get the content :

* **getContent(): Promise\<ExportInfo\>**

Returns a promise when the content is ready, containing information about current content, including the `info.json` file from the export, the current plugin and language ids.
(see [ExportInfo](https://github.com/tech-advantage/edc-client-js/blob/master/src/entities/export-info.ts) object)

* **getTitle(): Promise\<string\>**

Returns a promise containing the title of the current documentation, in the current language.

* **getToc(): Promise\<Toc\>**

Returns a promise containing a table of content as `Toc` (see [Toc](https://github.com/tech-advantage/edc-client-js/blob/master/src/entities/toc.ts) object) representing the content of the `toc.json` file  from the export.

```
edcClient.getToc().then(toc: Toc => this.toc = toc);
```

* **getHelper(mainKey, subKey): Promise\<Helper\>**

Provides help content for the brick identified by the given keys.
Contains the brick description, articles, links and information about the export.

(see [Helper](https://github.com/tech-advantage/edc-client-js/blob/master/src/entities/helper.ts) object).

* **getDocumentation(idDocumentation): Promise\<Documentation\>**

Provides help content for a particular documentation, and information about how the request has been resolved, ie the language for this content, the export id it belongs to.

(see [DocumentationTransfer](https://github.com/tech-advantage/edc-client-js/blob/master/src/entities/documentation-transfer.ts) ,
[Documentation](https://github.com/tech-advantage/edc-client-js/blob/master/src/entities/documentation.ts) objects).

* **getInformationMapFromDocId(): Promise\<InformationMap\>**

Returns a promise containing the information map of the given documentation.

See [InformationMap](https://github.com/tech-advantage/edc-client-js/blob/master/src/entities/information-map.ts).

### Translations

edc supports multi language documentations, and a translation language can be specified when requesting a content from the help client.

Content language resolution will be based on the export information present in the info.json files (default language, present translation languages).

The help client will try and resolve the content in the requested language; if no content was found, it will use the last resolved language, or default export language as a final fallback.

Note that returned context content (Helper.ts) and documentation content (DocumentationTransfer.ts) have the resolved language, so you can update your component translation settings if you want it to follow the documentation's.

### Navigation

edc-client-js provides content urls, to make navigation to documentation in the web help explorer easier.

* **getContextWebHelpUrl(): string**

Returns the url for loading the contextual help in the web help explorer (edc-help-ng).

* **getDocumentationWebHelpUrl(): string**

Returns the url for loading the documentation in the web help explorer (edc-help-ng).

* **getHomeWebHelpUrl(): string**

The edc-help-ng home url.

* **getErrorWebHelpUrl(): string**

The edc-help-ng error page url.

* **getPopoverI18nUrl(): string**

Returns the url for the i18n popover files, for customizing label translations in the [edc-popover-ng project](https://github.com/tech-advantage/edc-popover-ng).

* **getWebHelpI18nUrl(): string**

Returns the url of the i18n web help explorer files, for customizing label translations in the edc-help-ng project.

## More

If you want more information, you can check our Angular help component library using this edc help client :

https://github.com/tech-advantage/edc-popover-ng


## License

MIT [TECH'advantage](mailto:contact@tech-advantage.com)


