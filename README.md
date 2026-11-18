# LunaShield — interactive 3D engineering explainer

Conceptual visualization of a flexible electrodynamic dust shield (EDS). **Not** a flight-qualified product, **not** a field solver, **not** experimental evidence. See `CLAUDE.md` for the full spec.

```
npm install
npm run dev     # local dev
npm test        # unit + UI tests
npm run build   # static build (Vercel / Cloudflare Pages)
```

## Status
- Verified by automated tests: cost/BOM logic, phase timing, clearing efficiency, image segmentation, config data, UI panels (24 tests).
- NOT yet visually QA'd in a browser: the WebGL scene (typechecks and builds; needs a manual pass on the presentation laptop).
- All engineering values are tagged ASSUMPTION / TARGET / ESTIMATE / UNVERIFIED; no experimental data is recorded.
