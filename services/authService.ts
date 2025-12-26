
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import { User } from '../types';

// استخدام مكتبة bottts للأشكال الكرتونية غير البشرية
const getStudentAvatar = (seed: string) => `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

export const authService = {
  login: async (email: string, pass: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) return null;

    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      points: data.points,
      role: data.role,
      joinedAt: new Date(data.created_at).getTime()
    };

    db.setCurrentUser(user);
    return user;
  },

  register: async (name: string, email: string, pass: string): Promise<User> => {
    const emailLower = email.toLowerCase();
    
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', emailLower)
      .single();

    if (existing) {
      const user: User = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        avatar: existing.avatar,
        points: existing.points,
        role: existing.role,
        joinedAt: new Date(existing.created_at).getTime()
      };
      db.setCurrentUser(user);
      return user;
    }

    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const isFirstUser = count === 0;

    const newUser = {
      name,
      email: emailLower,
      avatar: getStudentAvatar(name + Date.now()),
      points: 10,
      role: isFirstUser ? 'admin' : 'user'
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newUser])
      .select()
      .single();

    if (error) throw error;

    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      points: data.points,
      role: data.role,
      joinedAt: new Date(data.created_at).getTime()
    };

    db.setCurrentUser(user);
    return user;
  },

  updateProfile: async (userId: string, updates: { name?: string, avatar?: string }): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) return null;

    const updatedUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      points: data.points,
      role: data.role,
      joinedAt: new Date(data.created_at).getTime()
    };

    db.setCurrentUser(updatedUser);
    return updatedUser;
  },

  logout: () => {
    db.setCurrentUser(null);
  },

  isAuthenticated: () => !!db.getCurrentUser()
};
