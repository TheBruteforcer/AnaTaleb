
import { Post, User } from '../types';
import { MOCK_POSTS } from '../constants';

const DB_KEYS = {
  POSTS: 'ana_taleb_posts_v2',
  USERS: 'ana_taleb_users_v2',
  CURRENT_USER: 'ana_taleb_session_v2'
};

export const db = {
  getPosts: (): Post[] => {
    const data = localStorage.getItem(DB_KEYS.POSTS);
    if (!data) {
      // Initialize with reports field if missing
      const initialPosts = MOCK_POSTS.map(p => ({
        ...p,
        reports: [],
        likes: [],
        comments: []
      }));
      localStorage.setItem(DB_KEYS.POSTS, JSON.stringify(initialPosts));
      return initialPosts as any;
    }
    return JSON.parse(data);
  },
  
  savePosts: (posts: Post[]) => {
    localStorage.setItem(DB_KEYS.POSTS, JSON.stringify(posts));
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(DB_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    if (!data) return null;
    const session = JSON.parse(data);
    // Always refresh user data from the main users list to ensure profile updates are reflected
    const users = db.getUsers();
    return users.find(u => u.id === session.id) || session;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
  }
};
