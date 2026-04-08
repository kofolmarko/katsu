# katsu — PSP 3D Viewer (Next.js)

Standalone Next.js app: interactive 3D PSP model with a live iframe on the screen via CSS3DRenderer.

## Stack

Next.js 16 (App Router) · React 19 · React Three Fiber · @react-three/drei · Three.js · TypeScript

## Key files

| File | Purpose |
|------|---------|
| `lib/config.ts` | Single source of truth — all 3D positions, scale, rotation, lighting, camera, iframe URL |
| `components/PSPViewer.tsx` | R3F Canvas + OrbitControls + WebGL context loss handling |
| `components/PSPModel.tsx` | Loads `public/models/sony_psp.glb` via `useGLTF` |
| `components/IframeScreen.tsx` | CSS3DRenderer integration; embeds iframe in 3D space |
| `components/Lights.tsx` | Scene lighting |
| `app/page.tsx` | Entry — dynamic-imports `PSPViewer` with `ssr: false` |

## Notes

- React Strict Mode is **off** (`next.config.js`) — prevents double-mount WebGL context loss in dev
- Turbopack enabled; webpack externalises `utf-8-validate` / `bufferutil`
- Backface culling in `IframeScreen.tsx` hides iframe when PSP is viewed from the back
- Tweak all scene values in `lib/config.ts` — avoid hardcoding in components

## Dev

```bash
pnpm dev    # Turbopack dev server
pnpm build
pnpm start
```
