/**
 * Parses OpenSCAD Customizer comment syntax from .scad source code.
 * 
 * Supported syntax:
 *   variable = value; // [min:max]          → slider
 *   variable = value; // [min:step:max]     → slider with step
 *   variable = value; // [opt1, opt2, opt3] → dropdown (strings)
 *   variable = value; // [1:Small, 2:Med]   → dropdown (labeled)
 *   /* [Section Name] * /                   → section header
 *   /* [Hidden] * /                         → hide following params
 *   string variable                         → text input
 *   boolean variable                        → checkbox
 */

/**
 * @typedef {Object} ScadParameter
 * @property {string} name - Variable name
 * @property {string} displayName - Human-readable name
 * @property {'slider'|'text'|'dropdown'|'color'|'checkbox'|'number'|'vector'} type
 * @property {*} defaultValue - Default value from the .scad file
 * @property {number} [min] - For sliders
 * @property {number} [max] - For sliders
 * @property {number} [step] - For sliders
 * @property {Array<{value: *, label: string}>} [options] - For dropdowns
 * @property {string} section - Section name this parameter belongs to
 * @property {string} [description] - Description comment
 */

/**
 * Parse a .scad file and extract customizer parameters
 * @param {string} source - OpenSCAD source code
 * @returns {ScadParameter[]}
 */
export function parseScadParameters(source) {
  const lines = source.split('\n');
  const parameters = [];
  let currentSection = 'Parameters';
  let hidden = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for section headers: /* [Section Name] */
    const sectionMatch = line.match(/^\/\*\s*\[(.+?)\]\s*\*\/\s*$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      if (sectionName.toLowerCase() === 'hidden') {
        hidden = true;
      } else {
        hidden = false;
        currentSection = sectionName;
      }
      continue;
    }

    // Skip hidden parameters
    if (hidden) continue;

    // Skip pure comments, empty lines, modules, functions, and OpenSCAD directives.
    // Use word-boundary checks for keywords so variable names like
    // `include_hole` or `use_shadows` are not accidentally excluded.
    if (!line || line.startsWith('//') || line.startsWith('/*') ||
        /^module\b/.test(line) || /^function\b/.test(line) ||
        /^use\s*</.test(line) || /^include\s*</.test(line) ||
        line.startsWith('{') || line.startsWith('}')) {
      continue;
    }

    // Match variable assignment: name = value; // annotation
    const varMatch = line.match(
      /^(\w+)\s*=\s*(.+?)\s*;\s*(?:\/\/\s*(.*))?$/
    );
    if (!varMatch) continue;

    const [, name, rawValue, annotation] = varMatch;

    // Skip internal variables (starting with underscore)
    if (name.startsWith('_') || name.startsWith('$')) continue;

    const defaultValue = parseValue(rawValue.trim());
    const displayName = nameToDisplay(name);
    
    // Check if previous line has a description comment
    let description = '';
    if (i > 0) {
      const prevLine = lines[i - 1].trim();
      const descMatch = prevLine.match(/^\/\/\s*(.+)$/);
      if (descMatch && !descMatch[1].trim().startsWith('[')) {
        description = descMatch[1].trim();
      }
    }

    // Determine parameter type from annotation and value
    const param = buildParameter(name, displayName, defaultValue, annotation, currentSection, description);
    if (param) {
      parameters.push(param);
    }
  }

  return parameters;
}

/**
 * Build a parameter object from parsed components
 */
function buildParameter(name, displayName, defaultValue, annotation, section, description) {
  const lowerName = name.toLowerCase();

  // Check for color parameter (by naming convention)
  if (lowerName.includes('color') || lowerName.includes('colour')) {
    return {
      name,
      displayName,
      type: 'color',
      defaultValue: typeof defaultValue === 'string' ? defaultValue : '#6366f1',
      section,
      description,
    };
  }

  // Parse annotation if present
  if (annotation) {
    const trimmed = annotation.trim();
    const bracketMatch = trimmed.match(/^\[(.+)\]$/);

    if (bracketMatch) {
      const inner = bracketMatch[1];

      // Check for slider: [min:max] or [min:step:max]
      const sliderMatch = inner.match(/^(-?[\d.]+)\s*:\s*(?:(-?[\d.]+)\s*:\s*)?(-?[\d.]+)$/);
      if (sliderMatch) {
        const [, a, b, c] = sliderMatch;
        if (b !== undefined) {
          // [min:step:max]
          return {
            name, displayName, type: 'slider',
            defaultValue: typeof defaultValue === 'number' ? defaultValue : parseFloat(a),
            min: parseFloat(a), step: parseFloat(b), max: parseFloat(c),
            section, description,
          };
        } else {
          // [min:max]
          return {
            name, displayName, type: 'slider',
            defaultValue: typeof defaultValue === 'number' ? defaultValue : parseFloat(a),
            min: parseFloat(a), max: parseFloat(c),
            step: Number.isInteger(defaultValue) ? 1 : 0.1,
            section, description,
          };
        }
      }

      // Check for labeled dropdown: [val:Label, val:Label, ...]
      const labeledOptions = inner.split(',').map(s => s.trim());
      const isLabeled = labeledOptions.every(o => /^.+:.+$/.test(o) && !/^-?[\d.]+$/.test(o.split(':')[1]));
      
      if (isLabeled && labeledOptions.length > 1) {
        const options = labeledOptions.map(o => {
          const colonIdx = o.indexOf(':');
          const value = o.substring(0, colonIdx).trim();
          const label = o.substring(colonIdx + 1).trim();
          return {
            value: isNaN(Number(value)) ? value : Number(value),
            label,
          };
        });
        return {
          name, displayName, type: 'dropdown',
          defaultValue, options, section, description,
        };
      }

      // Check for simple dropdown: [opt1, opt2, opt3]
      if (labeledOptions.length > 1) {
        const options = labeledOptions.map(o => {
          const cleaned = o.trim().replace(/^["']|["']$/g, '');
          const numVal = Number(cleaned);
          return {
            value: isNaN(numVal) ? cleaned : numVal,
            label: cleaned,
          };
        });
        return {
          name, displayName, type: 'dropdown',
          defaultValue, options, section, description,
        };
      }
    }
  }

  // Infer type from value
  if (typeof defaultValue === 'boolean') {
    return {
      name, displayName, type: 'checkbox',
      defaultValue, section, description,
    };
  }

  if (typeof defaultValue === 'string' && /^\[.*\]$/.test(defaultValue)) {
    return {
      name, displayName, type: 'vector',
      defaultValue, section, description,
    };
  }

  if (typeof defaultValue === 'string') {
    return {
      name, displayName, type: 'text',
      defaultValue, section, description,
    };
  }

  if (typeof defaultValue === 'number') {
    return {
      name, displayName, type: 'number',
      defaultValue, section, description,
    };
  }

  return null;
}

/**
 * Parse an OpenSCAD value string to a JS value
 */
function parseValue(raw) {
  // Boolean
  if (raw === 'true') return true;
  if (raw === 'false') return false;

  // String (quoted)
  const strMatch = raw.match(/^"(.*)"$/);
  if (strMatch) return strMatch[1];

  // Number
  const num = Number(raw);
  if (!isNaN(num)) return num;

  // Numeric vector: [1, 2, 3] — keep as raw string, handled by vector type
  if (/^\[\s*-?[\d.]+(?:\s*,\s*-?[\d.]+)*\s*\]$/.test(raw)) {
    return raw;
  }

  // Unrecognised — return raw string
  return raw;
}

/**
 * Convert snake_case/camelCase variable name to human-readable display name
 */
function nameToDisplay(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Group parameters by section
 * @param {ScadParameter[]} params
 * @returns {Map<string, ScadParameter[]>}
 */
export function groupBySection(params) {
  const groups = new Map();
  for (const param of params) {
    if (!groups.has(param.section)) {
      groups.set(param.section, []);
    }
    groups.get(param.section).push(param);
  }
  return groups;
}

/**
 * Generate OpenSCAD -D override arguments from parameter values
 * @param {Object<string, *>} values - Map of parameter name to current value
 * @param {ScadParameter[]} params - Parameter definitions
 * @returns {string[]} Array of -D arguments
 */
export function generateOverrides(values, params) {
  const args = [];
  for (const param of params) {
    const val = values[param.name];
    if (val === undefined) continue;

    if (param.type === 'vector') {
      // Vectors are raw OpenSCAD syntax ([x,y,z]) — no surrounding quotes
      args.push('-D', `${param.name}=${val}`);
    } else if (typeof val === 'string') {
      // Escape backslashes and double quotes so they don't break the -D argument
      const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      args.push('-D', `${param.name}="${escaped}"`);
    } else if (typeof val === 'boolean') {
      args.push('-D', `${param.name}=${val ? 'true' : 'false'}`);
    } else {
      args.push('-D', `${param.name}=${val}`);
    }
  }
  return args;
}
