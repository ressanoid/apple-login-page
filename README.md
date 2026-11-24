# apple-login-page

A small two-step sign-in page built with React, Vite, Tailwind CSS and shadcn/ui, preceded by a standalone intro page. The email is validated first; once valid, the password field appears. Successful submissions are written to Cloud Firestore and the app is hosted on Firebase Hosting.

> **Demo only — do not use a real password.** This app stores the raw email and password in plaintext in Firestore so the flow can be demonstrated without Firebase Auth. It is not a production-ready authentication system.

## Stack

- React 19 + Vite 8 (TypeScript)
- Tailwind CSS v4 + shadcn/ui (`base-nova` preset, Base UI primitives)
- Zod for validation
- Firebase Web SDK (Firestore) + Firebase Hosting
- Lucide icons, Geist variable font

## Features

- Standalone intro page at `/` with a configurable title and copy; its Continue link opens the login at `/login`
- Two-step form: email, then password
- Invalid input: red border, shake animation and inline error
- Valid input: green border and confirmation; password field slides in
- Light/dark theme toggle at the top of the page, persisted in `localStorage`, with the Apple logo swapping between black and white assets
- iCloud-inspired styling: blue accent palette, soft ambient background, translucent card and the colorful dotted-ring Apple mark (`assets/apple.svg`) whose ring rotates slowly (disabled under `prefers-reduced-motion`)
- Demo-only plaintext warning shown in the UI
- Firestore Security Rules that allow only validated `create` operations on `logins` and deny all reads, updates and deletes

## Getting started

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your own Firebase **web app config**. The file is gitignored and must never be committed.

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<project-id>.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Web app ID |

Then run:

```bash
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build locally
```

## Deployment

```bash
firebase deploy --only firestore:rules,hosting --project <your-firebase-project-id>
```

`firebase.json` configures Hosting to serve `dist/`: `/` is rewritten to the intro page `/intro.html`, and all other paths use the SPA rewrite to `/index.html`. It also points Firestore at `firestore.rules`. `vercel.json` has the equivalent rewrites for Vercel.

## Intro page

Edit `public/intro.html` to change the page shown at `/`. The `CONFIG` object near the top of the file controls the browser tab title, heading, body text, button label and button destination (`/login` by default). Changes appear immediately in `npm run dev` and `npm run preview`; a production deployment needs a rebuild. The React login screen remains available at `/login`.

## Notes

- `.env.local` holds the real web config and is excluded by `*.local` in `.gitignore`. No Firebase credentials are included in this repository.
- Firestore rules validate field types and formats. A `createdAt` recency check was deliberately avoided because it rejects writes made with `serverTimestamp()`; the rules check `data.createdAt is timestamp` instead.
- The theme hook lives in `src/hooks/use-theme.ts`; `index.html` includes a small inline script to avoid a flash of the wrong theme on load.
- `assets/apple.svg` is inlined so its `--theme-color-systemBlack` glyph follows the active theme; `public/favicon.svg` is the browser tab icon.
