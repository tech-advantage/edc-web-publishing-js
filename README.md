# edc help client
# DEPRECATED: please use edc-client-js instead.
## https://www.npmjs.com/package/edc-client-js
_This project is meant to be used with **easy doc contents** (aka edc)._

edc is a simple yet powerful tool for agile-like documentation
management.

Learn more at [https://www.easydoccontents.com](https://www.easydoccontents.com).

## Note

If you have an Angular, application you can use our **edc help angular component** available here :

https://github.com/tech-advantage/edc-popover-ng


## Dependencies

No dependencies.


## Installation
You can import your library with NPM in any Angular application by running:

```bash
$ npm install edc-web-publishing-js --save
```

with YARN, use:

```bash
$ yarn add edc-web-publishing-js

```

## Usage

The edc help client has been made to be used with any web framework.

### Instantiating a new EdcClient

To use the help client, you first have to instantiate a new EdcClient.

Below is an exemple for an Angular Typescript project, where exported documentation is served on `/doc` url :

```
this.edcClient = new EdcClient('/doc/');
```

Note that you can use ES6 imports to import classes from `edc-web-publishinh-js` :

```
import { EdcClient, Documentation, Helper, InformationMap } from 'edc-web-publishing-js';
```

### Calling client 

The edc help client expose several methods to get content :

* **getInfo()**

Returns a promise containing the content of the `info.json` file  from the export.

* **getContext()**

Returns a promise containing the content of the `context.json` file  from the export.

* **getToc(): Promise\<Toc\>**

Returns a promise containing a table of content as `Toc` (see [Toc](https://github.com/tech-advantage/edc-web-publishing-js/blob/master/src/entities/toc.ts) object) representing the content of the `toc.json` file  from the export.

```
edcClient.getToc().then(toc: Toc => this.toc = toc);
```

* **getHelper(mainKey, subKey): Promise\<Helper\>**

Useful to get help content (see [Helper](https://github.com/tech-advantage/edc-web-publishing-js/blob/master/src/entities/helper.ts) object) for a particular key/subkey.

* **getDocumentation(idDocumentation): Promise\<Documentation\>**

Useful to get help content (see [Documentation](https://github.com/tech-advantage/edc-web-publishing-js/blob/master/src/entities/documentation.ts) object) for a particular documentation.

* **getInformationMapFromDocId(): Promise\<InformationMap\>**

Useful to retrieve information map for a particular documentation.

See [InformationMap](https://github.com/tech-advantage/edc-web-publishing-js/blob/master/src/entities/information-map.ts).


* **getContent()**

_Will be private in next release._

* **getKey()**

_Will be private in next release._

## More

If you want more information, you can check our Angular help component library using this edc help client :

https://github.com/tech-advantage/edc-popover-ng


## License

MIT [TECH'advantage](mailto:contact@tech-advantage.com)


