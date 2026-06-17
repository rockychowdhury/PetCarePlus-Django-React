import React from 'react'
import { Cat, Dog, Bird, Egg, Shield } from 'lucide-react'

// Custom SVGs for animals not natively present in default Lucide set, ensuring high fidelity.
export const RabbitIcon = (props) => (
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
    <path d="M12 16c-1.5 0-3-1-3-3s1.5-3 3-3 3 1 3 3-1.5 3-3 3z" />
    <path d="M9 13a3 3 0 0 1 6 0" />
    <path d="M10 10V4a2 2 0 0 1 4 0v6" />
    <path d="M7 14H4a1 1 0 0 1-1-1 4 4 0 0 1 4-4" />
    <path d="M17 14h3a1 1 0 0 0 1-1 4 4 0 0 0-4-4" />
    <path d="M12 16v4" />
    <path d="M10 20h4" />
  </svg>
)

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
    <path d="M4 15a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2H4v-2z" />
    <path d="M17 12V8a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4" />
    <path d="M5 8c0-1.5 1-2.5 2-2.5" />
    <path d="M19 8c0-1.5-1-2.5-2-2.5" />
    <circle cx="9" cy="14" r="1" fill="currentColor" />
    <circle cx="15" cy="14" r="1" fill="currentColor" />
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
    <path d="M16 18c0-1.5-1-3-3-3H11c-2 0-3 1.5-3 3" />
    <path d="M8 15V8a3 3 0 0 1 6 0v7" />
    <path d="M9 6C7.5 5 6 5.5 6 7v1" />
    <path d="M15 6c1.5-1 3-0.5 3 1v1" />
    <path d="M10 11h4" />
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

export const getAnimalIcon = (slug) => {
  switch (slug) {
    case 'cat':
      return Cat
    case 'dog':
      return Dog
    case 'rabbit':
      return RabbitIcon
    case 'bird':
      return Bird
    case 'cow':
      return CowIcon
    case 'goat':
      return GoatIcon
    case 'chicken':
      return Egg
    case 'duck':
      return DuckIcon
    default:
      return Shield
  }
}

export const ANIMAL_THEMES = {
  cat: {
    bg: 'bg-orange-50 hover:bg-orange-100/75',
    text: 'text-orange-600',
    border: 'border-orange-100 hover:border-orange-300',
    indicator: 'bg-orange-500',
  },
  dog: {
    bg: 'bg-blue-50 hover:bg-blue-100/75',
    text: 'text-blue-600',
    border: 'border-blue-100 hover:border-blue-300',
    indicator: 'bg-blue-500',
  },
  rabbit: {
    bg: 'bg-purple-50 hover:bg-purple-100/75',
    text: 'text-purple-600',
    border: 'border-purple-100 hover:border-purple-300',
    indicator: 'bg-purple-500',
  },
  bird: {
    bg: 'bg-teal-50 hover:bg-teal-100/75',
    text: 'text-teal-600',
    border: 'border-teal-100 hover:border-teal-300',
    indicator: 'bg-teal-500',
  },
  cow: {
    bg: 'bg-amber-50 hover:bg-amber-100/75',
    text: 'text-amber-700',
    border: 'border-amber-100 hover:border-amber-300',
    indicator: 'bg-amber-600',
  },
  goat: {
    bg: 'bg-emerald-50 hover:bg-emerald-100/75',
    text: 'text-emerald-700',
    border: 'border-emerald-100 hover:border-emerald-300',
    indicator: 'bg-emerald-600',
  },
  chicken: {
    bg: 'bg-yellow-50 hover:bg-yellow-100/75',
    text: 'text-yellow-600',
    border: 'border-yellow-100 hover:border-yellow-300',
    indicator: 'bg-yellow-500',
  },
  duck: {
    bg: 'bg-cyan-50 hover:bg-cyan-100/75',
    text: 'text-cyan-600',
    border: 'border-cyan-100 hover:border-cyan-300',
    indicator: 'bg-cyan-500',
  },
}
