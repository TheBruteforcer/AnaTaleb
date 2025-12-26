
import { supabase } from '../lib/supabase';
import { Quiz } from '../types';

export const quizService = {
  save: async (quizData: Omit<Quiz, 'id' | 'timestamp'>) => {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([{
        title: quizData.title,
        description: quizData.description,
        grade: quizData.grade,
        questions: quizData.questions,
        author_id: quizData.authorId,
        author_name: quizData.authorName
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  },

  getById: async (id: string): Promise<Quiz | null> => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      grade: data.grade,
      subject: data.subject || '',
      questions: data.questions,
      authorId: data.author_id,
      authorName: data.author_name,
      timestamp: new Date(data.created_at).getTime()
    };
  },

  getAll: async (limit = 10): Promise<Quiz[]> => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return (data || []).map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      grade: d.grade,
      subject: d.subject || '',
      questions: d.questions,
      authorId: d.author_id,
      authorName: d.author_name,
      timestamp: new Date(d.created_at).getTime()
    }));
  }
};
