# fastify-cloudprnt

A fastify plugin to run a server that follows the [Star Micronics CloudPRNT protocol](https://www.star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/introduction.html).

## Commit linting with Husky

The npm postinstall script has been removed as it fails on the GH action runner. If you would like lint-staged to run on each commit, run `husky install` manually.

## Usage

```js
import fastifyCloudPrnt from '@autotelic/fastify-cloudprnt'
import view from '@fastify/point-of-view'

export default async function basic (fastify, options) {
  // point-of-view must be registered and available before fastify-cloudprnt
  await fastify.register(view, viewConfig)

  await fastify.register(fastifyCloudPrnt, config)
}
```

Once the plugin is registered it exposes the CloudPRNT Protocol endpoints:

* [`POST /`](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/pollingserver/post_overview.html)
* [`GET /`](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/printjobrequests/get_overview.html)
* [`DELETE /`](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/printjobconfirmation/delete_overview.html)

In addition it exposes:

* `POST /job` to queue print jobs. Body:

```json
{
  "token": <string>,
  "jobData": <object>
}
```

Returns `201 Created` and echos the token back `{ "token": <string> }`. The token should be a unique identifier for the print job - e.g. the order id if printing a receipt.

See [API](#API) for config options.

See [examples](examples/) for working examples.

### Template Rendering

Templates should be in [Star Document Markup](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/articles/markup/markupintro.html), and template rendering requires [`cputil`](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/articles/cputil/cputil.html) to be in the path. The provided [Dockerfile](Dockerfile) builds a container with the app and `cputil` in. Additionally, [@fastify/view](https://github.com/fastify/point-of-view) must be registered to fastify before fastify-cloudprnt.

Star Micronics provides a [Star Document Markup Designer](https://star-document-markup-designer.smcs.site/) web app.

## API

_@autotelic/fastify-cloudprnt_ exports a fastify plugin. When registered the plugin expects a configuration object:

* `queueJob: (token, jobData) => any`: method that takes a url-safe string `token` and an object of data `jobData`, to be passed to [point-of-view](https://github.com/fastify/point-of-view#quick-start) for template rendering, and adds the job to the print queue.
* `getJob: () => token`: method that returns the url-safe string `token` for the next available print job on the queue.
* `getJobData: (token) => object`: method that returns the data object for the job enqueued with the url-safe string `token`.
* `deleteJob: (token) => any`: method that deletes the job enqueued with the url-safe string `token` from the print queue.
* `routePrefix: string`: string which will configure a prefix for all cloudprnt routes.
* `defaultTemplate`: string which will configure the default template to be joined with `templatesDir` and used by [`@fastify/point-of-view`](https://github.com/fastify/point-of-view/tree/v3.x) to render the template (default to `receipt.stm`). If `jobData` contains a `template` value, it will be used instead of the `defaultTemplate`.
* `templatesDir`: string which will configure the directory to be joined with either the `defaultTemplate` or `jobData.template` and used by [`@fastify/point-of-view`](https://github.com/fastify/point-of-view/tree/v3.x) to render the template (default to an empty string).
* `routeOptions: object`: object which will apply the configured [fastify router options](https://www.fastify.io/docs/v3.29.x/Reference/Routes/#routes-options) to all cloudprnt routes. Note: `method`, `url`, `schema` and `handler` cannot be configured through `routeOptions`.
* `formatPrntCommandData: (renderedReceipt) => `: method that accepts the receipt rendered by [`@fastify/point-of-view`](https://github.com/fastify/point-of-view/tree/v3.x) and returns [star PRNT Core](https://www.star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/contentmediatypes/contentmediatypes_overview.html) command data. if configured, the `formatPrntCommandData` method will bypass the use of the [cputil](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/articles/cputil/cputil.html) to encode receipt data in the [star PRNT Core](https://www.star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/contentmediatypes/contentmediatypes_overview.html) format.
## Examples

### Basic
An [example](./examples/basic/) fastify app using [node-cache](https://github.com/node-cache/node-cache). To run the basic example, use the following command:
```sh
  npm run example:basic
```

### Redis
An [example](./examples/redis/) fastify app using [redis](https://www.npmjs.com/package/redis). To run the redis example, use the following command:
```sh
  npm run example:redis
```