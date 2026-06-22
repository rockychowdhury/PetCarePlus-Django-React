import React from 'react'
import { Cat, Dog, Bird, Egg, Shield, Fish, Rabbit, Turtle } from 'lucide-react'

// Custom SVGs for animals not natively present in default Lucide set, ensuring high fidelity.
export const CowIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Head outline */}
    <path d="M7 15a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V9a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v6z" />
    {/* Horns */}
    <path d="M7 9C5.5 8.5 4 7 4 5" />
    <path d="M17 9c1.5-.5 3-2 3-4" />
    {/* Ears */}
    <path d="M6 10c-1.5 1-2.5 2.5-2 4 .5.5 1 .5 2 0" />
    <path d="M18 10c1.5 1 2.5 2.5 2 4-.5.5-1 .5-2 0" />
    {/* Snout/Nose area */}
    <path d="M8 15h8v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2z" />
    {/* Nostrils */}
    <circle cx="10" cy="17" r="0.5" fill="currentColor" />
    <circle cx="14" cy="17" r="0.5" fill="currentColor" />
  </svg>
)

export const GoatIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Head outline */}
    <path d="M8 14V9a4 4 0 0 1 8 0v5l-1 3.5a1.5 1.5 0 0 1-3 0V14h-2v3.5a1.5 1.5 0 0 1-3 0L8 14z" />
    {/* Horns */}
    <path d="M9 7c-1-2-2.5-3.5-4-4.5" />
    <path d="M15 7c1-2 2.5-3.5 4-4.5" />
    {/* Beard */}
    <path d="M11 19.5v2l1 .5 1-.5v-2" />
    {/* Ears */}
    <path d="M7.5 9.5c-1.5.5-2.5 1.5-3 2.5 0 1 1 1 2.5.5" />
    <path d="M16.5 9.5c1.5.5 2.5 1.5 3 2.5 0 1-1 1-2.5.5" />
  </svg>
)

export const PoultryIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Chicken body outline */}
    <path d="M12 4.5c1-1 2.5-1 3.5 0V7a4 4 0 0 1 4 4v1.5a5.5 5.5 0 0 1-11 0V11a4 4 0 0 1 3.5-4.5z" />
    {/* Beak */}
    <path d="M8.5 9.5L5.5 10l3 1" />
    {/* Eye */}
    <circle cx="10" cy="8.5" r="0.5" fill="currentColor" />
    {/* Feet */}
    <path d="M10 18v3m0 0l-1.5.5m1.5-.5l1.5.5" />
    {/* Comb */}
    <path d="M13.5 4a1.5 1.5 0 0 0 2-1" />
  </svg>
)

export const DuckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 10V6a3 3 0 0 0-6 0v2c0 2 1.5 4 4 4h4" />
    <path d="M10 12c-2 0-4 1.5-4 4v2h12v-1" />
    <path d="M6 8a1.5 1.5 0 0 0 3 0" />
    <circle cx="9" cy="5" r="0.5" fill="currentColor" />
  </svg>
)

export const GuineaPigIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 14c0-2.2 1.8-4 4-4h7c2.2 0 4 1.8 4 4s-1.8 4-4 4H8c-2.2 0-4-1.8-4-4z" />
    {/* Ears */}
    <path d="M8 10c-.5-1.5-1.5-2-2.5-1.5s-1 1.5.5 2" />
    <path d="M15 10c.5-1.5 1.5-2 2.5-1.5s1 1.5-.5 2" />
    {/* Nose/Whiskers */}
    <path d="M19 14h1.5" />
    <circle cx="16" cy="13" r="0.5" fill="currentColor" />
  </svg>
)

export const getAnimalIcon = (slug) => {
  switch (slug) {
    case 'cat':
      return Cat
    case 'dog':
      return Dog
    case 'rabbit':
      return Rabbit
    case 'bird':
      return Bird
    case 'fish':
      return Fish
    case 'turtle':
      return Turtle
    case 'cow':
      return CowIcon
    case 'goat':
      return GoatIcon
    case 'poultry':
      return PoultryIcon
    case 'chicken':
      return Egg
    case 'duck':
      return DuckIcon
    case 'guinea-pig':
      return GuineaPigIcon
    default:
      return Shield
  }
}

export const ANIMAL_THEMES = {
  cat: {
    bg: 'bg-orange-50 hover:bg-orange-100/75 dark:bg-orange-950/20 dark:hover:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-100 hover:border-orange-300 dark:border-orange-900/30 dark:hover:border-orange-800/50',
    indicator: 'bg-orange-500',
  },
  dog: {
    bg: 'bg-blue-50 hover:bg-blue-100/75 dark:bg-blue-950/20 dark:hover:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 hover:border-blue-300 dark:border-blue-900/30 dark:hover:border-blue-800/50',
    indicator: 'bg-blue-500',
  },
  rabbit: {
    bg: 'bg-purple-50 hover:bg-purple-100/75 dark:bg-purple-950/20 dark:hover:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 hover:border-purple-300 dark:border-purple-900/30 dark:hover:border-purple-800/50',
    indicator: 'bg-purple-500',
  },
  bird: {
    bg: 'bg-teal-50 hover:bg-teal-100/75 dark:bg-teal-950/20 dark:hover:bg-teal-900/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-100 hover:border-teal-300 dark:border-teal-900/30 dark:hover:border-teal-800/50',
    indicator: 'bg-teal-500',
  },
  cow: {
    bg: 'bg-amber-50 hover:bg-amber-100/75 dark:bg-amber-950/20 dark:hover:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 hover:border-amber-300 dark:border-amber-900/30 dark:hover:border-amber-800/50',
    indicator: 'bg-amber-600',
  },
  goat: {
    bg: 'bg-emerald-50 hover:bg-emerald-100/75 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 hover:border-emerald-300 dark:border-emerald-900/30 dark:hover:border-emerald-800/50',
    indicator: 'bg-emerald-600',
  },
  chicken: {
    bg: 'bg-yellow-50 hover:bg-yellow-100/75 dark:bg-yellow-950/20 dark:hover:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-100 hover:border-yellow-300 dark:border-yellow-900/30 dark:hover:border-yellow-800/50',
    indicator: 'bg-yellow-500',
  },
  duck: {
    bg: 'bg-cyan-50 hover:bg-cyan-100/75 dark:bg-cyan-950/20 dark:hover:bg-cyan-900/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-100 hover:border-cyan-300 dark:border-cyan-900/30 dark:hover:border-cyan-800/50',
    indicator: 'bg-cyan-500',
  },
  fish: {
    bg: 'bg-sky-50 hover:bg-sky-100/75 dark:bg-sky-950/20 dark:hover:bg-sky-900/30',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-100 hover:border-sky-300 dark:border-sky-900/30 dark:hover:border-sky-800/50',
    indicator: 'bg-sky-500',
  },
  poultry: {
    bg: 'bg-yellow-50 hover:bg-yellow-100/75 dark:bg-yellow-950/20 dark:hover:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-100 hover:border-yellow-300 dark:border-yellow-900/30 dark:hover:border-yellow-800/50',
    indicator: 'bg-yellow-500',
  },
  turtle: {
    bg: 'bg-teal-50 hover:bg-teal-100/75 dark:bg-teal-950/20 dark:hover:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-100 hover:border-teal-300 dark:border-teal-900/30 dark:hover:border-teal-800/50',
    indicator: 'bg-teal-500',
  },
  'guinea-pig': {
    bg: 'bg-rose-50 hover:bg-rose-100/75 dark:bg-rose-950/20 dark:hover:bg-rose-900/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 hover:border-rose-300 dark:border-rose-900/30 dark:hover:border-rose-800/50',
    indicator: 'bg-rose-500',
  },
}
