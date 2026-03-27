import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getModelById } from '../data/models';
import { parseScadParameters } from '../utils/scadParser';
import { useOpenSCADWorker } from '../hooks/useOpenSCADWorker';
import ModelViewer from '../components/ModelViewer';
import ParameterSidebar from '../components/ParameterSidebar';

/**
 * Customizer page - dual-pane layout with parameter sidebar + 3D viewer
 */
export default function CustomizerPage() {
  const { modelId } = useParams();
  const model = getModelById(modelId);
  const { isReady, isCompiling, error, geometry, compilePreview, exportModel } = useOpenSCADWorker();

  const [isExporting, setIsExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Parse parameters from .scad source
  const parameters = useMemo(() => {
    if (!model) return [];
    return parseScadParameters(model.source);
  }, [model]);

  // Build initial values from parameter defaults
  const defaultValues = useMemo(() => {
    const vals = {};
    parameters.forEach(p => { vals[p.name] = p.defaultValue; });
    return vals;
  }, [parameters]);

  const [values, setValues] = useState(defaultValues);

  // Re-set values if defaultValues change (e.g. new model)
  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      setValues(defaultValues);
    }
  }, [defaultValues]);

  // Trigger initial compile when ready
  useEffect(() => {
    if (isReady && model && Object.keys(values).length > 0) {
      compilePreview(model.source, values, parameters, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, model]); // Only on initial ready — values/params changes trigger their own recompile

  // Handle parameter change
  const handleChange = useCallback((name, value) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      // Trigger debounced recompile
      if (model) {
        compilePreview(model.source, next, parameters);
      }
      return next;
    });
  }, [model, parameters, compilePreview]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setValues(defaultValues);
    if (model) {
      compilePreview(model.source, defaultValues, parameters, 50);
    }
  }, [defaultValues, model, parameters, compilePreview]);

  // Download handler
  const handleDownload = useCallback(async (format = '3mf') => {
    if (!model) return;
    setIsExporting(true);

    try {
      const data = await exportModel(model.source, values, parameters, format);
      
      // Create blob and trigger download
      const ext = format === '3mf' ? '3mf' : 'stl';
      const mimeType = format === '3mf' ? 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml' : 'application/octet-stream';
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.id}-custom.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [model, values, parameters, exportModel]);

  // 404 for unknown models
  if (!model) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-500">404</h1>
          <p className="text-gray-400 mt-2">Model not found</p>
          <Link
            to="/"
            className="inline-block mt-4 px-4 py-2 bg-surface-600 text-gray-300 rounded-lg hover:bg-surface-500 transition-colors"
          >
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" id="customizer-page">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-surface-800 border-b border-surface-600/50 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
          id="back-to-gallery"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Gallery
        </Link>

        <div className="w-px h-5 bg-surface-600" />

        <div className="flex items-center gap-2">
          <span className="text-2xl">{model.icon}</span>
          <div>
            <h1 className="text-sm font-semibold text-white">{model.name}</h1>
            <p className="text-[10px] text-gray-500">
              {isReady ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Engine Ready
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  Loading Engine...
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-surface-600 text-sm text-gray-300 rounded-lg hover:bg-surface-500 transition-colors"
          id="sidebar-toggle"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Parameters
        </button>
      </div>

      {/* Main content: sidebar + viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-80 shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute md:relative md:translate-x-0'
          }`}
          style={{ zIndex: sidebarOpen ? 20 : 0 }}
        >
          <ParameterSidebar
            parameters={parameters}
            values={values}
            onChange={handleChange}
            onReset={handleReset}
            onDownload={handleDownload}
            isCompiling={isCompiling}
            isExporting={isExporting}
            modelName={model.name}
          />
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <ModelViewer
            geometry={geometry}
            isCompiling={isCompiling}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
