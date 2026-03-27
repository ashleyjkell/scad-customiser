import { memo, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { models, getCustomModels, saveCustomModel, deleteCustomModel } from '../data/models';

const GRADIENTS = [
  { value: 'from-indigo-500 to-purple-600', swatch: '#6366f1' },
  { value: 'from-emerald-500 to-teal-600',  swatch: '#10b981' },
  { value: 'from-rose-500 to-pink-600',      swatch: '#f43f5e' },
  { value: 'from-orange-500 to-amber-600',   swatch: '#f97316' },
  { value: 'from-sky-500 to-blue-600',       swatch: '#0ea5e9' },
  { value: 'from-violet-500 to-fuchsia-600', swatch: '#8b5cf6' },
];

const ICON_PRESETS = ['🔧', '⚙️', '🖨️', '🎨', '🏠', '🎮', '💎', '🔩', '📦', '🌟'];

/**
 * Model card component — memoized since model data never changes at runtime
 */
const ModelCard = memo(function ModelCard({ model, onDelete }) {
  return (
    <div className="relative group/wrap">
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

      {/* Delete button for custom models */}
      {onDelete && (
        <button
          onClick={(e) => { e.preventDefault(); onDelete(model.id); }}
          className="absolute top-3 right-3 opacity-0 group-hover/wrap:opacity-100 transition-opacity duration-200 w-7 h-7 bg-black/50 backdrop-blur-sm hover:bg-red-500/80 rounded-full flex items-center justify-center"
          title="Remove model"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

/**
 * Add-to-gallery card — styled to match ModelCard but with dashed "add" aesthetic
 */
function AddModelCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="model-card w-full text-left bg-surface-800 rounded-2xl border border-dashed border-surface-500/40 overflow-hidden group hover:border-indigo-500/50 transition-colors duration-300"
    >
      {/* Thumbnail area */}
      <div className="relative h-48 bg-surface-700/30 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-3 group-hover:scale-105 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-surface-600/60 border-2 border-dashed border-surface-400/40 group-hover:border-indigo-400/60 flex items-center justify-center transition-colors duration-300">
            <svg className="w-7 h-7 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition-colors duration-300 font-medium tracking-wide">
            Upload .scad file
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-500 group-hover:text-indigo-300 transition-colors duration-300">
          Add to Gallery
        </h3>
        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
          Upload your own OpenSCAD model to customise
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 group-hover:text-indigo-500 transition-colors duration-300">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          .scad files supported
        </div>
      </div>
    </button>
  );
}

/**
 * Upload modal — dark themed to match the gallery aesthetic
 */
function UploadModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [icon, setIcon] = useState('🔧');
  const [scadContent, setScadContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.scad')) {
      setError('Only .scad files are supported');
      return;
    }
    setFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setScadContent(e.target.result);
    reader.readAsText(file);
    // Pre-fill name from filename if empty
    setName(prev => prev || file.name.replace(/\.scad$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = () => {
    if (!name.trim()) return setError('Please enter a model name');
    if (!scadContent) return setError('Please upload a .scad file');
    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom uploaded model',
      category: category.trim() || 'Custom',
      source: scadContent,
      gradient,
      icon,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-800 border border-surface-600/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
          <h2 className="text-lg font-bold text-white">Add New Model</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* File drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-200 ${
              dragOver
                ? 'border-indigo-400/80 bg-indigo-500/10'
                : scadContent
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-surface-500/50 bg-surface-700/30 hover:border-indigo-500/40 hover:bg-indigo-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".scad"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {scadContent ? (
              <>
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-emerald-400">{fileName}</span>
                <span className="text-xs text-gray-500">Click to replace</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-400">Drop your <span className="text-indigo-400 font-medium">.scad</span> file here</span>
                <span className="text-xs text-gray-600">or click to browse</span>
              </>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Model Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Phone Stand"
              className="w-full bg-surface-700/50 border border-surface-600/50 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/70 focus:bg-surface-700 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this model do?"
              rows={2}
              className="w-full bg-surface-700/50 border border-surface-600/50 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/70 focus:bg-surface-700 transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Accessories"
              className="w-full bg-surface-700/50 border border-surface-600/50 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/70 focus:bg-surface-700 transition-colors"
            />
          </div>

          {/* Gradient + Icon row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Gradient */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Card Colour
              </label>
              <div className="flex gap-2 flex-wrap">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGradient(g.value)}
                    className={`w-7 h-7 rounded-full transition-all duration-150 ${
                      gradient === g.value ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-surface-800 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ background: g.swatch }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Icon
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {ICON_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setIcon(preset)}
                    className={`w-7 h-7 text-base rounded-lg flex items-center justify-center transition-colors duration-150 ${
                      icon === preset
                        ? 'bg-indigo-500/30 ring-1 ring-indigo-400/60'
                        : 'bg-surface-700/50 hover:bg-surface-600/50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Preview
            </label>
            <div className={`h-20 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-4xl">{icon}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-surface-700/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-surface-700/50 hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Add to Gallery
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Gallery page - homepage showing available models
 */
export default function GalleryPage() {
  const [customModels, setCustomModels] = useState(() => getCustomModels());
  const [modalOpen, setModalOpen] = useState(false);

  const allModels = [...models, ...customModels];

  const handleSave = useCallback((model) => {
    saveCustomModel(model);
    setCustomModels(getCustomModels());
    setModalOpen(false);
  }, []);

  const handleDelete = useCallback((id) => {
    deleteCustomModel(id);
    setCustomModels(getCustomModels());
  }, []);

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
          <span className="text-xs text-gray-500">{allModels.length} models</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
          {customModels.map((model) => (
            <ModelCard key={model.id} model={model} onDelete={handleDelete} />
          ))}
          <AddModelCard onClick={() => setModalOpen(true)} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-surface-700/50 py-6 text-center">
        <p className="text-xs text-gray-600">
          Built with React, Three.js & OpenSCAD WASM
        </p>
      </div>

      {/* Upload modal */}
      {modalOpen && (
        <UploadModal onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
