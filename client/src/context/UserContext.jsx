import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/userService';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(updates) {
    try {
      const data = await updateProfile(updates);
      setUser(data);
      return data;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser: loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
