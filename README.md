# fastify-cloudprnt

A fastify plugin to run a server that follows the [Star Micronics CloudPRNT protocol](https://www.star-m.jp/products/s_print/CloudPRNTSDK/Documentation/en/developerguide/introduction.html).

## Testing with Skipper Otto

One of the Star printers down at Fisherman's Wharf is currently configured with a CloudPRNT url of
https://socloudprnt.ngrok.io.

To use this in conjunction with a locally running version of this plugin, in one terminal:

  $ npm run dev

In another terminal:

  $ ngrok http --region=us --hostname=socloudprnt.ngrok.io 3000

You will now start to receive polling from the printer at 120s intervals. Bear in mind this
is a real physical printer down at the wharf! :sweat_smile:

### Current SO printer details & configuration

This is the info returned by the printer itself in response to `clientAction` requests:

- ClientType: Star Intelligent Interface HE01x/HE02x
- ClientVersion: 1.9.3
- Encodings: image/png; image/jpeg; application/vnd.star.raster; application/vnd.star.line; application/vnd.star.starprntcore; text/plain; application/octet-stream
- PageInfo:
  - paperWidth: 80
  - printWidth: 72
  - horizontalResolution: 8
  - verticalResolution: 8
