# CarteiraMonolito

Angular 20 SPA — personal wallet tracker. Deployed to Heroku via a GitHub Actions CI/CD pipeline.

---

## Local development

```bash
npm install
npm run dev        # starts Angular dev server at http://localhost:4200
```

The app reloads automatically when source files change.

### Code scaffolding

```bash
ng generate component component-name
ng generate --help   # list all available schematics
```

### Unit tests (interactive)

```bash
npm test           # Karma + Chrome (watch mode)
```

### Unit tests (headless, same as CI)

```bash
npm run test:ci    # Karma + ChromeHeadless, single run
```

### Production build

```bash
npm run build      # equivalent to ng build --configuration production
```

Artifacts are written to `dist/carteira-monolito/browser/`.

### Preview production build locally

```bash
npm run build
npm start          # node server.js, listens on PORT (default 8080)
```

---

## CI/CD pipeline

The pipeline lives in `.github/workflows/ci-deploy.yml` and runs on every push and pull-request targeting `main`.

### Jobs

| Job | Trigger | Steps |
|-----|---------|-------|
| **Build & Test** | push / PR / `workflow_dispatch` | checkout → install → production build → upload artifact → headless unit tests |
| **Deploy to Heroku** | push or `workflow_dispatch` to `main` only, after CI passes | checkout (full history) → `akhileshns/heroku-deploy` |

- The deploy job has `concurrency: deploy-production` with `cancel-in-progress: false` to prevent overlapping releases.
- Failed CI always blocks deployment.
- Use **Actions → Run workflow** in the GitHub UI for a manual redeploy or rollback trigger.

---

## Heroku setup

### One-time app creation

```bash
heroku login
heroku create <your-app-name>
```

Heroku detects the Node.js buildpack automatically. On each deploy it:
1. Runs `npm ci`
2. Runs `npm run heroku-postbuild` (`ng build --configuration production`)
3. Starts the web dyno with `node server.js` (reads `Procfile`)

### Required GitHub repository secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `HEROKU_API_KEY` | Your Heroku API key (`heroku auth:token`) |
| `HEROKU_APP_NAME` | The Heroku app name (e.g. `carteira-monolito`) |
| `HEROKU_EMAIL` | The email associated with your Heroku account |

### Optional: protect the `production` environment

In **Settings → Environments → production** you can add required reviewers so every deploy needs manual approval before it reaches Heroku.

---

## Release & rollback

**View recent releases:**
```bash
heroku releases --app <your-app-name>
```

**Roll back to a previous release:**
```bash
heroku rollback v<number> --app <your-app-name>
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Heroku build fails with "Cannot find module '@angular/cli'" | `devDependencies` pruned | Make sure `NPM_CONFIG_PRODUCTION=false` is set in Heroku config vars, or move Angular CLI to `dependencies` |
| App boots but routes return 404 on refresh | SPA fallback missing | `server.js` catches all `GET *` routes; re-deploy and verify `Procfile` is committed |
| `ChromeHeadless` not found in CI | Chrome not installed | `ubuntu-latest` runners include Chrome; confirm runner image hasn't changed |
| Deploy job skipped even on `main` | Branch name mismatch | Ensure the default branch in GitHub is named `main` |
| Heroku `H10 app crashed` | `node server.js` error | Check `heroku logs --tail --app <your-app-name>` |

---

## Additional resources

- [Angular CLI reference](https://angular.dev/tools/cli)
- [Heroku Node.js support](https://devcenter.heroku.com/articles/nodejs-support)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
