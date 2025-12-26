
export type Subject = 'رياضيات' | 'علوم' | 'فيزياء' | 'كيمياء' | 'أحياء' | 'لغة عربية' | 'إنجليزي' | 'تاريخ' | 'جغرافيا' | 'أخرى';

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  author: string;
  authorId: string;
  title: string;
  content: string;
  subject: Subject;
  likes: string[];
  reports: string[];
  comments: Comment[];
  timestamp: number;
  imageUrls?: string[]; // تحديث لدعم مصفوفة صور
  isPinned?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  role: 'user' | 'admin';
  joinedAt: number;
}
