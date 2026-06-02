# Azure Deployment Guide — Homemade Pakistani Kitchen

This guide walks you through deploying the app to **Azure Static Web Apps** (frontend SPA) + **Azure Functions** (backend, bundled in `/api`) + **Cosmos DB** + **Azure Communication Services** + **Stripe**.

---

## 0. Architecture

```
Browser (SPA)  ───►  Azure Static Web Apps  ───►  /api/*  ──►  Azure Functions (Node 20)
                                                              │
                                                              ├──►  Cosmos DB (NoSQL)
                                                              ├──►  Azure Communication Services (email + SMS)
                                                              └──►  Stripe (payments + webhook)
                                Application Insights (telemetry, both SPA & Functions)
```

Azure SWA includes a "managed Functions" runtime. The `api/` folder in this repo is auto-deployed by the GitHub Action and exposed at `https://<your-app>.azurestaticapps.net/api/*`. No separate Function App is required for the basic plan.

---

## ⚠️ Important: SPA vs SSR

The project currently uses **TanStack Start with SSR**. Azure SWA serves **static assets only** for the frontend. Before your first deploy you must build the app as a client-only SPA. Two options:

**Option A — Quickest:** keep the routes, switch the build target to a Vite SPA (`vite build` outputting to `dist/` with `index.html`). Lose SSR-time SEO prerendering (meta tags still work client-side; crawlers like Google render JS).

**Option B — Full SSR:** Azure SWA is the wrong target. Use **Azure Container Apps** or **App Service** with the Node SSR server. Ask and I'll re-scaffold for that.

The GitHub workflow assumes Option A (output `dist/`). Tell me when you want to flip the build and I'll wire it.

---

## 1. Prerequisites

- Azure subscription (free tier works)
- GitHub repo connected to this Lovable project
- Stripe account (test mode is fine for v1)
- Azure CLI installed locally (`az login`)

---

## 2. Provision Azure Infrastructure

Run these from your terminal. Replace `hpk` / region as needed.

```bash
# Variables
RG=hpk-rg
LOC=uksouth
APP=hpk-web
COSMOS=hpk-cosmos-$RANDOM
ACS=hpk-comms
AI=hpk-insights

az group create -n $RG -l $LOC
```

### 2a. Cosmos DB (NoSQL API)

```bash
az cosmosdb create -n $COSMOS -g $RG \
  --kind GlobalDocumentDB \
  --default-consistency-level Session \
  --locations regionName=$LOC failoverPriority=0 isZoneRedundant=False

az cosmosdb sql database create -a $COSMOS -g $RG -n hpk

# Containers (partition keys chosen for v1)
az cosmosdb sql container create -a $COSMOS -g $RG -d hpk -n menu     --partition-key-path /category --throughput 400
az cosmosdb sql container create -a $COSMOS -g $RG -d hpk -n orders   --partition-key-path /id       --throughput 400
az cosmosdb sql container create -a $COSMOS -g $RG -d hpk -n contacts --partition-key-path /id       --throughput 400

# Get connection details (save for step 4)
az cosmosdb show         -n $COSMOS -g $RG --query documentEndpoint -o tsv
az cosmosdb keys list    -n $COSMOS -g $RG --query primaryMasterKey -o tsv
```

### 2b. Azure Communication Services (email + SMS)

```bash
az communication create -n $ACS -g $RG --location global --data-location uk

# Connection string
az communication list-key -n $ACS -g $RG --query primaryConnectionString -o tsv
```

Then in the Azure Portal:
- **Email**: ACS → *Domains* → add an **Azure-managed domain** (free, `DoNotReply@xxxx.azurecomm.net`) or verify your own domain. Note the sender address.
- **SMS**: ACS → *Phone numbers* → buy a UK number (toll-free or alphanumeric sender ID for the UK). Note the number (E.164 format, e.g. `+447XXXXXXXXX`).

### 2c. Application Insights

```bash
az monitor app-insights component create -a $AI -g $RG -l $LOC --kind web

az monitor app-insights component show -a $AI -g $RG --query connectionString -o tsv
```

### 2d. Azure Static Web App

Easiest in the portal so it auto-creates the GitHub workflow + deployment token:

1. Portal → **Create Static Web App** → Plan: **Standard** (Free works but Standard unlocks more Functions features).
2. Source: **GitHub** → pick this repo, branch `main`.
3. Build presets: **Custom**
   - App location: `/`
   - Api location: `api`
   - Output location: `dist`
4. Click **Create**. Azure will:
   - Generate a `AZURE_STATIC_WEB_APPS_API_TOKEN` GitHub secret automatically.
   - Commit a workflow file. **Delete the auto-generated one** and keep the version in this repo (`.github/workflows/azure-static-web-apps.yml`) — it has the right env vars.

---

## 3. GitHub Secrets

In your GitHub repo → **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | (auto-created by SWA — verify it's there) |
| `VITE_API_BASE_URL` | `/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `VITE_APPINSIGHTS_CONNECTION_STRING` | (from step 2c) |

---

## 4. Function App Settings (Backend Secrets)

In the Azure Portal → your Static Web App → **Configuration → Application settings**, add:

| Name | Value |
|---|---|
| `COSMOS_ENDPOINT` | from step 2a |
| `COSMOS_KEY` | from step 2a |
| `COSMOS_DB` | `hpk` |
| `ACS_CONNECTION_STRING` | from step 2b |
| `ACS_SENDER_EMAIL` | e.g. `DoNotReply@xxx.azurecomm.net` |
| `ACS_SENDER_PHONE` | e.g. `+447XXXXXXXXX` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | (set after step 6) |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | from step 2c |

Click **Save**. Functions pick these up via `process.env`.

---

## 5. Seed the Menu

Use the seed JSON in `api/seed/menu.seed.json`. Quickest path:

```bash
# Install Cosmos data migration tool, or just use the Portal Data Explorer:
# Cosmos DB → Data Explorer → hpk > menu > Items > Upload Item → paste each object
```

Or write a one-off script using `@azure/cosmos` reading the seed file.

---

## 6. Stripe Webhook

1. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://<your-swa-hostname>/api/webhooks/stripe`
3. Events: `checkout.session.completed`
4. Reveal the **Signing secret** (`whsec_...`) and put it in `STRIPE_WEBHOOK_SECRET` in step 4.

---

## 7. Deploy

Just push to `main`. The GitHub Action will:
1. Install + build the SPA (`dist/`)
2. Build & bundle `api/` Functions
3. Upload both to your SWA

Watch the Action logs; once green, visit your `*.azurestaticapps.net` URL.

---

## 8. Custom Domain

Portal → Static Web App → **Custom domains** → Add → follow CNAME/TXT instructions. Free managed SSL.

---

## 9. Observability

- **Application Insights**: live metrics, failures, traces for both SPA (via `@microsoft/applicationinsights-web`) and Functions (auto-instrumented via `APPLICATIONINSIGHTS_CONNECTION_STRING`).
- **Log Analytics**: queryable via KQL in the Portal.

---

## 10. Cost (v1, light traffic)

| Service | Approx monthly |
|---|---|
| Static Web App (Standard) | ~£7 |
| Cosmos DB (3× 400 RU/s autoscale or free tier) | £0 (free tier) – £18 |
| ACS email | £0 (1k free) then ~£0.0002/email |
| ACS SMS UK | ~£0.04 per SMS sent |
| App Insights | first 5 GB free |
| **Total** | **£10–£30** typical |

---

## 11. What's Left to Wire in the Frontend

The frontend currently uses **mocked menu + orders in `localStorage`**. To go live, swap these for real `fetch('/api/menu')`, `POST /api/orders`, then `POST /api/checkout` to get the Stripe URL. Say the word and I'll do that wiring.
