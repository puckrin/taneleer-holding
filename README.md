# Taneleer — Holding Page

Single-page holding site for `taneleer.app`, deployed to GitHub Pages.

This repo exists to:

1. Test the Porkbun → GitHub Pages domain pipeline once, on a low-stakes site.
2. Provide a placeholder while the proper site is in development.
3. Give the domain something dignified to resolve to.

When the proper site (in `taneleer-website`) is ready to launch, the custom domain moves off this repo and onto that one. See [DEPLOY.md](./DEPLOY.md) for the procedure.

## Local preview

```bash
open index.html
```

That is the entirety of the build process.

For a server with auto-reload (optional):

```bash
npx serve .
```

## Deployment

- Push to `main` triggers `.github/workflows/deploy.yml`, which publishes to GitHub Pages.
- Custom domain is set to `taneleer.app` via the `CNAME` file at the repo root.
- Full first-time setup (Porkbun DNS records, HTTPS provisioning, troubleshooting) is in [DEPLOY.md](./DEPLOY.md).

## Files

| File | Purpose |
|---|---|
| `index.html` | The single page |
| `styles.css` | All CSS, single file |
| `CNAME` | Custom domain (`taneleer.app`) — read by GitHub Pages |
| `.nojekyll` | Tells GH Pages not to run Jekyll over the site |
| `.github/workflows/deploy.yml` | Auto-deploy on push to `main` |
| `DEPLOY.md` | Full deployment walkthrough |

## Voice

- "Coming soon" is too cheerful. The Collector says **"Forthcoming."**
- Status copy is intentionally curt — the page exists to confirm the domain works, not to sell anything.
- No links, no email signup, no CTAs. The page tells you what Taneleer is, says it isn't ready, and gets out of your way.
