# PSP 3D Viewer

A Next.js application showcasing a 3D PSP model with an interactive iframe screen using React Three Fiber and CSS3D rendering.

## Features

- 3D PSP model viewer with realistic lighting
- Interactive iframe embedded in 3D space using CSS3DRenderer
- Orbit controls for camera manipulation
- Responsive canvas rendering
- TypeScript support

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **Three.js** - 3D graphics library
- **TypeScript** - Type safety

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── PSPViewer.tsx       # Main 3D canvas setup
│   ├── PSPModel.tsx        # PSP 3D model component
│   ├── IframeScreen.tsx    # CSS3D iframe screen
│   └── Lights.tsx          # Scene lighting
├── lib/
│   └── config.ts           # Centralized configuration
└── public/
    └── models/
        └── sony_psp.glb    # PSP 3D model
```

## Configuration

All scene, model, and lighting configurations are centralized in [`lib/config.ts`](lib/config.ts). Modify these values to adjust:

- PSP model position, rotation, and scale
- Screen dimensions and iframe URL  
- Camera settings
- Lighting intensities and colors
- Ground plane appearance

## Important Notes

**React Strict Mode:** This project has React Strict Mode disabled in `next.config.js` to prevent WebGL context loss issues. Strict Mode's double-mounting behavior in development causes the Canvas to be destroyed and recreated, leading to context loss. This is a known limitation when using Three.js/WebGL with React.

## Build

```bash
npm run build
npm start
```

## License

MIT

