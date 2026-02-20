# IMIM 2.0

IMIM 2.0 is a SvelteKit application for browsing and publishing markdown content to Autonomi over the AntTP protocol.

It expects a local AntTP instance and a browser proxy configuration to route requests to Autonomi. See the notes below.

## Development

Requirements:
- Node.js 18.19.x

Install dependencies:
```bash
npm install
```

Run the dev server (Vite):
```bash
npm run dev
```

Type/svelte checks:
```bash
npm run check
```

## Build (Static Site Generation)

This project uses `@sveltejs/adapter-static` to generate a static build suitable for hosting on any static host. Client-side navigation is enabled with a fallback `index.html` for dynamic routes, allowing the application to function as a Single Page Application (SPA).

Build for production:
```bash
npm run build
```

To build for a specific subdirectory (e.g., `/blog`), use the `BASE_PATH` environment variable:
```bash
BASE_PATH=/blog npm run build
```

Preview the built app:
```bash
npm run preview
```

## AntTP proxy requirement

To resolve addresses and publish content, ensure a local AntTP instance is running and your browser is configured to proxy AntTP endpoints locally. Without this, network operations in the app will fail.

## About and documentation

An `About` page is available at `/about` with links to:
- Code: https://github.com/traktion/imim2
- Developer bio: https://www.linkedin.com/in/paul-s-green/
- Autonomi: https://autonomi.com/
