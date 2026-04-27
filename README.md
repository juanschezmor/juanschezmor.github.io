# Juan Sanchez Portfolio Platform

Personal portfolio built as a real serverless product: a public React site, a private admin panel, and an AWS backend used to manage portfolio content, skills, activity updates, work experience, project images, and bilingual CV versions.

The goal of this repository is not only to host a portfolio, but to evolve it into a DevOps/Cloud/Platform Engineering learning project. The current system already runs in production, and the roadmap is to move it progressively toward infrastructure as code, automated CI/CD, security scanning, tests, observability, and safer deployment patterns.

## Live System

- Public site: <https://juanschezmor.github.io>
- Admin panel: <https://juanschezmor.github.io/admin>
- Backend: AWS API Gateway + Lambda

The admin panel is private and requires credentials configured as Lambda environment variables. Local credential files are intentionally excluded from git.

## What The Product Does

- Presents a public portfolio with projects, experience, activity updates, skills, contact links, and downloadable CVs.
- Falls back to static local content when the API is unavailable, so the public site remains usable during backend incidents.
- Provides a private admin panel to manage dynamic content without editing source code.
- Supports project creation and image uploads backed by S3.
- Supports bilingual CV management:
  - upload PDF versions for English and Spanish
  - activate one version per language
  - keep a capped version history
  - protect active versions from deletion

## Architecture

```text
User browser
  |
  | GitHub Pages
  v
React + Vite frontend
  |
  | HTTPS requests
  v
AWS API Gateway /prod
  |
  +--> Content Lambdas
  |      - projects
  |      - experiences
  |      - activities
  |      - skills
  |      - resumes
  |      - project images
  |
  +--> Admin auth Lambdas
         - login
         - session validation

AWS data layer
  |
  +--> DynamoDB tables for metadata/content
  +--> S3 buckets for uploaded assets and PDF resumes
  +--> Lambda environment variables for runtime configuration
```

## Frontend

The frontend is a React 19 application built with Vite and TypeScript.

Key areas:

- `src/router.tsx` defines the public and admin routes.
- `src/pages/Home.tsx` renders the public portfolio.
- `src/pages/Admin/AdminPage.tsx` handles private admin access.
- `src/pages/Admin/*` contains admin views for projects, activities, skills, experiences, and resumes.
- `src/api/*` contains the browser API client and endpoint-specific modules.
- `src/context/*` provides app-level state and fallback handling.
- `src/constants.ts` provides local fallback content.

The API base URL is configured in `src/config/api.ts`. It can be overridden with `VITE_API_BASE_URL`.

## Backend

The backend is serverless and lives under `aws/`.

### Content Lambdas

`aws/content-lambdas/` contains Lambdas for:

- projects: list, create, update, delete
- experiences: list, create, update, delete
- activities: list, create, delete
- skills: list, create, delete
- resumes: list, upload, activate, delete, download
- project images: upload to S3
- admin auth: login and session validation

Shared helpers:

- `aws/content-lambdas/_shared/admin-auth.mjs`
- `aws/content-lambdas/_shared/resume-store.mjs`
- `aws/content-lambdas/_shared/project-images.mjs`

## Authentication Model

The admin panel uses a simple custom admin session model:

1. The user signs in through `/auth/login`.
2. `adminLogin` validates the submitted username/password against Lambda environment variables.
3. The backend issues an HMAC-signed token.
4. The browser stores the session locally.
5. Protected admin mutations send the token with `Authorization: Bearer <token>`.
6. Protected Lambdas validate the token before mutating data.

Required admin environment variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`
- `ADMIN_TOKEN_TTL_SECONDS`

This is intentionally simple for a personal admin panel. A future production-grade evolution could replace this with Cognito, OIDC, or another managed identity provider.

## Main API Surface

Public endpoints:

- `GET /projects`
- `GET /experiences`
- `GET /activities`
- `GET /skills`
- `GET /resumes`
- `GET /resumes/download?lang=en|es`

Admin endpoints:

- `POST /auth/login`
- `GET /auth/session`
- `POST /projects`
- `PUT /projects/{id}`
- `DELETE /projects/{id}`
- `POST /experiences`
- `PUT /experiences/{id}`
- `DELETE /experiences/{id}`
- `POST /activities`
- `DELETE /activities/{id}`
- `POST /skills`
- `DELETE /skills/{id}`
- `POST /resumes`
- `POST /resumes/{id}/activate`
- `DELETE /resumes/{id}`

## Resume Management Flow

The resume feature is a good example of the current cloud design:

1. Admin uploads a PDF from the admin panel.
2. Frontend converts the file to base64 and sends it to `POST /resumes`.
3. `createResume` validates language, file type, file size, and admin session.
4. The PDF is stored in S3.
5. Metadata is stored in DynamoDB.
6. One resume per language can be active.
7. Old inactive versions are pruned once the history limit is exceeded.
8. Public CV buttons use `GET /resumes/download?lang=en|es` to resolve the active file.

See `aws/content-lambdas/RESUMES_SETUP.md` for the lower-level resume storage notes.

## Deployment

### Frontend

The frontend is deployed to GitHub Pages.

```bash
npm run build
npm run deploy
```

`npm run deploy` builds the Vite app and publishes `dist/` to the `gh-pages` branch.

### Backend

The backend is currently deployed with PowerShell scripts and the AWS CLI.

Important scripts:

- `aws/deploy-admin-auth.ps1`
- `aws/content-lambdas/deploy-resumes.ps1`
- `aws/deploy-project-images.ps1`

These scripts package Lambda code, update function configuration, configure API Gateway resources, and manage some AWS permissions/resources.

This is useful automation, but it is not yet full infrastructure as code. The long-term goal is to replace or wrap these scripts with Terraform or AWS CDK.

## Local Development

Install dependencies:

```bash
npm install
```

Run the frontend locally:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Optional local API override:

```bash
VITE_API_BASE_URL=https://example.execute-api.eu-north-1.amazonaws.com/dev npm run dev
```

On PowerShell:

```powershell
$env:VITE_API_BASE_URL = "https://example.execute-api.eu-north-1.amazonaws.com/dev"
npm run dev
```

## Secrets And Local Files

The repo intentionally ignores local secrets and generated deployment artifacts:

- `admin-access.local.json`
- `public/admin_credentials.csv`
- `*.local`
- `dist/`
- `node_modules/`
- `aws/content-lambdas.zip`

Admin credentials and token secrets must be managed outside git.

## Current DevOps Maturity

| Area | Current state |
| --- | --- |
| Production frontend | Deployed on GitHub Pages |
| Production backend | Serverless AWS API with Lambda, API Gateway, DynamoDB, and S3 |
| Deployment automation | Manual scripts and `npm run deploy` |
| Infrastructure as Code | Partial scripting, not declarative IaC yet |
| CI/CD | Basic CI implemented with GitHub Actions; CD is still manual |
| Tests | Not implemented yet |
| Secret scanning | Gitleaks runs in CI on push and pull requests |
| Dependency updates | Dependabot monitors npm packages and GitHub Actions monthly with grouped PRs; frontend majors are handled manually |
| Observability | Basic AWS logs, no dedicated dashboards or alarms yet |
| Safer deployments | No canary or blue/green strategy yet |

## Platform Engineering Roadmap

This project is being evolved deliberately as a DevOps/Cloud learning path.

### Phase 1: Documentation And System Understanding

- Maintain this README as the functional and technical specification.
- Add an architecture diagram.
- Document operational flows such as admin login, content updates, and resume upload.

### Phase 2: Continuous Integration

- GitHub Actions workflow added in `.github/workflows/ci.yml`.
- Run `npm ci`.
- Run lint and production build on every push or pull request to `main`.
- Validate dependency installation for the consolidated Lambda package.

### Phase 3: Security Baseline

- Gitleaks secret scanning added to CI.
- Dependabot configuration added for frontend npm, Lambda npm, and GitHub Actions with grouped monthly PRs. Frontend major updates are reviewed manually.
- Review IAM permissions and reduce broad access where possible.

### Phase 4: Automated Frontend Deployment

- Replace manual `npm run deploy` with a GitHub Pages workflow.
- Deploy from `main` after CI passes.

### Phase 5: Tests

- Add unit tests for API mappers and client behavior.
- Add Lambda tests for auth, validation, and resume management edge cases.
- Add regression tests for admin workflows.

### Phase 6: Infrastructure As Code

- Model AWS resources with Terraform or AWS CDK.
- Start with low-risk resources such as DynamoDB tables and S3 buckets.
- Progressively include IAM, Lambda functions, API Gateway routes, and environment variables.
- Use `plan`/`diff` review before applying changes.

### Phase 7: Backend Delivery Pipeline

- Package Lambdas in CI.
- Run tests and secret scanning.
- Deploy infrastructure and code through GitHub Actions.
- Store sensitive values in GitHub Actions secrets or AWS Secrets Manager/SSM.

### Phase 8: Day 2 Operations

- Add CloudWatch alarms for Lambda errors and API Gateway failures.
- Add dashboards for traffic, latency, and error rates.
- Define rollback procedures.
- Explore Lambda aliases and canary deployments.
- Add runbooks for common incidents.

## Why This Project Matters

This repository is intentionally becoming more than a personal website. It is a compact platform that exposes real cloud engineering concerns:

- managing production configuration
- protecting private admin operations
- deploying frontend and backend independently
- storing and serving user-managed assets
- recovering from configuration drift
- improving deployment safety over time
- turning manual operations into repeatable platform workflows

That makes it a practical learning environment for DevOps, Cloud Engineering, and Platform Engineering.
