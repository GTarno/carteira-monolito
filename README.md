# CarteiraMonolito

Angular 20 SPA — personal wallet tracker. Deployed to GitHub Pages via a GitHub Actions CI/CD pipeline.

---

## Documentation

- [docs/UI.md](docs/UI.md) — UI guide (Tailwind + DaisyUI, themes, icons, dialogs, charts)
- [docs/PLANO_DE_ACAO.md](docs/PLANO_DE_ACAO.md) — action plan
- [docs/BACKEND_SPRING_BOOT.md](docs/BACKEND_SPRING_BOOT.md) — backend plan

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
npx http-server dist/carteira-monolito/browser -p 8080 -P "http://localhost:8080?"
```

Then open http://localhost:8080. The `-P` flag sends unknown routes back to `index.html`, like the `404.html` fallback on Pages.

---

## CI/CD pipeline

The pipeline lives in `.github/workflows/ci-deploy.yml` and runs on every push and pull request targeting `master`.

| Job | Trigger | Steps |
|-----|---------|-------|
| **Build & Test** | push / PR / `workflow_dispatch` | checkout → install → headless unit tests → production build with `--base-href /<repo>/` → copy `index.html` to `404.html` → upload Pages artifact (not on PRs) |
| **Deploy to GitHub Pages** | push or `workflow_dispatch` on `master`, after CI passes | `actions/deploy-pages` |

- Failed tests or build always block deployment.
- Use **Actions → CI / Deploy → Run workflow** for a manual redeploy.
- To roll back, revert the commit on `master` (or re-run an older successful workflow run).

---

## GitHub Pages setup (one time)

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `master` (or run the workflow manually).

The site is published at `https://<user>.github.io/carteira-monolito/`.

### How routing works on Pages

GitHub Pages only serves static files and has no URL rewrites. The workflow copies `index.html` to `404.html`, so a direct link or refresh on a route such as `/carteira-monolito/planejamentos` loads the Angular app, which then renders the right page. The HTTP status for those URLs is 404, which browsers ignore for display purposes.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Deploy job fails with "Get Pages site failed" / 404 | Pages not enabled for Actions | **Settings → Pages → Source: GitHub Actions** |
| Blank page, assets 404 in the console | Wrong `--base-href` | It must be `/<repository-name>/` with both slashes |
| Route works by clicking but not on refresh | `404.html` missing | Check the "Add SPA fallback" step ran |
| `ChromeHeadless` not found in CI | Chrome not installed | `ubuntu-latest` runners include Chrome; confirm runner image hasn't changed |

---

## Additional resources

- [Angular CLI reference](https://angular.dev/tools/cli)
- [GitHub Pages with custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
