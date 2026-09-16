# Browser authoring

Run npm install, then npm run editor. Open http://localhost:1314/admin/.
The runner starts Hugo with drafts at 127.0.0.1:1314 and Decap's local filesystem proxy at 127.0.0.1:8081. It does not commit, push, or publish. Ctrl+C stops both.

Use Blog, Articles, or Exploits. Upload cover and inline images; the files are saved in static/images/uploads and referenced as /images/uploads/filename. Existing Markdown is editable. Section index files are intentionally excluded using cms_entry: true on actual entries.

Keep as draft defaults on for new entries. Turn it off when ready. Production builds must run hugo (without --buildDrafts). The local preview intentionally includes drafts. All collections use the site's write-up CSS in previews. Decap's preview is an approximation: Hugo generates code highlighting and the table of contents in the actual page.

## Live publishing: pending hosting details

Repository: Sai-Deepan/cato_blog, branch: master.
The public admin currently shows a setup notice. Do not enable it until these are configured:

1. Connect a host to the repository and branch; build with Hugo 0.153.2 or newer, command hugo --minify, publish directory public. Set the real baseURL in hugo.toml or the host's build command.
2. Set up a Decap-compatible GitHub OAuth service for that host. Keep the OAuth client secret on the server. Configure backend.base_url and backend.auth_endpoint in static/admin/config.json as required by the selected provider. Users need write access to this repository.
3. Configure deploy previews if desired. Verify sign-in, an image upload, and a draft save using a test entry.
4. Set enabled to true in static/admin/publishing.json and deploy. Saving a non-draft entry to master then triggers the host rebuild.

No OAuth secret, access token, or unprotected production write endpoint is included in this project. GitHub authentication cannot be implemented with a static HTML page alone.

Decap runtime 3.12.0 is vendored at static/admin/decap-cms.js from https://unpkg.com/decap-cms@3.12.0/dist/decap-cms.js, so local editing does not depend on a CDN connection. The local proxy is pinned to 3.9.0 because the latest package available during setup had an npm-incompatible catalog dependency. It is a development dependency only.

References:
- https://decapcms.org/docs/decap-proxy/
- https://decapcms.org/docs/github-backend/
- https://decapcms.org/docs/customization/

## Research collection

Research supports paper, patent, writeup, and research formats. Add the actual status, authors/inventors, venue, DOI (identifier only), patent/publication identifier, abstract, source URL, uploaded PDF, code URL, and citation. The record page shows the metadata and offers copy citation when supplied. Publication counts are derived from records rather than manually entered. New entries default to draft.

## CVE advisories

Use the CVEs collection to add actual identifiers, record status, severity, CVSS score/version/vector/source, product and version ranges, impact, mitigation, source links, timeline events, and references. CVE status and remediation status are independent. Scores are entered from a source, never calculated or inferred. New records default to draft and Unscored. Add technical content and images in the body editor.
