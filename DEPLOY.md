# Deployment — Porkbun + GitHub Pages

First-time setup of `taneleer.app` (registered at Porkbun) → GitHub Pages, serving this repo.

The end state:
- `https://taneleer.app` — serves the holding page (apex, canonical)
- `https://www.taneleer.app` — redirects to apex
- HTTPS enforced everywhere
- HTTP automatically upgraded to HTTPS

You do this once. Subsequent pushes to `main` deploy automatically via the GitHub Actions workflow.

---

## Step 1 — Push the repo to GitHub

From inside this directory:

```bash
git init
git add .
git commit -m "Initial holding page"
gh repo create taneleer-holding --public --source=. --push
```

(Or create the repo on github.com manually, then `git remote add origin … && git push -u origin main`.)

## Step 2 — Enable GitHub Pages

1. Go to **the repo → Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. The first push triggers the deploy workflow. Watch it under the **Actions** tab. Wait for the green check.
4. Once green, the site is live at `https://puckrin.github.io/taneleer-holding/`. Visit it. Confirm it looks right *before* moving on — debugging DNS while the page itself is broken is miserable.

## Step 3 — Add the custom domain in GitHub

1. **Settings → Pages → Custom domain**.
2. Enter `taneleer.app` (no `https://`, no slash, no `www`). Click **Save**.
3. GitHub will start a DNS check and tell you it's "not yet detected" — that's fine, DNS records don't exist yet.
4. The repo's `CNAME` file is already set to `taneleer.app`, so don't worry if GitHub prompts to create one.

## Step 4 — Add DNS records at Porkbun

1. Log in to Porkbun → **Domain Management** → click **DNS** next to `taneleer.app`.
2. **Delete the parking page records** Porkbun adds by default (they'll be A or ALIAS records on `@`). If you don't, they'll fight with the new ones.
3. Add the following records exactly:

   | Type   | Host  | Answer                       | TTL |
   |--------|-------|------------------------------|-----|
   | A      | (blank)/`@` | `185.199.108.153`      | 600 |
   | A      | (blank)/`@` | `185.199.109.153`      | 600 |
   | A      | (blank)/`@` | `185.199.110.153`      | 600 |
   | A      | (blank)/`@` | `185.199.111.153`      | 600 |
   | AAAA   | (blank)/`@` | `2606:50c0:8000::153`  | 600 |
   | AAAA   | (blank)/`@` | `2606:50c0:8001::153`  | 600 |
   | AAAA   | (blank)/`@` | `2606:50c0:8002::153`  | 600 |
   | AAAA   | (blank)/`@` | `2606:50c0:8003::153`  | 600 |
   | CNAME  | `www`       | `puckrin.github.io.`   | 600 |

   Notes:
   - Porkbun's "Host" field for the apex is empty (or `@`, depending on the UI version).
   - The trailing dot on `puckrin.github.io.` is the FQDN form; Porkbun will accept either with or without.
   - A records are required (IPv4). AAAA are optional but recommended (IPv6).
   - The `www` CNAME makes typing `www.taneleer.app` resolve too — GitHub Pages will then automatically redirect it to the apex.

4. Save.

## Step 5 — Wait for DNS to propagate

DNS propagation at Porkbun is usually 10–60 minutes. To check progress:

```bash
dig taneleer.app +short
# Should return the four 185.199.x.153 IPs

dig www.taneleer.app +short
# Should return puckrin.github.io plus the same four IPs

dig AAAA taneleer.app +short
# Should return the four IPv6 addresses
```

If the answers are empty or wrong, give it longer. If after two hours nothing has changed, double-check the records at Porkbun.

## Step 6 — Verify domain in GitHub & enable HTTPS

1. Back at **Settings → Pages**, GitHub re-runs the DNS check periodically. Once it finds the records, you'll see a green "DNS check successful" line for `taneleer.app`.
2. GitHub then provisions a Let's Encrypt certificate. This takes a few minutes — the **Enforce HTTPS** checkbox stays greyed out until the cert is ready.
3. When the checkbox becomes available, **tick it**. Now HTTP requests are auto-upgraded to HTTPS.
4. Visit `https://taneleer.app`. The holding page should load.
5. Visit `https://www.taneleer.app`. It should redirect to the apex.

## Step 7 — Sanity checks

- `https://taneleer.app` works ✓
- `https://www.taneleer.app` redirects to apex ✓
- `http://taneleer.app` upgrades to HTTPS ✓
- Browser address bar shows the lock icon ✓
- Cert is valid for both `taneleer.app` and `www.taneleer.app` (click the lock → cert details)

---

## Common gotchas

| Symptom | Likely cause |
|---|---|
| GitHub says "Domain not properly configured" indefinitely | Old A records still cached; DNS not yet propagated; or Porkbun parking records still present |
| HTTPS checkbox stuck greyed out | Cert provisioning takes ~5–15 min after DNS check passes. If it persists for hours, remove the custom domain in GH Pages, wait 5 min, re-add it |
| Page loads but shows GH 404 | Build failed — check the Actions tab |
| Cert mismatch on `www.taneleer.app` | The `www` CNAME isn't set, or hasn't propagated yet |
| Removed and re-added the custom domain, now cert won't issue | Let's Encrypt rate-limits cert reissuance for ~24h. Wait it out. |
| Browser warns "Not Secure" but cert is provisioned | HSTS preload from a prior owner of the domain. Open in incognito to bypass. Otherwise time will heal it. |

## Tools to verify

- `dig taneleer.app` — local DNS check
- [dnschecker.org](https://dnschecker.org/) — global DNS propagation map
- [whatsmydns.net](https://whatsmydns.net/) — alternative
- `curl -vI https://taneleer.app` — full request/response trace including TLS handshake

---

## When the proper site is ready — switching the domain over

Once `taneleer-website` is ready to be the live site:

1. **In `taneleer-holding` (this repo)** → Settings → Pages → **remove** `taneleer.app` from Custom domain. Save.
2. **In `taneleer-website`** → ensure a `CNAME` file at the repo root contains `taneleer.app`.
3. Settings → Pages → set Source to **GitHub Actions** (if not already).
4. Settings → Pages → Custom domain → enter `taneleer.app`. Save.
5. Wait for the DNS check to pass (it should be near-instant since the records already point at GitHub's IPs — no Porkbun changes required).
6. Tick **Enforce HTTPS** once available.
7. Done. The DNS records at Porkbun never change — only the repo that GitHub Pages serves changes.

If you want to keep the holding page accessible as a backup, you can leave `taneleer-holding` deployed to its `puckrin.github.io/taneleer-holding/` URL (no custom domain) — useful if the proper site has an outage.
