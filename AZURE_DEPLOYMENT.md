# Azure Deployment Guide — Homemade Pakistani Kitchen

A **beginner-friendly** walkthrough for deploying this app to Azure. If you've never used Azure before, follow the sections in order — every click is described.

> Architecture: **Azure Static Web Apps (SPA)** → **Azure Functions** (in `/api`) → **Cosmos DB** + **Azure Communication Services** + **Stripe** + **Application Insights**.

---

## 0. What you'll set up

```
Browser (React SPA)  ───►  Azure Static Web Apps  ───►  /api/*  ──►  Azure Functions (Node 20)
                                                                  ├──►  Cosmos DB (NoSQL)
                                                                  ├──►  Azure Communication Services (email + SMS)
                                                                  └──►  Stripe (payments + webhook)
                                Application Insights (telemetry, frontend + backend)
```

You'll create the resources **once**. After that, every `git push` to `main` redeploys automatically.

---

## 1. Prerequisites

1. An **Azure account** — create one at [azure.com/free](https://azure.com/free) (£200 free credit for 30 days).
2. A **GitHub account** with this repo pushed.
3. A **Stripe account** (you can stay in test mode for v1) — [stripe.com](https://stripe.com).
4. A web browser. *(No CLI required — every step below uses the Azure Portal UI.)*

---

## 2. Create Azure Cosmos DB (the database)

1. In the **Azure Portal** ([portal.azure.com](https://portal.azure.com)), click **Create a resource** (top-left **+**).
2. Search **Azure Cosmos DB** → **Create** → choose the **Azure Cosmos DB for NoSQL** card → **Create**.
3. Fill in:
   - **Subscription**: your subscription
   - **Resource Group**: click **Create new** → name it `hpk-rg`
   - **Account Name**: `hpk-cosmos-` plus a few random letters (must be globally unique)
   - **Location**: `UK South`
   - **Capacity mode**: **Serverless** (cheapest for low traffic)
   - **Apply Free Tier Discount**: **Apply** (saves £20–£25/month if available)
4. Click **Review + create** → **Create**. Wait ~5 minutes.
5. Once deployed, open the resource. In the left sidebar click **Data Explorer**.
6. Click **New Database** → ID: `hpk` → **OK**.
7. Inside `hpk`, click **New Container** four times, once for each:

   | Container ID | Partition key | Notes |
   |---|---|---|
   | `menu` | `/category` | Stores menu items |
   | `orders` | `/id` | One doc per order |
   | `contacts` | `/id` | Contact-form submissions |
   | `slots` | `/pk` | **Slot capacity + admin overrides** (`pk = "2026-06-10_lunch"`) |

8. From the left sidebar, click **Keys**. Copy and keep safe:
   - **URI** → this becomes `COSMOS_ENDPOINT`
   - **PRIMARY KEY** → this becomes `COSMOS_KEY`

### Seed the menu

The app reads the live menu from Cosmos. Seed data is in `api/seed/menu.seed.json`.

In Cosmos **Data Explorer** → `hpk` → `menu` → **Items** → **New Item**, paste each object from the seed file and **Save**. (For many items, use the **Cosmos DB Migration Tool** or a one-off Node script with `@azure/cosmos`.)

> The app also has a frontend fallback menu in `src/lib/menu-data.ts`, so you can launch even before seeding.

---

## 3. Create Azure Function App (already bundled in SWA)

You don't need a *standalone* Function App — Azure Static Web Apps has a built-in "managed Functions" runtime that runs everything inside `/api` automatically.

If you want a standalone Function App for advanced features (long-running jobs, durable functions):
1. **Create a resource → Function App** → **Consumption (Serverless)** plan, Node 20, Linux.
2. Configure deployment from GitHub Actions.
3. Update the SWA `staticwebapp.config.json` to proxy `/api/*` to it.

For v1 — **skip this**. The bundled SWA Functions runtime is enough.

---

## 4. Create Azure Communication Services (email + SMS)

1. **Create a resource** → search **Communication Services** → **Create**.
2. **Resource Group**: `hpk-rg` · **Name**: `hpk-comms` · **Data location**: `United Kingdom`.
3. **Review + create** → **Create**. Wait ~2 minutes.
4. Open the resource. Left sidebar → **Keys** → copy **Primary connection string** → this becomes `ACS_CONNECTION_STRING`.

### Set up email
1. Left sidebar → **Email** → **Domains** → **Add domain** → **Azure Managed Domain** (free; sender will be `DoNotReply@<something>.azurecomm.net`).
2. Wait for **Provisioned**. Click the domain, then **MailFrom addresses** → note the sender email → this becomes `ACS_SENDER_EMAIL`.

### Set up SMS (optional — UK numbers must be pre-approved)
1. Left sidebar → **Phone numbers** → **Get** → pick **United Kingdom**, **Toll-free** or **Alphanumeric Sender ID**.
2. Submit the regulatory form (takes 1–5 days for UK approval).
3. Once active, note the number in **E.164 format** (e.g. `+447XXXXXXXXX`) → this becomes `ACS_SENDER_PHONE`.

---

## 5. Stripe setup

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com). Make sure you're in **Test mode** (toggle top right).
2. **Developers → API keys**. Copy:
   - **Publishable key** (`pk_test_...`) → frontend env var `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...`) → backend env var `STRIPE_SECRET_KEY`
3. **Developers → Webhooks → Add endpoint**. (You'll set the URL after Step 8.)

---

## 6. Application Insights (monitoring)

1. **Create a resource → Application Insights**.
2. **Resource Group**: `hpk-rg` · **Name**: `hpk-insights` · **Region**: `UK South` · **Resource Mode**: **Workspace-based** (create a default workspace if asked).
3. **Review + create** → **Create**.
4. Open the resource → **Overview** → copy **Connection String** → this becomes both:
   - `VITE_APPINSIGHTS_CONNECTION_STRING` (frontend)
   - `APPLICATIONINSIGHTS_CONNECTION_STRING` (backend)

---

## 7. Generate an Admin Token

The `/admin` page is protected by a shared secret you choose now.

1. Generate a random 32-char string. For example, in any terminal:
   ```
   openssl rand -base64 32
   ```
   Or pick any long random string you'll remember (e.g. `abc123-very-long-secret-9z8y7x`).
2. Save this — it becomes the `ADMIN_TOKEN` env var in Step 9 **and** the token you paste into the **Admin → Slot management** page in the browser.

---

## 8. Create the Static Web App (frontend + Functions)

1. **Create a resource → Static Web App** → **Create**.
2. Fill in:
   - **Resource Group**: `hpk-rg`
   - **Name**: `hpk-web`
   - **Plan type**: **Standard** (Free works for testing; Standard unlocks more Functions features and custom auth)
   - **Region**: `West Europe`
   - **Deployment source**: **GitHub** → sign in → pick your repo and branch `main`
   - **Build preset**: **Custom**
     - App location: `/`
     - Api location: `api`
     - Output location: `dist/client`
3. Click **Review + create** → **Create**.

Azure will:
- Add a `AZURE_STATIC_WEB_APPS_API_TOKEN` GitHub secret automatically.
- Commit a new workflow file to your repo. **Delete the auto-generated workflow** (it'll be something like `azure-static-web-apps-<random>.yml`) — this repo already ships the correct one at `.github/workflows/azure-static-web-apps.yml`.

---

## 9. GitHub Secrets (frontend build)

In GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | (auto-created by SWA — verify it's there) |
| `VITE_API_BASE_URL` | `/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | from Step 5 (`pk_test_...`) |
| `VITE_APPINSIGHTS_CONNECTION_STRING` | from Step 6 |

---

## 10. Function App Settings (backend secrets)

Azure Portal → your Static Web App (`hpk-web`) → **Configuration → Application settings → Add**:

| Name | Value |
|---|---|
| `COSMOS_ENDPOINT` | from Step 2 |
| `COSMOS_KEY` | from Step 2 |
| `COSMOS_DB` | `hpk` |
| `ACS_CONNECTION_STRING` | from Step 4 |
| `ACS_SENDER_EMAIL` | from Step 4 |
| `ACS_SENDER_PHONE` | from Step 4 (optional) |
| `STRIPE_SECRET_KEY` | from Step 5 (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | filled after Step 12 |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | from Step 6 |
| `ADMIN_TOKEN` | from Step 7 |

Click **Save**. Functions pick these up via `process.env`.

---

## 11. Deploy

Just push to `main`:

```
git push origin main
```

GitHub Actions will:
1. Install deps, build the SPA → `dist/client/`
2. Bundle `api/` Functions
3. Upload everything to your Static Web App

Watch the run in GitHub → **Actions**. Once green (~3–5 mins), open your `https://<name>.azurestaticapps.net` URL.

---

## 12. Stripe webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. **Endpoint URL**: `https://<your-swa>.azurestaticapps.net/api/webhooks/stripe`
3. **Events to send**: `checkout.session.completed` (add more later if needed).
4. Click **Add endpoint**, then **Reveal signing secret** → copy `whsec_...`.
5. Back in Azure Portal → SWA → **Configuration** → update `STRIPE_WEBHOOK_SECRET` with that value → **Save**.

---

## 13. Custom domain

Azure Portal → SWA → **Custom domains → Add → Custom domain on other DNS**. Follow the CNAME/TXT verification — Azure provisions free managed SSL automatically.

---

## 14. Production release

When you're ready to switch from test to live:

1. In Stripe Dashboard, toggle to **Live mode** and copy the live keys.
2. Update the GitHub secret `VITE_STRIPE_PUBLISHABLE_KEY` and the Azure app setting `STRIPE_SECRET_KEY` with `pk_live_...` / `sk_live_...`.
3. Create a **new** webhook endpoint in Stripe Live mode → update `STRIPE_WEBHOOK_SECRET`.
4. Push any final code → wait for the green deploy.
5. Verify the live site by placing a £0.50 test order with a real card and refunding it.

---

## 15. Slot capacity model (how the 4-orders rule works)

Stored in Cosmos `slots` container, partition key `/pk`.

For each delivery date + slot, we use **one partition** with `pk` = `"YYYY-MM-DD_lunch"` or `"YYYY-MM-DD_dinner"`. Documents in that partition:

```
{ id: "2026-06-10_lunch",           pk: "2026-06-10_lunch", kind: "counter",      used: 3 }
{ id: "override:2026-06-10_lunch",  pk: "2026-06-10_lunch", kind: "override",     closed: true, reason: "Holiday" }
{ id: "dateOverride:2026-06-10",    pk: "2026-06-10",       kind: "dateOverride", closed: true }
```

- `POST /api/orders` calls `reserveSlot(date, slot)` → atomically reads the counter, rejects with 409 if `used >= 4` or `closed`, otherwise upserts `used+1`.
- `GET /api/slots?date=…` powers the checkout UI: shows "X of 4 left", marks full slots, hides them.
- `POST /api/admin/override` (header `x-admin-token`) closes individual slots or whole dates.
- The 2-hour cutoff is enforced both client-side (UI grey-out) **and** server-side in `isBeforeCutoff()`.

---

## 16. Admin page

After deploy, visit `https://<your-site>/admin`:
- Paste the `ADMIN_TOKEN` you set in Step 10.
- Pick a date to see occupancy per slot.
- Close individual slots or the whole day with one click.

Token is stored in `sessionStorage` so it persists until you close the tab.

---

## 17. Environment variables — quick reference

### GitHub Actions (frontend build secrets)
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `VITE_API_BASE_URL` (= `/api`)
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_APPINSIGHTS_CONNECTION_STRING`

### Azure SWA → Application settings (Function runtime)
- `COSMOS_ENDPOINT`, `COSMOS_KEY`, `COSMOS_DB`
- `ACS_CONNECTION_STRING`, `ACS_SENDER_EMAIL`, `ACS_SENDER_PHONE`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`
- `ADMIN_TOKEN`

---

## 18. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| GitHub Action red, "Oryx build failed" | Wrong `output_location` | Should be `dist/client` (already configured). |
| Site loads but `/api/*` returns 404 | Functions didn't deploy | Check **Actions** logs → the "Build and Deploy" step should mention `api`. Confirm `api/package.json` exists. |
| `POST /api/orders` returns 500, log says `COSMOS_ENDPOINT` undefined | App settings missing | Re-check Step 10. After adding, restart the SWA from the Portal. |
| Admin page says "Failed (check admin token)" | `ADMIN_TOKEN` mismatch | Make sure the value in Application settings matches what you paste in the page. |
| Slot capacity isn't decrementing | `slots` container missing | Create it in Cosmos Data Explorer with partition key `/pk`. |
| Stripe webhook gets `400` `Bad signature` | Wrong webhook secret | Copy `whsec_...` again from Stripe → update `STRIPE_WEBHOOK_SECRET`. |
| Emails not sending | ACS domain not provisioned | Step 4 — wait for the domain status to flip to **Provisioned**. |
| SPA refreshes 404 on deep links | `staticwebapp.config.json` fallback missing | Already configured — make sure that file wasn't deleted. |

---

## 19. Cost estimate (light traffic, v1)

| Service | Approx monthly |
|---|---|
| Static Web App (Standard) | ~£7 |
| Cosmos DB (Serverless) | £2–£8 |
| ACS — email | £0 (first 1k free) |
| ACS — SMS UK | ~£0.04 per SMS sent |
| App Insights | First 5 GB free |
| **Total** | **£10–£20 typical** |

---

That's it. Push to `main` and your kitchen is live.
