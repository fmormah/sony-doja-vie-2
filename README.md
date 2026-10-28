# Doja Cat: Club Vie

Public portfolio demo: [Open the live project](https://fmormah.github.io/sony-doja-vie-2/).

## GitHub Pages

Pushes to `main` build and deploy automatically through `.github/workflows/pages.yml`. Use Node.js 24 and `npm ci` for reproducible installs. Local development remains available with `npm run dev`.

To reproduce the hosted build locally:

```sh
GITHUB_PAGES=true NEXT_PUBLIC_PORTFOLIO_DEMO=true NEXT_PUBLIC_BASE_PATH=/sony-doja-vie-2 NEXT_PUBLIC_URL=https://fmormah.github.io/sony-doja-vie-2 NEXT_PUBLIC_AUTH_MODE=localhost npm run build:pages
```

`out/` is the deployable static site. The post-build script scopes public media URLs to the repository path, including CSS, browser bundles, and exported pages. Campaign analytics are disabled in portfolio mode.

The hosted version uses the existing local authentication demo. It does not connect visitor music accounts or submit campaign registrations. Original integration code is retained for separately configured deployments.

## Automated tests

Run `npm run test:ci` for the complete application suite. GitHub Pages runs it before building and publishing; a failing test blocks deployment.

Integration coverage uses the real application store, session storage, splash, sign-in, preloader, post-load, and club-entrance components. It exercises the demo journey through dancefloor entry, session restoration, invalid scene URLs, background clicks, and unmount cleanup. Authentication tests cover provider readiness, email validation, pending/failed/successful Apple sign-in, retries, Spotify superfan state, and one-time advancement. Loader tests check timing and both successful and failed asset loading; transition tests check repeated clicks and cancellation.

External authentication services, audio playback, and decorative 3D rendering are mocked. These tests verify application behavior in jsdom, not real OAuth services, visual rendering, or device/browser compatibility.

## Original project notes

# NextJS Starter

This template is intended to speed up the creation of new projects using NextJS as well as centralise team decisions regarding development tooling.

## App folder vs Pages folder

Next.js supports two paradigms for building a site with, the app folder and the pages folder. The app folder is their newest option, making use of modern React 18 features as well as various other Development Experience benefits. For that reason, this tempate targets the app folder. However, there are valid reasons to avoid the app folder, e.g. site requires page transitions, at a clients request, library support, etc.

## Deployment to Vercel

This template is ready to be deployed to Vercel, typically via their [web UI](https://vercel.com/new). Ensure that your newly created project is part of the Phantom Studios org.

### Domain Env Variables

NEXT_PUBLIC_URL = The final production URL.

## Styling

CSS Components is installed, which is Phantom's in-house styling solution.

An example for how this is used can be found in `src/components/RootLayout`, and documentation can be found [here](https://css-components.net).

### Theming

Theming is primarily handled via scss variables, which are declared in `*.scss` files found in `theme/*`. Local font files should be found in `theme/fonts/*`, and a string of font variables is exported from `theme/fonts/index.ts`, which can be added to the DOM to allow access to all fonts in CSS.

### Linting

This template uses `stylelint` as an opinionated style linter. Properties are ordered alphabetically, to minimise friction for devs switching between Google projects and back.

## Documentation

Complex application functionality should be documented in the repo when relevant and linked to here, for example:

[Example Feature Doc](./docs/EXAMPLE.md)

## README's

After using this template, this README should be replaced with the [example README](./Example%20README.md), which should be updated and populated with the relevant content for the project.


## Support

This section contains resources/learnings from past projects that may be useful.

### Middleware

[Incorrect middleware asset processing](https://docs.google.com/document/d/1xaTQ_oJzCxkeaUAaHEcH4SqMEnfEBvoXLRAtFN1y1Lw)
