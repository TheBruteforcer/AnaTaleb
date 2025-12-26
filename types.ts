
export type Subject = 'رياضيات' | 'علوم' | 'فيزياء' | 'كيمياء' | 'أحياء' | 'لغة عربية' | 'إنجليزي' | 'تاريخ' | 'جغرافيا' | 'أخرى';

export type Grade = 
  | 'الأول الإعدادي' 
  | 'الثاني الإعدادي' 
  | 'الثالث الإعدادي' 
  | 'الأول الثانوي' 
  | 'الثاني الثانوي' 
  | 'الثالث الثانوي';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  grade: Grade;
  subject: string;
  questions: Question[];
  authorId: string;
  authorName: string;
  timestamp: number;
}

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
  imageUrls?: string[];
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
