
import { supabase } from '../lib/supabase';
import { Post, Comment, Subject } from '../types';

export const postService = {
  getAll: async (): Promise<Post[]> => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes (user_id),
          reports (user_id),
          comments (*)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error fetching posts:", error);
        return [];
      }

      return posts.map(p => ({
        id: p.id,
        author: p.author_name,
        authorId: p.author_id,
        title: p.title,
        content: p.content,
        subject: p.subject,
        likes: p.likes ? p.likes.map((l: any) => l.user_id) : [],
        reports: p.reports ? p.reports.map((r: any) => r.user_id) : [],
        comments: p.comments ? p.comments.map((c: any) => ({
          id: c.id,
          author: c.author_name,
          authorId: c.author_id,
          text: c.text,
          timestamp: new Date(c.created_at).getTime()
        })) : [],
        timestamp: new Date(p.created_at).getTime(),
        imageUrls: p.image_urls || (p.image_url ? [p.image_url] : []),
        isPinned: p.is_pinned || false
      }));
    } catch (err) {
      console.error("Catch error fetching posts:", err);
      return [];
    }
  },

  uploadFiles: async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('attachments').upload(fileName, file);
      if (error) {
        console.error("Upload error:", error);
        return null;
      }
      const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(fileName);
      return publicUrl;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  },

  create: async (title: string, content: string, subject: Subject, author: {name: string, id: string}, imageUrls: string[] = []): Promise<boolean> => {
    try {
      const { error } = await supabase.from('posts').insert([{
        title, 
        content, 
        subject, 
        author_name: author.name, 
        author_id: author.id, 
        image_urls: imageUrls,
        image_url: imageUrls[0] || null
      }]);
      
      if (!error) {
        await supabase.rpc('increment_points', { user_id: author.id, amount: 5 }).catch(e => console.error("Points error:", e));
        return true;
      }
      console.error("Create post error:", error);
      return false;
    } catch (err) {
      return false;
    }
  },

  toggleLike: async (postId: string, userId: string) => {
    const { data: existing } = await supabase.from('likes').select('*').eq('post_id', postId).eq('user_id', userId).single();
    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);
    }
  },

  togglePin: async (postId: string, isPinned: boolean) => {
    await supabase.from('posts').update({ is_pinned: !isPinned }).eq('id', postId);
  },

  reportPost: async (postId: string, userId: string): Promise<boolean> => {
    const { data: existing } = await supabase.from('reports').select('*').eq('post_id', postId).eq('user_id', userId).single();
    if (existing) {
      await supabase.from('reports').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('reports').insert([{ post_id: postId, user_id: userId }]);
      const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('post_id', postId);
      if (count !== null && count >= 5) {
        await supabase.from('posts').delete().eq('id', postId);
        return true; 
      }
      return false;
    }
  },

  deletePost: async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
  },

  addComment: async (postId: string, text: string, author: {name: string, id: string}) => {
    await supabase.from('comments').insert([{ post_id: postId, text, author_name: author.name, author_id: author.id }]);
  },

  getTopStudents: async () => {
    const { data } = await supabase.from('profiles').select('name, points, avatar').order('points', { ascending: false }).limit(5);
    return data || [];
  }
};
