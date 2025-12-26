
import React from 'react';
import { STRINGS } from './strings';

export const SUBJECTS_WITH_ICONS = [
  { name: STRINGS.subjects.math, icon: '📐' },
  { name: STRINGS.subjects.science, icon: '🔬' },
  { name: STRINGS.subjects.physics, icon: '⚡' },
  { name: STRINGS.subjects.chemistry, icon: '🧪' },
  { name: STRINGS.subjects.biology, icon: '🧬' },
  { name: STRINGS.subjects.arabic, icon: '📖' },
  { name: STRINGS.subjects.english, icon: '🔤' },
  { name: STRINGS.subjects.history, icon: '🏛️' },
  { name: STRINGS.subjects.geography, icon: '🌍' },
  { name: STRINGS.subjects.other, icon: '💡' }
];

export const SUBJECTS = SUBJECTS_WITH_ICONS.map(s => s.name);

export const MOCK_POSTS = [];
