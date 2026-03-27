import { useState } from 'react';
import { groupBySection } from '../utils/scadParser';

/**
 * Chevron icon for collapsible sections
 */
function ChevronIcon({ isOpen }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Slider parameter control
 */
function SliderControl({ param, value, onChange }) {
  const percentage = ((value - param.min) / (param.max - param.min)) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-indigo-300 font-mono bg-surface-700 px-2 py-0.5 rounded">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(param.name, parseFloat(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #2d2d40 ${percentage}%, #2d2d40 100%)`,
        }}
        id={`param-${param.name}`}
      />
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{param.min}</span>
        <span>{param.max}</span>
      </div>
    </div>
  );
}

/**
 * Text input parameter control
 */
function TextControl({ param, value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(param.name, e.target.value)}
      placeholder={param.displayName}
      className="w-full px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
      id={`param-${param.name}`}
    />
  );
}

/**
 * Number input parameter control
 */
function NumberControl({ param, value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(param.name, parseFloat(e.target.value) || 0)}
      className="w-full px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
      id={`param-${param.name}`}
    />
  );
}

/**
 * Dropdown parameter control
 */
function DropdownControl({ param, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const opt = param.options.find(o => String(o.value) === e.target.value);
        onChange(param.name, opt ? opt.value : e.target.value);
      }}
      className="w-full px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors cursor-pointer"
      id={`param-${param.name}`}
    >
      {param.options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Color picker parameter control
 */
function ColorControl({ param, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(param.name, e.target.value)}
        id={`param-${param.name}`}
        aria-label={`${param.displayName} colour, current value ${value}`}
      />
      <span className="text-xs text-gray-400 font-mono" aria-hidden="true">{value}</span>
    </div>
  );
}

/**
 * Vector parameter control — edits raw OpenSCAD vector syntax e.g. [10, 20, 5]
 */
function VectorControl({ param, value, onChange }) {
  function handleBlur(e) {
    const raw = e.target.value.trim();
    // Accept if it looks like a valid numeric vector; otherwise revert
    if (/^\[\s*-?[\d.]+(?:\s*,\s*-?[\d.]+)*\s*\]$/.test(raw)) {
      onChange(param.name, raw);
    } else {
      e.target.value = value;
    }
  }

  return (
    <input
      type="text"
      defaultValue={value}
      onBlur={handleBlur}
      placeholder="[x, y, z]"
      className="w-full px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg text-sm text-gray-200 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
      id={`param-${param.name}`}
    />
  );
}

/**
 * Checkbox parameter control
 */
function CheckboxControl({ param, value, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group" htmlFor={`param-${param.name}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(param.name, e.target.checked)}
          className="sr-only"
          id={`param-${param.name}`}
        />
        <div className={`w-10 h-5 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-surface-500'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${value ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`} />
        </div>
      </div>
      <span className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
        {value ? 'Enabled' : 'Disabled'}
      </span>
    </label>
  );
}

/**
 * Individual parameter row
 */
function ParameterRow({ param, value, onChange }) {
  const controls = {
    slider: SliderControl,
    text: TextControl,
    number: NumberControl,
    dropdown: DropdownControl,
    color: ColorControl,
    checkbox: CheckboxControl,
    vector: VectorControl,
  };

  const Control = controls[param.type];
  if (!Control) return null;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300" htmlFor={`param-${param.name}`}>
        {param.displayName}
      </label>
      {param.description && (
        <p className="text-xs text-gray-500 -mt-0.5">{param.description}</p>
      )}
      <Control param={param} value={value} onChange={onChange} />
    </div>
  );
}

/**
 * Collapsible section
 */
function Section({ name, params, values, onChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const sectionId = `section-${name.replace(/\s+/g, '-').toLowerCase()}`;
  const contentId = `${sectionId}-content`;

  return (
    <div className="border-b border-surface-600/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-700/50 transition-colors"
        id={sectionId}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {name}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      <div
        id={contentId}
        className="transition-section"
        aria-hidden={!isOpen}
        style={{
          maxHeight: isOpen ? `${params.length * 120 + 40}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-5 pb-4 space-y-4">
          {params.map((param) => (
            <ParameterRow
              key={param.name}
              param={param}
              value={values[param.name]}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Parameter Sidebar component
 * Dynamically generates UI from parsed .scad parameters
 */
export default function ParameterSidebar({
  parameters,
  values,
  onChange,
  onReset,
  onDownload,
  isCompiling,
  isExporting,
  modelName,
}) {
  const sections = groupBySection(parameters);

  return (
    <div className="h-full flex flex-col bg-surface-800 border-r border-surface-600/50" id="parameter-sidebar">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-600/50">
        <h2 className="text-lg font-bold text-white">{modelName}</h2>
        <p className="text-xs text-gray-500 mt-0.5">Adjust parameters below</p>
      </div>

      {/* Scrollable parameters */}
      <div className="flex-1 overflow-y-auto">
        {Array.from(sections.entries()).map(([sectionName, sectionParams]) => (
          <Section
            key={sectionName}
            name={sectionName}
            params={sectionParams}
            values={values}
            onChange={onChange}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="px-5 py-4 border-t border-surface-600/50 space-y-2">
        <button
          onClick={onDownload}
          disabled={isCompiling || isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]"
          id="download-button"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download 3MF
            </>
          )}
        </button>

        <button
          onClick={() => onDownload('stl')}
          disabled={isCompiling || isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface-600 hover:bg-surface-500 text-gray-300 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          id="download-stl-button"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download STL
        </button>

        <button
          onClick={onReset}
          className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-300 hover:bg-surface-700/50 rounded-lg transition-colors"
          id="reset-button"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
