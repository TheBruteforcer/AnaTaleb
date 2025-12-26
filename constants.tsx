
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

export const MOCK_POSTS = [
  {
    id: '1',
    author: 'أحمد علي',
    authorId: 'mock-1',
    title: 'ملخص قوانين الفيزياء - الباب الأول',
    content: 'يا شباب دي تجميعة لكل القوانين اللي ممكن تحتاجوها في الباب الأول، بالتوفيق يا وحوش!',
    subject: 'فيزياء',
    likes: [],
    comments: [],
    timestamp: Date.now() - 3600000,
    imageUrl: 'https://picsum.photos/seed/physics/800/400'
  },
  {
    id: '2',
    author: 'سارة محمد',
    authorId: 'mock-2',
    title: 'ازاي تذاكر الكيمياء العضوية صح؟',
    content: 'الكيمياء العضوية مش صعبة، الفكرة كلها في الربط بين المعادلات.. ركزوا في المخطط ده.',
    subject: 'كيمياء',
    likes: [],
    comments: [],
    timestamp: Date.now() - 7200000,
  }
];
