import create from 'zustand';
import { devtools } from 'zustand/middleware';

const useRootStore = create(devtools((set) => ({
  auth: { user: null, profile: null },
  courses: [],
  sessions: [],
  attendance: {},

  // auth actions
  setUser(user) {
    set((state) => ({ auth: { ...state.auth, user } }));
  },
  setProfile(profile) {
    set((state) => ({ auth: { ...state.auth, profile } }));
  },

  // courses
  setCourses(courses) {
    set(() => ({ courses }));
  },
}));

export default useRootStore;
import create from 'zustand';

const useRootStore = create(set => ({
  auth: null,
  sessions: [],
  setAuth(auth) { set(() => ({ auth })); },
  setSessions(sessions) { set(() => ({ sessions })); },
}));

export default useRootStore;
