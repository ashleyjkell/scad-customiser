import { describe, it, expect } from 'vitest';
import { parseScadParameters, generateOverrides, groupBySection } from './scadParser';

// ---------------------------------------------------------------------------
// parseScadParameters
// ---------------------------------------------------------------------------

describe('parseScadParameters', () => {
  it('parses a slider with [min:max]', () => {
    const [p] = parseScadParameters('width = 50; // [10:200]');
    expect(p.name).toBe('width');
    expect(p.type).toBe('slider');
    expect(p.min).toBe(10);
    expect(p.max).toBe(200);
    expect(p.defaultValue).toBe(50);
  });

  it('parses a slider with [min:step:max]', () => {
    const [p] = parseScadParameters('height = 2.5; // [0.5:0.5:10]');
    expect(p.type).toBe('slider');
    expect(p.min).toBe(0.5);
    expect(p.step).toBe(0.5);
    expect(p.max).toBe(10);
  });

  it('parses a text input from a string default', () => {
    const [p] = parseScadParameters('label = "Hello";');
    expect(p.type).toBe('text');
    expect(p.defaultValue).toBe('Hello');
  });

  it('parses a number input from a bare number', () => {
    const [p] = parseScadParameters('copies = 3;');
    expect(p.type).toBe('number');
    expect(p.defaultValue).toBe(3);
  });

  it('parses a checkbox from a boolean', () => {
    const [p] = parseScadParameters('include_hole = true;');
    expect(p.type).toBe('checkbox');
    expect(p.defaultValue).toBe(true);
  });

  it('parses a color parameter by name convention', () => {
    const [p] = parseScadParameters('body_color = "#ff0000";');
    expect(p.type).toBe('color');
  });

  it('parses a simple dropdown', () => {
    const [p] = parseScadParameters('font_size = 12; // [8, 10, 12, 14]');
    expect(p.type).toBe('dropdown');
    expect(p.options).toHaveLength(4);
    expect(p.options[0].value).toBe(8);
    expect(p.options[0].label).toBe('8');
  });

  it('parses a labeled dropdown', () => {
    const [p] = parseScadParameters('quality = 50; // [20:Draft, 50:Normal, 100:Fine]');
    expect(p.type).toBe('dropdown');
    expect(p.options).toHaveLength(3);
    expect(p.options[1].value).toBe(50);
    expect(p.options[1].label).toBe('Normal');
  });

  it('parses a vector parameter', () => {
    const [p] = parseScadParameters('size = [80, 30, 4];');
    expect(p.type).toBe('vector');
    expect(p.defaultValue).toBe('[80, 30, 4]');
  });

  it('converts snake_case to display name', () => {
    const [p] = parseScadParameters('font_size = 12;');
    expect(p.displayName).toBe('Font Size');
  });

  it('picks up description from the line above', () => {
    const src = '// Thickness of base\nthickness = 3; // [1:10]';
    const [p] = parseScadParameters(src);
    expect(p.description).toBe('Thickness of base');
  });

  it('skips variables prefixed with underscore', () => {
    const params = parseScadParameters('_internal = 42;');
    expect(params).toHaveLength(0);
  });

  it('skips variables prefixed with $', () => {
    const params = parseScadParameters('$fn = 32;');
    expect(params).toHaveLength(0);
  });

  it('skips parameters inside a [Hidden] section', () => {
    const src = `
/* [Hidden] */
secret = 99;
/* [Visible] */
visible = 1;
    `.trim();
    const params = parseScadParameters(src);
    expect(params.map(p => p.name)).not.toContain('secret');
    expect(params.map(p => p.name)).toContain('visible');
  });

  it('assigns section names from /* [Section] */ comments', () => {
    const src = `
/* [Dimensions] */
width = 50; // [10:200]
    `.trim();
    const [p] = parseScadParameters(src);
    expect(p.section).toBe('Dimensions');
  });
});

// ---------------------------------------------------------------------------
// generateOverrides
// ---------------------------------------------------------------------------

describe('generateOverrides', () => {
  it('wraps string values in quotes', () => {
    const params = [{ name: 'label', type: 'text' }];
    const args = generateOverrides({ label: 'Hello' }, params);
    expect(args).toEqual(['-D', 'label="Hello"']);
  });

  it('escapes double quotes inside string values', () => {
    const params = [{ name: 'msg', type: 'text' }];
    const args = generateOverrides({ msg: 'say "hi"' }, params);
    expect(args[1]).toBe('msg="say \\"hi\\""');
  });

  it('escapes backslashes inside string values', () => {
    const params = [{ name: 'path', type: 'text' }];
    const args = generateOverrides({ path: 'a\\b' }, params);
    expect(args[1]).toBe('path="a\\\\b"');
  });

  it('passes booleans as true/false literals', () => {
    const params = [{ name: 'flag', type: 'checkbox' }];
    expect(generateOverrides({ flag: true }, params)).toEqual(['-D', 'flag=true']);
    expect(generateOverrides({ flag: false }, params)).toEqual(['-D', 'flag=false']);
  });

  it('passes numbers as plain values', () => {
    const params = [{ name: 'width', type: 'number' }];
    const args = generateOverrides({ width: 42 }, params);
    expect(args).toEqual(['-D', 'width=42']);
  });

  it('passes vector values without surrounding quotes', () => {
    const params = [{ name: 'size', type: 'vector' }];
    const args = generateOverrides({ size: '[80, 30, 4]' }, params);
    expect(args).toEqual(['-D', 'size=[80, 30, 4]']);
  });

  it('skips params with no value in the values map', () => {
    const params = [{ name: 'width', type: 'number' }, { name: 'height', type: 'number' }];
    const args = generateOverrides({ width: 10 }, params);
    expect(args).toHaveLength(2); // only one -D pair
  });
});

// ---------------------------------------------------------------------------
// groupBySection
// ---------------------------------------------------------------------------

describe('groupBySection', () => {
  it('groups parameters by their section field', () => {
    const params = [
      { name: 'a', section: 'Alpha' },
      { name: 'b', section: 'Beta' },
      { name: 'c', section: 'Alpha' },
    ];
    const groups = groupBySection(params);
    expect([...groups.keys()]).toEqual(['Alpha', 'Beta']);
    expect(groups.get('Alpha').map(p => p.name)).toEqual(['a', 'c']);
    expect(groups.get('Beta').map(p => p.name)).toEqual(['b']);
  });
});
