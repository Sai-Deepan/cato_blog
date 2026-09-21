# About-page credentials

Edit `data/credentials.json` to manage the final section of `/about/`.

- Set `drive_url` to the shareable Google Drive folder containing the full collection. The `more >>>` button stays disabled until this is supplied.
- Add records to `items`. Only records with `featured: true` appear on the page.
- Set `kind` to `certification` or `license`.
- Set `issuer` to the display name (for example, `NVIDIA`, `OpenAI`, `Meta`, `Google`, or `Anthropic`). Additional issuers are automatically included in the filter.
- Use `image` for a certificate image, for example `/images/certificates/example.webp` (stored in `static/images/certificates/`). Without an image, the page shows a typographic credential card.
- Set `url` to the public certificate or verification link. Optional `description` and `issued` fields add context and the issue date.

Example record (replace these values with the actual credential details before featuring):

```json
{
  "title": "Exact certificate title",
  "issuer": "NVIDIA",
  "kind": "certification",
  "featured": false,
  "image": "",
  "url": "",
  "description": "",
  "issued": ""
}
```

The initial three titles were carried over from the existing About page. No additional qualifications, issue dates, or verification links have been inferred.
