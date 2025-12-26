
import React from 'react';

export const SUBJECTS_WITH_ICONS = [
  { name: 'رياضيات', icon: '📐' },
  { name: 'علوم', icon: '🔬' },
  { name: 'فيزياء', icon: '⚡' },
  { name: 'كيمياء', icon: '🧪' },
  { name: 'أحياء', icon: '🧬' },
  { name: 'لغة عربية', icon: '📖' },
  { name: 'إنجليزي', icon: '🔤' },
  { name: 'تاريخ', icon: '🏛️' },
  { name: 'جغرافيا', icon: '🌍' },
  { name: 'أخرى', icon: '💡' }
];

export const SUBJECTS = SUBJECTS_WITH_ICONS.map(s => s.name);

// تم حذف المنشورات التجريبية لضمان عرض بيانات السيرفر الحقيقية فقط
export const MOCK_POSTS = [];
