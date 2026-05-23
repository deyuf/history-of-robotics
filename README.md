# History of Robot · 机器人编年史

A bilingual editorial chronicle of robotics across eight eras — from Greek myth and Edo karakuri tea-servers to Unimate, ASIMO, Atlas, Figure, Optimus, Unitree and general-purpose embodied AI. Every event is cited; images are pulled from Wikimedia Commons / NASA / official sources under PD or CC licenses.

机器人编年史。八个时代，~80 个里程碑事件，全部附原始来源。中英双语，纸张/墨水/金线编辑风。

**Live:** _set after first deploy_

---

## Tech

- Pure static SPA — no build step. `index.html` + `styles.css` + `app.js` + `/data/timeline.json`
- Fonts: Bricolage Grotesque (display) · Fraunces + Noto Serif SC (editorial serif) · Inter (sans) · JetBrains Mono (data/mono)
- Charts: inline SVG, no external library
- i18n: language toggle (zh / en) with `localStorage` persistence
- Dark mode: toggle + system preference, `localStorage` persistence
- Visual homage to [historyofmarket.com](https://historyofmarket.com)

## Run locally

Any static server works. Example:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080/`.

## Deploy

### GitHub Pages

`.github/workflows/pages.yml` is already set up. After pushing:

1. GitHub repo → **Settings → Pages → Source: GitHub Actions**.
2. The workflow uploads the repo root as-is (the `.nojekyll` file disables Jekyll).
3. URL: `https://<user>.github.io/history-of-robotic/`

### Cloudflare Pages

Two options:

**A. Connect via dashboard (zero config).** Cloudflare → Workers & Pages → Create application → Pages → Connect to Git. Build command: _(empty)_. Build output directory: `/`. Done.

**B. Via GitHub Actions.** `.github/workflows/cloudflare.yml` uses `cloudflare/wrangler-action`. Add two repo secrets:

- `CLOUDFLARE_API_TOKEN` — create a token with `Pages: Edit` permission
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID

Then create a Pages project named `history-of-robot` (or change the name in the workflow). Each push to `main` deploys.

`_headers` already sets cache and security headers for CF Pages.

## Adding events

Edit `/data/timeline.json`. Each event:

```jsonc
{
  "year": "1996",
  "title": "中文标题",
  "titleEn": "English title",
  "desc": "一句话的中文描述。",
  "descEn": "One-sentence English description.",
  "image": {                              // optional
    "file": "Filename_on_Wikimedia_Commons.jpg",
    "credit": "Author / institution / license",
    "alt": "alt text"
  },
  "sources": [
    { "label": "Source name", "url": "https://..." }
  ]
}
```

Images use Wikimedia's stable `Special:FilePath` redirect, so only the filename is needed.

## Editorial principles

1. **Primary sources first** — company sites, patents, peer-reviewed papers, museum holdings.
2. **Vetted secondary sources only** — IEEE Spectrum, Nature, Science, MIT Tech Review, Reuters, Bloomberg, NYT.
3. **Public-domain or CC-licensed images** with attribution in the caption.
4. **Forward-looking claims** are flagged with "outlook" / "展望" and dated.

## License

- Content: **CC BY 4.0** — cite, translate, remix freely with attribution.
- Code: MIT.
- Images: see each caption; rights held by original creators / institutions.

## Contributing

Pull requests welcome. Add events, correct dates, translate, or contribute illustrations. Please include sources for any factual claims.
