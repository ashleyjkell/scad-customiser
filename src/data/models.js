/**
 * Model registry - defines available models with their .scad source,
 * metadata, and thumbnails.
 */

import keychainSource from '../models/keychain.scad?raw';
import nameSignSource from '../models/name_sign.scad?raw';

export const models = [
  {
    id: 'keychain',
    name: 'Custom Keychain',
    description: 'A personalised keychain with custom text, adjustable dimensions, and keyring hole. Perfect for gifts or personal use.',
    category: 'Accessories',
    source: keychainSource,
    gradient: 'from-indigo-500 to-purple-600',
    icon: '🔑',
  },
  {
    id: 'name-sign',
    name: 'Desk Name Sign',
    description: 'An elegant desk name plate with customisable text, font, and dimensions. Great for offices and workspaces.',
    category: 'Home & Office',
    source: nameSignSource,
    gradient: 'from-emerald-500 to-teal-600',
    icon: '🏷️',
  },
];

export function getModelById(id) {
  return models.find(m => m.id === id);
}
