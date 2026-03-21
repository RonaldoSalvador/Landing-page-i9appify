/**
 * Tailwind CSS Safelist
 * 
 * This file exists ONLY so Tailwind's content scanner can find dynamic class names.
 * It is NOT imported anywhere — Tailwind scans all .js files in src/** for class names.
 *
 * The CRM pages use template literals like `text-${color}-500` which Tailwind cannot
 * detect at scan time. By listing all possible class names here as strings, Tailwind 
 * will include them in the final CSS.
 */

// prettier-ignore
const safelist = [
  // ═══════════ EMERALD ═══════════
  'text-emerald-400', 'text-emerald-500', 'text-emerald-600',
  'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-500/5', 'bg-emerald-500/10', 'bg-emerald-500/20', 'bg-emerald-500/30',
  'border-emerald-500', 'border-emerald-500/20', 'border-emerald-500/30',
  'hover:bg-emerald-500/10', 'hover:bg-emerald-500/20',
  'dark:text-emerald-400', 'dark:bg-emerald-500/10', 'dark:bg-emerald-500/20', 'dark:border-emerald-500/30',

  // ═══════════ BLUE ═══════════
  'text-blue-400', 'text-blue-500', 'text-blue-600',
  'bg-blue-500', 'bg-blue-600', 'bg-blue-500/5', 'bg-blue-500/10', 'bg-blue-500/20', 'bg-blue-500/30',
  'border-blue-500', 'border-blue-500/20', 'border-blue-500/30',
  'hover:bg-blue-500/10', 'hover:bg-blue-500/20',
  'dark:text-blue-400', 'dark:bg-blue-500/10', 'dark:bg-blue-500/20', 'dark:border-blue-500/30',

  // ═══════════ YELLOW ═══════════
  'text-yellow-400', 'text-yellow-500', 'text-yellow-600',
  'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-500/5', 'bg-yellow-500/10', 'bg-yellow-500/20', 'bg-yellow-500/30',
  'border-yellow-500', 'border-yellow-500/20', 'border-yellow-500/30',
  'hover:bg-yellow-500/10', 'hover:bg-yellow-500/20',
  'dark:text-yellow-400', 'dark:bg-yellow-500/10', 'dark:bg-yellow-500/20', 'dark:border-yellow-500/30',

  // ═══════════ RED ═══════════
  'text-red-400', 'text-red-500', 'text-red-600',
  'bg-red-500', 'bg-red-600', 'bg-red-500/5', 'bg-red-500/10', 'bg-red-500/20', 'bg-red-500/30',
  'border-red-500', 'border-red-500/20', 'border-red-500/30',
  'hover:bg-red-500/10', 'hover:bg-red-500/20',
  'dark:text-red-400', 'dark:bg-red-500/10', 'dark:bg-red-500/20', 'dark:border-red-500/30',

  // ═══════════ PURPLE ═══════════
  'text-purple-400', 'text-purple-500', 'text-purple-600',
  'bg-purple-500', 'bg-purple-600', 'bg-purple-500/5', 'bg-purple-500/10', 'bg-purple-500/20', 'bg-purple-500/30',
  'border-purple-500', 'border-purple-500/20', 'border-purple-500/30',
  'hover:bg-purple-500/10', 'hover:bg-purple-500/20',
  'dark:text-purple-400', 'dark:bg-purple-500/10', 'dark:bg-purple-500/20', 'dark:border-purple-500/30',

  // ═══════════ ORANGE ═══════════
  'text-orange-400', 'text-orange-500', 'text-orange-600',
  'bg-orange-500', 'bg-orange-600', 'bg-orange-500/5', 'bg-orange-500/10', 'bg-orange-500/20', 'bg-orange-500/30',
  'border-orange-500', 'border-orange-500/20', 'border-orange-500/30',
  'hover:bg-orange-500/10', 'hover:bg-orange-500/20',
  'dark:text-orange-400', 'dark:bg-orange-500/10', 'dark:bg-orange-500/20', 'dark:border-orange-500/30',

  // ═══════════ CYAN ═══════════
  'text-cyan-400', 'text-cyan-500', 'text-cyan-600',
  'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-500/5', 'bg-cyan-500/10', 'bg-cyan-500/20', 'bg-cyan-500/30',
  'border-cyan-500', 'border-cyan-500/20', 'border-cyan-500/30',
  'hover:bg-cyan-500/10', 'hover:bg-cyan-500/20',
  'dark:text-cyan-400', 'dark:bg-cyan-500/10', 'dark:bg-cyan-500/20', 'dark:border-cyan-500/30',

  // ═══════════ GRAY ═══════════
  'text-gray-400', 'text-gray-500', 'text-gray-600',
  'bg-gray-500', 'bg-gray-600', 'bg-gray-500/5', 'bg-gray-500/10', 'bg-gray-500/20', 'bg-gray-500/30',
  'border-gray-500', 'border-gray-500/20', 'border-gray-500/30',
  'hover:bg-gray-500/10', 'hover:bg-gray-500/20',
  'dark:text-gray-400', 'dark:bg-gray-500/10', 'dark:bg-gray-500/20', 'dark:border-gray-500/30',

  // ═══════════ GREEN ═══════════
  'text-green-400', 'text-green-500', 'text-green-600',
  'bg-green-500', 'bg-green-600', 'bg-green-500/5', 'bg-green-500/10', 'bg-green-500/20', 'bg-green-500/30',
  'border-green-500', 'border-green-500/20', 'border-green-500/30',
  'hover:bg-green-500/10', 'hover:bg-green-500/20',
  'dark:text-green-400', 'dark:bg-green-500/10', 'dark:bg-green-500/20', 'dark:border-green-500/30',

  // ═══════════ PINK ═══════════
  'text-pink-400', 'text-pink-500', 'text-pink-600',
  'bg-pink-500', 'bg-pink-600', 'bg-pink-500/5', 'bg-pink-500/10', 'bg-pink-500/20', 'bg-pink-500/30',
  'border-pink-500', 'border-pink-500/20', 'border-pink-500/30',
  'hover:bg-pink-500/10', 'hover:bg-pink-500/20',
  'dark:text-pink-400', 'dark:bg-pink-500/10', 'dark:bg-pink-500/20', 'dark:border-pink-500/30',

  // ═══════════ INDIGO ═══════════
  'text-indigo-400', 'text-indigo-500', 'text-indigo-600',
  'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-500/5', 'bg-indigo-500/10', 'bg-indigo-500/20', 'bg-indigo-500/30',
  'border-indigo-500', 'border-indigo-500/20', 'border-indigo-500/30',
  'hover:bg-indigo-500/10', 'hover:bg-indigo-500/20',
  'dark:text-indigo-400', 'dark:bg-indigo-500/10', 'dark:bg-indigo-500/20', 'dark:border-indigo-500/30',

  // ═══════════ TEAL ═══════════
  'text-teal-400', 'text-teal-500', 'text-teal-600',
  'bg-teal-500', 'bg-teal-600', 'bg-teal-500/5', 'bg-teal-500/10', 'bg-teal-500/20', 'bg-teal-500/30',
  'border-teal-500', 'border-teal-500/20', 'border-teal-500/30',
  'hover:bg-teal-500/10', 'hover:bg-teal-500/20',
  'dark:text-teal-400', 'dark:bg-teal-500/10', 'dark:bg-teal-500/20', 'dark:border-teal-500/30',

  // ═══════════ AMBER ═══════════
  'text-amber-400', 'text-amber-500', 'text-amber-600',
  'bg-amber-500', 'bg-amber-600', 'bg-amber-500/5', 'bg-amber-500/10', 'bg-amber-500/20', 'bg-amber-500/30',
  'border-amber-500', 'border-amber-500/20', 'border-amber-500/30',
  'hover:bg-amber-500/10', 'hover:bg-amber-500/20',
  'dark:text-amber-400', 'dark:bg-amber-500/10', 'dark:bg-amber-500/20', 'dark:border-amber-500/30',
]

export default safelist
