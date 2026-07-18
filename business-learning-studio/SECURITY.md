# Security

## Supported version

Security fixes are applied to the latest commercial release.

## Reporting

Do not publish suspected vulnerabilities or sensitive reproduction data in a public issue. Contact the repository owner privately through the hosting platform and include the affected version, impact and minimal reproduction steps.

## Design controls

- A restrictive Content Security Policy is defined on each HTML entry point.
- Runtime dependencies are vendored and require no CDN access.
- The application stores data locally and has no privileged server component.
- Imported learning state is parsed as JSON and rendered through escaped or controlled fields.
- The release audit rejects likely secrets, local paths and non-allowlisted files.

Local storage is not a secure vault. Do not enter passwords, access tokens, regulated personal data or confidential source material into the coach.
