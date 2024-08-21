import { User } from '~/types';
import { create } from 'zustand';

type UserStore = {
  user: User | null;
  setUser: (data: User | null) => void;
};

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (data) => set({ user: data }),
}));

export default useUserStore;
