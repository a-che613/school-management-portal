import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, School } from '@/types';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'your-secret-key-change-in-production'
);

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  setAuthToken: (user: User) => Promise<void>;
}

interface SchoolState {
  schools: School[];
  isLoading: boolean;
  lastFetched: number | null;
  shouldRefresh: () => boolean;
  setSchools: (schools: School[]) => void;
  setLoading: (loading: boolean) => void;
  updateLastFetch: () => void;
  addSchool: (school: School) => void;
  updateSchool: (schoolId: string, updates: Partial<School>) => void;
  deleteSchool: (schoolId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setAuthToken: async (user) => {
        // Create JWT token
        const token = await new SignJWT({
          uid: user.id,
          email: user.email,
          role: user.globalRole,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(JWT_SECRET);
        
        // Set token in cookie
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
        
        // Set user in store
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      },
      
      logout: () => {
        // Clear token cookie
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useSchoolStore = create<SchoolState>((set, get) => {
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  return {
    schools: [],
    isLoading: false,
    lastFetched: null,

    shouldRefresh: () => {
      const { lastFetched } = get();
      return !lastFetched || Date.now() - lastFetched > CACHE_DURATION;
    },

    setSchools: (schools) => set({ 
      schools, 
      isLoading: false,
      lastFetched: Date.now()
    }),

    setLoading: (loading) => set({ isLoading: loading }),

    updateLastFetch: () => set({ lastFetched: Date.now() }),

    addSchool: (school) => set((state) => ({
      schools: [...state.schools, school]
    })),

    updateSchool: (schoolId, updates) => set((state) => ({
      schools: state.schools.map(school =>
        school.id === schoolId ? { ...school, ...updates } : school
      )
    })),

    deleteSchool: (schoolId) => set((state) => ({
      schools: state.schools.filter(school => school.id !== schoolId)
    })),
  };
});
