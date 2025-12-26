
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import { Post, Comment, Subject } from '../types';

export const postService = {
  getAll: async (page: number = 0, limit: number = 10): Promise<Post[]> => {
    let serverPosts: Post[] = [];
    
    try {
      const from = page * limit;
      const to = from + limit - 1;

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes (user_id),
          reports (user_id),
          comments (*)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && posts) {
        serverPosts = posts.map(p => {
          let finalImages: string[] = [];
          if (p.image_urls && Array.isArray(p.image_urls)) {
            finalImages = p.image_urls;
          } else if (p.image_url) {
            finalImages = [p.image_url];
          }

          return {
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
            imageUrls: finalImages,
            isPinned: p.is_pinned || false
          };
        });
      }
    } catch (err) {
      console.warn("Server fetch failed, using local only");
    }

    // دمج المنشورات المحلية (Fallback) مع السيرفر لضمان رؤية المنشور الجديد فوراً
    const localPosts = db.getPosts();
    
    // فلترة المنشورات المتكررة (لو موجودة في الاتنين)
    const combined = [...serverPosts];
    localPosts.forEach(lp => {
      if (!combined.find(sp => sp.id === lp.id || (sp.title === lp.title && sp.authorId === lp.authorId))) {
        combined.push(lp);
      }
    });

    // إعادة الترتيب: المثبت أولاً، ثم الأحدث زمنياً
    return combined.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp - a.timestamp;
    });
  },

  uploadFiles: async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('attachments')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) return null;

        const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(fileName);
        return publicUrl;
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  },

  create: async (title: string, content: string, subject: Subject, author: {name: string, id: string}, imageUrls: string[] = []): Promise<boolean> => {
    const newPostLocal: Post = {
      id: `local-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      subject,
      author: author.name,
      authorId: author.id,
      imageUrls,
      likes: [],
      reports: [],
      comments: [],
      timestamp: Date.now()
    };

    // حفظ محلي فوراً (Optimistic UI)
    const existingPosts = db.getPosts();
    db.savePosts([newPostLocal, ...existingPosts]);

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
        supabase.rpc('increment_points', { user_id: author.id, amount: 5 }).catch(() => {});
      }
      
      // بنرجع true دائماً لأننا حفظناه محلياً خلاص والريفريش هيظهره
      return true;
    } catch (err) {
      return true;
    }
  },

  toggleLike: async (postId: string, userId: string) => {
    try {
      const { data: existing } = await supabase.from('likes').select('*').eq('post_id', postId).eq('user_id', userId).maybeSingle();
      if (existing) {
        await supabase.from('likes').delete().eq('id', existing.id);
      } else {
        await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);
      }
    } catch (e) {}
  },

  togglePin: async (postId: string, isPinned: boolean) => {
    await supabase.from('posts').update({ is_pinned: !isPinned }).eq('id', postId);
  },

  reportPost: async (postId: string, userId: string): Promise<boolean> => {
    try {
      const { data: existing } = await supabase.from('reports').select('*').eq('post_id', postId).eq('user_id', userId).maybeSingle();
      if (existing) {
        await supabase.from('reports').delete().eq('id', existing.id);
        return false;
      } else {
        await supabase.from('reports').insert([{ post_id: postId, user_id: userId }]);
        return true;
      }
    } catch (e) { return false; }
  },

  deletePost: async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    const locals = db.getPosts().filter(p => p.id !== postId);
    db.savePosts(locals);
  },

  addComment: async (postId: string, text: string, author: {name: string, id: string}) => {
    await supabase.from('comments').insert([{ post_id: postId, text, author_name: author.name, author_id: author.id }]);
  },

  getTopStudents: async () => {
    try {
      const { data } = await supabase.from('profiles').select('name, points, avatar').order('points', { ascending: false }).limit(5);
      return data || [];
    } catch (e) { return []; }
  }
};
