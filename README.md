# fastify-cloudprnt

A fastify plugin to run a server that follows the [Star Micronics CloudPRNT protocol](https://www.star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/introduction.html).

## Usage

```js
import fastifyCloudPrnt from '@autotelic/fastify-cloudprnt'

export default async function basic (fastify, options) {
  fastify.register(fastifyCloudPrnt, config)
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

Templates should be in [Star Document Markup](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/articles/markup/markupintro.html), and template rendering requires [`cputil`](https://star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/articles/cputil/cputil.html) to be in the path. The provided[Dockerfile](Dockerfile) builds a container with the app and `cputil` in.

## API

_@autotelic/fastify-cloudprnt_ exports a fastify plugin. When registered the plugin expects a configuration object:

* `queueJob: (token, jobData) => any`: method that takes a url-safe string `token` and an object of data `jobData`, to be passed to [fastify point-of-view `view` method](https://github.com/fastify/point-of-view#quick-start) for template rendering, and adds the job to the print queue.
* `getJob: () => token`: method that returns the url-safe string `token` for the next available print job on the queue.
* `getJobData: (token) => object`: method that returns the data object for the job enqueued with the url-safe string `token`.
* `deleteJob: (token) => any`: method that deletes the job enqueued with the url-safe string `token` from the print queue.
* `viewOptions: object`: object containing configuration options to be passed through to [point-of-view](https://github.com/fastify/point-of-view#options). The default option provided by this plugin is `engine: { nunjucks }`.
