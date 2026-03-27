/**
 * React hook for managing OpenSCAD WASM compilation.
 * Uses openscad-playground's WASM binary loaded from src/wasm/.
 * Creates a new WASM instance for each compilation to avoid callMain crash.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { generateOverrides } from '../utils/scadParser';

// Module-level singletons for the WASM factory and font cache.
// This is intentional: JavaScript is single-threaded, so the `factoryPromise`
// guard (set synchronously before any async work) prevents duplicate
// initialisation even when multiple components mount at the same time.
let OpenSCADFactory = null;
let factoryPromise = null;

/** Fontconfig XML config */
const FONTCONFIG_XML = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/fonts</dir>
  <cachedir>/tmp/fc-cache</cachedir>
</fontconfig>`;

// Cache font data to avoid re-fetching
let cachedFonts = null;

async function loadFontData() {
  if (cachedFonts) return cachedFonts;

  const fontFiles = [
    { name: 'LiberationSans-Regular.ttf', url: '/fonts/LiberationSans-Regular.ttf' },
    { name: 'LiberationSans-Bold.ttf', url: '/fonts/LiberationSans-Bold.ttf' },
  ];

  cachedFonts = await Promise.all(fontFiles.map(async (font) => {
    try {
      const resp = await fetch(font.url);
      if (!resp.ok) return null;
      return { name: font.name, data: new Uint8Array(await resp.arrayBuffer()) };
    } catch {
      return null;
    }
  }));
  cachedFonts = cachedFonts.filter(Boolean);
  return cachedFonts;
}

/**
 * Get the module factory (cached). The actual module is loaded once,
 * but we create a new instance per compilation since callMain is one-shot.
 */
async function getFactory() {
  if (OpenSCADFactory) return OpenSCADFactory;
  if (factoryPromise) return factoryPromise;

  factoryPromise = (async () => {
    const module = await import('../wasm/openscad.js');
    OpenSCADFactory = module.default;
    // Pre-load fonts in parallel
    await loadFontData();
    console.log('[OpenSCAD] Module factory loaded');
    return OpenSCADFactory;
  })();

  return factoryPromise;
}

/**
 * Create a fresh WASM instance with fonts configured.
 * Each compilation needs a fresh instance because callMain exits the program.
 */
async function createInstance() {
  const factory = await getFactory();
  const fonts = await loadFontData();

  const inst = await factory({
    noInitialRun: true,
    locateFile: (path) => `/wasm/${path}`,
    // Set up fonts and ENV BEFORE the module initializes, using preRun.
    // This ensures fontconfig can find its config when it first reads ENV.
    preRun: [(Module) => {
      // Create directories
      const FS = Module.FS;
      const dirs = ['/fonts', '/tmp/fc-cache', '/etc', '/etc/fonts'];
      for (const dir of dirs) {
        try { FS.mkdir(dir); } catch { /* already exists */ }
      }
      // Write fontconfig config
      FS.writeFile('/etc/fonts/fonts.conf', FONTCONFIG_XML);

      // Write font files
      for (const font of fonts) {
        FS.writeFile(`/fonts/${font.name}`, font.data);
      }

      // Set ENV for fontconfig
      Module.ENV['FONTCONFIG_FILE'] = '/etc/fonts/fonts.conf';
      Module.ENV['FONTCONFIG_PATH'] = '/etc/fonts';
    }],
    print: (text) => console.log('[OpenSCAD]:', text),
    printErr: (text) => {
      if (text.includes('Error')) {
        console.error('[OpenSCAD Error]:', text);
      } else {
        console.log('[OpenSCAD]:', text);
      }
    },
  });

  return inst;
}

export function useOpenSCADWorker() {
  const debounceRef = useRef(null);
  const compileIdRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [geometry, setGeometry] = useState(null);

  // Initialize factory on mount
  useEffect(() => {
    let cancelled = false;
    getFactory()
      .then(() => {
        if (!cancelled) {
          setIsReady(true);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(`Failed to initialize OpenSCAD: ${err.message}`);
        }
      });

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /**
   * Compile .scad source using a fresh WASM instance each time
   */
  const doCompile = useCallback(async (source, overrideArgs, format = 'stl') => {
    const inst = await createInstance();
    const outputExt = format === '3mf' ? '3mf' : 'stl';
    const outputFile = `/output.${outputExt}`;

    try {
      inst.FS.writeFile('/input.scad', source);
      inst.callMain(['/input.scad', '-o', outputFile, ...overrideArgs]);

      let output;
      try {
        output = inst.FS.readFile(outputFile);
      } catch {
        throw new Error('OpenSCAD compilation produced no output. Check your model for errors.');
      }

      // Copy the data out before we release the instance
      return output.buffer.slice(0);
    } finally {
      // Clean up FS entries and drop the reference so the WASM heap can be GC'd
      try { inst.FS.unlink('/input.scad'); } catch { /* ignore */ }
      try { inst.FS.unlink(outputFile); } catch { /* ignore */ }
    }
  }, []);

  /**
   * Compile for preview (debounced)
   */
  const compilePreview = useCallback((source, values, params, delay = 400) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const id = ++compileIdRef.current;
      setIsCompiling(true);
      setError(null);

      try {
        const overrideArgs = generateOverrides(values, params);
        const result = await doCompile(source, overrideArgs, 'stl');
        if (id === compileIdRef.current) {
          setGeometry(result);
          setIsCompiling(false);
        }
      } catch (err) {
        if (id === compileIdRef.current) {
          setError(err.message || String(err));
          setIsCompiling(false);
        }
      }
    }, delay);
  }, [doCompile]);

  /**
   * Export as 3MF or STL (no debounce)
   */
  const exportModel = useCallback(async (source, values, params, format = '3mf') => {
    const overrideArgs = generateOverrides(values, params);
    return await doCompile(source, overrideArgs, format);
  }, [doCompile]);

  return {
    isReady,
    isCompiling,
    error,
    geometry,
    compilePreview,
    exportModel,
  };
}
