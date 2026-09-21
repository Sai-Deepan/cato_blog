# Editor security

Run `npm run editor` (or `npm.cmd run editor` in PowerShell if script execution is disabled), open http://localhost:1314/admin/, and enter the random password printed in that terminal. The password changes on restart. An optional `EDITOR_PASSWORD` environment variable can supply a password of 16–256 characters; do not commit it or put it in static configuration. The server keeps only a salted scrypt hash for verification.

The ordinary Hugo page at http://localhost:1313/admin/ is an informational entry point. It cannot authenticate users or write files. Public browser publishing is disabled, even if publishing.json is changed. The deployed site is static; review, commit and push local edits through the existing repository deployment workflow.

The editor binds only to 127.0.0.1 and requires the exact localhost:1314 Host and Origin. All file API requests require a random HttpOnly, SameSite=Strict session cookie, with a one-hour server-enforced lifetime. Logout and restart invalidate sessions. Login attempts are limited to five per minute. Cookies intentionally omit Secure because this editor runs on loopback HTTP only; do not expose it through a network bind, tunnel or reverse proxy as a production authentication service.

Only Markdown files directly inside the five writeup collections and PNG/JPEG/GIF/WebP/PDF uploads directly inside static/images/uploads are accessible through the API. Requests are capped at 15 MB, individual media at 10 MB and entries at 1 MB. Extension and file-signature checks reject obvious mismatches; these are not malware scanning. Executable web uploads, symlinks, Windows path aliases, traversal, deletion and rename operations are rejected. Local OS users with repository access remain trusted.

The read-only Hugo preview runs on loopback port 1315 without drafts or live reload. The authenticated editor provides draft previews. Markdown raw HTML is disabled in all builds. Vercel security headers take effect upon deployment; they are not supplied by a plain Hugo server. The CSP currently limits framing, objects, base URLs and form destinations, but is not a full script allowlist.

After upgrading, stop any previously running editor/decap-server processes before restarting. The old unauthenticated port 8081 service must not remain running. Do not start decap-server separately. No remote GitHub credentials or OAuth service are required for this local editing flow.

Validation: `npm run test:editor`, `node --test scripts/*.test.cjs`, and `npm run build`.

CSRF controls follow OWASP's origin validation guidance: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
