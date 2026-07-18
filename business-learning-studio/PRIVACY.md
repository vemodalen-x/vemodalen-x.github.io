# Privacy

## Local-first behavior

Business Learning Studio has no application backend, analytics SDK, advertising SDK or telemetry endpoint. The runtime does not make cross-origin network requests. Learning plans, attempts and coaching sessions are stored in the current browser's local storage.

## User control

- Export learning or coaching state as JSON from the product.
- Reset local state from the product controls.
- Remove all stored data by clearing site data in the browser.

Exported JSON may contain text entered by the user. Review it before sharing.

## Release boundary

The release pipeline rejects raster screenshots, local absolute paths, browser-cache identifiers, credentials and named private-course sources. Only files on an explicit runtime and documentation allowlist are packaged.

## Hosting

Static hosts may log ordinary HTTP metadata such as IP address, user agent and request time. Those logs are controlled by the chosen hosting provider, not by this application.
