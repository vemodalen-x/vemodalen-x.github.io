# Security Policy

## Supported Version

Security fixes are provided for the latest published release only. The current supported version is 1.4.x.

## Reporting

Report suspected vulnerabilities through the repository's private security advisory flow. Do not include private photos, credentials, access tokens, cookies or restricted course content in a public issue.

For non-sensitive defects, use a regular repository issue with the minimum reproducible steps and browser version. Screenshots are optional and must be cropped and redacted before upload.

## Deployment Guidance

- Serve the application over HTTPS in production.
- Keep the default Content Security Policy at the hosting layer restrictive.
- Do not add analytics, cloud storage or model APIs without consent, retention and secret-management controls.
- Re-run `npm test` and verify `release-manifest.json` before each release.
- Treat downloaded commercial CSV/JSON kits and platform terms as user-controlled data; never add account credentials, cookies or upload tokens to the static app.
