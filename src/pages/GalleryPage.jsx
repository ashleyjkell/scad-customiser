import { memo } from 'react';
import { Link } from 'react-router-dom';
import { models } from '../data/models';

/**
 * Model card component — memoized since model data never changes at runtime
 */
const ModelCard = memo(function ModelCard({ model }) {
  return (
    <Link
      to={`/customize/${model.id}`}
      className="model-card block bg-surface-800 rounded-2xl border border-surface-600/50 overflow-hidden group"
      id={`model-card-${model.id}`}
    >
      {/* Thumbnail area */}
      <div className={`relative h-48 bg-gradient-to-br ${model.gradient} flex items-center justify-center overflow-hidden`}>
        <span className="text-7xl transform group-hover:scale-110 transition-transform duration-500">
          {model.icon}
        </span>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-full text-sm">
            Customise →
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/30 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
            {model.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
          {model.name}
        </h3>
        <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
          {model.description}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Fully Customisable
        </div>
      </div>
    </Link>
  );
});

/**
 * Gallery page - homepage showing available models
 */
export default function GalleryPage() {
  return (
    <div className="h-full overflow-y-auto" id="gallery-page">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-surface-700/50 border border-surface-500/50 rounded-full px-3 py-1.5 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">OpenSCAD WASM Engine</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Craftidad{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Customiser
            </span>
          </h1>

          <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Choose a model, tweak the parameters, and download a print-ready 3MF file.
            Powered by OpenSCAD running entirely in your browser.
          </p>
        </div>
      </div>

      {/* Model grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Available Models
          </h2>
          <span className="text-xs text-gray-500">{models.length} models</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-surface-700/50 py-6 text-center">
        <p className="text-xs text-gray-600">
          Built with React, Three.js & OpenSCAD WASM
        </p>
      </div>
    </div>
  );
}
