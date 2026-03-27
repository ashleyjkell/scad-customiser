# Craftidad Customiser

A browser-based 3D model customiser powered by **OpenSCAD WASM**. Pick a parametric model, tweak its parameters in real time, and download a print-ready **3MF** or **STL** file — no server required.

## Features

- **Live 3D preview** — Three.js canvas updates as you adjust sliders and text fields
- **OpenSCAD in the browser** — full OpenSCAD engine compiled to WebAssembly; runs entirely client-side
- **Auto-generated UI** — parameters are parsed from `.scad` customizer comments and rendered as sliders, text inputs, dropdowns, checkboxes, color pickers, and vector inputs
- **Export formats** — download as 3MF (recommended for most slicers) or STL
- **Two models included** — Custom Keychain and Desk Name Sign

## Getting started

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build locally
npm run test       # run unit tests
npm run lint       # ESLint
```

## Adding a new model

1. Create a `.scad` file in `src/models/` with OpenSCAD customizer comment syntax (see below).
2. Import the source and register it in `src/data/models.js`:

```js
import myModelSource from '../models/my_model.scad?raw';

export const models = [
  // ... existing models
  {
    id: 'my-model',
    name: 'My Model',
    description: 'A short description shown on the gallery card.',
    category: 'Category',
    source: myModelSource,
    gradient: 'from-pink-500 to-rose-600',   // Tailwind gradient classes
    icon: '🎁',
  },
];
```

That's it — the parameter sidebar is generated automatically from the `.scad` source.

## OpenSCAD customizer syntax

Parameters are declared as top-level variable assignments with a trailing comment annotation.

### Slider
```scad
width = 50;   // [10:100]        → slider, step inferred from type
height = 2.5; // [0.5:0.5:10]   → slider with explicit step
```

### Dropdown
```scad
// Simple (value = label)
font_size = 12; // [8, 10, 12, 14, 18]

// Labeled (value : label)
quality = 50; // [20:Draft, 50:Normal, 100:Fine]
```

### Text input
```scad
name = "Hello"; // any string default → text input
```

### Number input
```scad
copies = 3; // bare number without range annotation → number input
```

### Checkbox
```scad
include_hole = true; // boolean default → checkbox / toggle
```

### Color picker
```scad
body_color = "#6366f1"; // variable name contains "color" or "colour"
```

### Vector input
```scad
size = [80, 30, 4]; // numeric vector → editable [x, y, z] field
```

### Sections and hidden parameters
```scad
/* [Dimensions] */
width = 50; // [10:200]

/* [Hidden] */
_internal = 42; // skipped — section name "Hidden" suppresses display
```

Variables prefixed with `_` or `$` are also skipped automatically.

### Description comments
A `//` comment on the line immediately above a parameter becomes its tooltip:
```scad
// Thickness of the base plate in mm
thickness = 3; // [1:10]
```

## Project structure

```
src/
├── components/
│   ├── ErrorBoundary.jsx      — catches render errors, shows fallback UI
│   ├── ModelViewer.jsx        — Three.js canvas + orbit controls
│   └── ParameterSidebar.jsx   — auto-generated parameter controls
├── hooks/
│   └── useOpenSCADWorker.js   — OpenSCAD WASM compilation hook
├── pages/
│   ├── GalleryPage.jsx        — model selection homepage
│   └── CustomizerPage.jsx     — dual-pane customiser layout
├── utils/
│   └── scadParser.js          — parses .scad customizer syntax → parameter definitions
├── data/
│   └── models.js              — model registry
└── models/
    ├── keychain.scad
    └── name_sign.scad
```

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19, React Router 7 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, Drei |
| CAD engine | OpenSCAD WASM (openscad-playground) |
| Tests | Vitest |
