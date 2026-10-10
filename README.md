# Pregnancy Week Tracker & Calendar Sync (BloomTrack)

A React + TypeScript application for tracking pregnancy milestones week-by-week, synchronizing 36 milestone events directly to Google Calendar, and logging daily symptoms.

---

## 🚀 Publishing to GitHub Pages (Why it was blank & How to fix it)

If you saw a blank page after pushing to GitHub and turning on GitHub Pages, this was due to two common issues:

1. **Missing Base Path (`base: './'`)**: By default, Vite looks for assets at the root (`/assets/...`). When deployed on GitHub Pages (`https://<username>.github.io/<repo-name>/`), this causes `404 Not Found` errors for all JavaScript and CSS files. We have configured `base: './'` in `vite.config.ts`.
2. **Serving uncompiled `.tsx` files**: If GitHub Pages was set to deploy directly from the `main` branch root, browsers cannot run raw TypeScript/React files (`/src/main.tsx`). The app must be compiled into HTML/JS/CSS (`dist/` folder).

---

### Recommended: Automatic Deployment with GitHub Actions (1-Click)

A GitHub Actions workflow has already been configured at `.github/workflows/deploy.yml`.

1. Commit and push these updated files to your GitHub repository.
2. In your GitHub repository, navigate to **Settings** > **Pages** (under the "Code and automation" sidebar).
3. Under **Build and deployment** > **Source**, change from **"Deploy from a branch"** to **"GitHub Actions"**.
4. GitHub will automatically trigger the workflow, build the app with `npm run build`, and publish the production build.
5. In a couple of minutes, your site will be live and fully functional!

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
