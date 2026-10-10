# Pregnancy Week Tracker & Calendar Sync (BloomTrack)

A React + TypeScript application for tracking pregnancy milestones week-by-week, synchronizing 36 milestone events directly to Google Calendar, and logging daily symptoms.

---

## 🚀 Publishing to GitHub Pages (Why it was blank & How to fix it)

If you saw a blank page after pushing to GitHub and turning on GitHub Pages, this was due to two common issues:

1. **Missing Base Path (`base: './'`)**: By default, Vite looks for assets at the root (`/assets/...`). When deployed on GitHub Pages (`https://<username>.github.io/<repo-name>/`), this causes `404 Not Found` errors for all JavaScript and CSS files. We have configured `base: './'` in `vite.config.ts`.
2. **Serving uncompiled `.tsx` files**: If GitHub Pages was set to deploy directly from the `main` branch root, browsers cannot run raw TypeScript/React files (`/src/main.tsx`). The app must be compiled into HTML/JS/CSS (`dist/` folder).

---

### Recommended: Automatic Deployment with GitHub Actions (1-Click)

A GitHub Actions workflow is configured at `.github/workflows/deploy.yml`.

1. Commit and push these updated files (`package.json`, `vite.config.ts`, `.github/workflows/deploy.yml`) to your GitHub repository:
   ```bash
   git add .
   git commit -m "Fix GitHub Pages deployment and dependency resolution"
   git push origin main
   ```
2. In your GitHub repository, navigate to **Settings** > **Pages** (under the "Code and automation" sidebar).
3. Under **Build and deployment** > **Source**, change the dropdown to **GitHub Actions** (if currently set to "Deploy from a branch").
4. Go to the **Actions** tab on your repository to watch the `Deploy to GitHub Pages` workflow run.
5. In ~1 minute, the build will succeed and your site will be live at `https://jeromeoooo.github.io/BloomTrack-GAS/`!

---

### Alternative: Deploy via `gh-pages` Branch

If you prefer building locally:

1. Build the production files:
   ```bash
   npm run build
   ```
2. Deploy the `dist` directory to the `gh-pages` branch using the `gh-pages` package:
   ```bash
   npx gh-pages -d dist
   ```
3. In GitHub **Settings** > **Pages**, set **Source** to **Deploy from a branch**, select `gh-pages` and `/ (root)`.

---

## 🔐 Firebase Auth Setup for GitHub Pages

To allow Google Sign-In on your GitHub Pages domain:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`gen-lang-client-0682025546`).
3. Go to **Authentication** > **Settings** tab > **Authorized domains**.
4. Click **Add domain** and enter your GitHub Pages domain:
   ```text
   <your-github-username>.github.io
   ```
5. Save. Google Sign-In and Calendar synchronization will now work smoothly on your published site!
