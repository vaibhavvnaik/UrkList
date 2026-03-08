# Refractory Policy — Org-Wide Secret Scanning

This document explains how to enforce secret scanning **centrally across all
repositories** in your GitHub Organization using **Organization Rulesets** with
a **Required Workflow**.

Once configured, **no per-repo setup is needed** — the policy applies
automatically to every repo (existing and new).

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│          GitHub Organization Ruleset             │
│  (Settings → Rules → Rulesets)                   │
│                                                  │
│  Target: All repositories                        │
│  Rule:   Require workflow to pass                │
│          → urk/.github/workflows/secret-scan.yml │
└──────────────────────┬──────────────────────────┘
                       │
                       │  automatically injected into
                       │  every PR / push across the org
                       ▼
┌──────────────────────────────────────────────────┐
│  secret-scan.yml  (reusable workflow)            │
│  • Scans changed files for 13+ secret patterns  │
│  • Blocks merge if secrets are found             │
│  • Reports exact file & line via GitHub annotations│
└──────────────────────────────────────────────────┘
```

---

## One-Time Setup (Org Admin)

### Step 1: Ensure the workflow exists

The reusable workflow lives at:
```
urk/.github/workflows/secret-scan.yml
```
It is already committed in this repository.

### Step 2: Create an Organization Ruleset

1. Go to your **GitHub Organization** → **Settings** → **Rules** → **Rulesets**
2. Click **"New ruleset"** → **"New branch ruleset"**
3. Configure:

| Setting               | Value                                        |
|-----------------------|----------------------------------------------|
| Ruleset name          | `Refractory Policy — Secret Scan`            |
| Enforcement status    | **Active**                                   |
| Target repositories   | **All repositories** (or select specific)    |
| Target branches       | **Default branch** + any others you want     |

4. Under **Rules**, enable **"Require workflows to pass before merging"**
5. Click **"Add workflow"**:
   - **Repository**: `<your-org>/urk`
   - **Workflow file**: `.github/workflows/secret-scan.yml`
   - **Ref**: `main`
6. Click **"Create"**

### Step 3: Verify

1. In any repo in the org, create a branch and add a file with a test secret:
   ```
   const key = "AKIAIOSFODNN7EXAMPLE1"
   ```
2. Open a PR — the secret scan check should appear and **fail**.
3. Remove the secret, push again — check passes.

---

## What Gets Scanned

| Pattern                        | Example                                          |
|-------------------------------|--------------------------------------------------|
| MongoDB connection strings    | `mongodb+srv://user:pass@host`                   |
| AWS Access Keys               | `AKIAIOSFODNN7EXAMPLE`                           |
| AWS Secret Keys               | `aws_secret_access_key = ...`                    |
| Generic API keys              | `api_key = "abc123..."`                           |
| Passwords / tokens / secrets  | `password = "hunter2"`                            |
| Private key blocks            | `-----BEGIN RSA PRIVATE KEY-----`                |
| Slack tokens                  | `xoxb-...`                                       |
| GitHub tokens                 | `ghp_...`                                        |
| Stripe keys                   | `sk_live_...`                                    |
| Google API keys               | `AIza...`                                        |
| Bearer tokens                 | `authorization = "Bearer ..."`                   |
| Hex/Base64 secrets            | `secret = "4a6f686e..."` (32+ hex chars)         |
| Generic connection strings    | `://user:pass@host`                              |

---

## Skipped Files

The scanner automatically ignores:
- Binary files
- Lock files (`*.lock`)
- Images, fonts, and SVGs
- `node_modules/`
- `.env.example` / `.env.sample`
- The scanner script itself

---

## FAQ

**Q: Do individual repos need any configuration?**
No. The Organization Ruleset injects the workflow automatically.

**Q: Can a repo opt out?**
Only if the ruleset targets specific repos instead of "All repositories".
Org admins control this.

**Q: What if a repo legitimately needs a key in code (e.g., a public API key)?**
Use GitHub Secrets + `${{ secrets.NAME }}` in workflows, or environment
variables loaded at runtime. Never hardcode secrets.

**Q: Can developers bypass this?**
No. Organization Rulesets cannot be overridden by repo admins or contributors.
Only org admins can modify or disable the ruleset.
