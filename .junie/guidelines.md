### Build/Configuration Instructions

This is a SvelteKit + TypeScript + Tailwind CSS app. Project‑specific highlights and gotchas:

- Node.js: Developed and verified on Node 18.19.x. If using Node 18, pin Vitest to ~1.6.x for compatibility.
- Install deps:
  ```bash
  npm install
  ```
- Run dev server (Vite):
  ```bash
  npm run dev
  ```
- Production build:
  ```bash
  npm run build
  ```
- Preview built app:
  ```bash
  npm run preview
  ```
- Type/svelte checks (uses `svelte-check` and repo `tsconfig.json`):
  ```bash
  npm run check
  ```

Routing/content specifics
- Address‑scoped routing: `src/routes/[address]` drives per‑address pages. A create flow exists at `src/routes/[address]/create/+page.svelte`.
- Markdown routing: `src/routes/[address]/[...path=markdown]` handles markdown content under an address.
- URL rewriting for assets: `src/lib/utils.ts` implements `rewriteUrls(html, address, currentPath?)` to convert relative `src`/`href` into absolute `http://{address}/...` URLs. This is crucial when rendering markdown so images/links resolve correctly against the AntTP address.

Tailwind
- Tailwind v4 utilities are used inline; configuration is via `postcss.config.js` and Svelte integration in `svelte.config.js`. No custom theme overrides are required for basic usage in current code.

### Testing Information

We use Vitest. For Node 18, use `vitest@1.6.x`.

Install (only if missing):
```bash
npm i -D vitest@1.6.0
```

Run tests:
```bash
npx vitest run      # single run
npx vitest          # watch mode
```

Add tests:
- Co‑locate unit tests next to source files using `*.test.ts`/`*.spec.ts`.
- Prefer testing pure utilities (e.g., `src/lib/utils.ts`) outside of Svelte runtime for speed/stability.

Demo: create‑run‑delete a simple test (validated)
The following sequence was executed successfully locally to verify the example works on this repository/state.

1) Create a temporary test file:
```bash
cat > tmp/demo_rewriteUrls.test.ts <<'EOF'
import { describe, it, expect } from 'vitest';
import { rewriteUrls } from '../src/lib/utils';

describe('demo rewriteUrls', () => {
  it('rewrites a simple relative src', () => {
    const html = '<img src="pic.jpg">';
    const result = rewriteUrls(html, 'traktion');
    expect(result).toBe('<img src="http://traktion/pic.jpg">');
  });
});
EOF
```

2) Run just this test:
```bash
npx vitest run tmp/demo_rewriteUrls.test.ts
```
Expected output: 1 file passed, 1 test passed.

3) Remove the temporary test file to keep the repo clean:
```bash
rm -f tmp/demo_rewriteUrls.test.ts
```

Guidelines for future tests
- Assertions: When comparing HTML strings, assert on minimal, stable substrings to avoid brittleness (e.g., only verify rewritten `src` attribute) unless you explicitly intend to test full rendering.
- Paths: For nested markdown, pass `currentPath` to `rewriteUrls` so relative links are resolved relative to the document directory.
- Test location: Co‑located test files are fine during development; prefer removing ad‑hoc demo tests before committing unless they provide lasting value.

### Additional Development Information

Code style
- Follow existing formatting and idioms in Svelte components and TS modules.
- Keep Svelte `<script lang="ts">` lean; move reusable logic to `src/lib`.

Markdown/preview pipeline
- `src/lib/ArticlePreview.svelte` consumes listing items and renders previews for `.md` files in `src/routes/[address]/+page.svelte`.
- Only items where `item.type === 'FILE' && item.name.endsWith('.md')` are previewed; adjust logic here if directory or other content types need listing.

Error surfacing
- `src/routes/[address]/+page.svelte` displays `data.error` inline; ensure server/load functions set this consistently for DX when integrating backends.

Known compatibility notes
- Vitest ≥4 requires Node 20+. On Node 18, use ~1.6.x.
- Svelte 4 and Vite 5 are in use; prefer up‑to‑date plugins matching these major versions.
