// hooks/useUsers.ts

import { useState, useEffect, useCallback } from 'react';
import { IUser, CreateUserData, UserStats } from '../types/user.types';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new user
  const createUser = useCallback(async (userData: CreateUserData): Promise<IUser | null> => {
    try {
      setError(null);
      const newUser = await userService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update existing user
  const updateUser = useCallback(async (id: string, userData: Partial<CreateUserData>): Promise<IUser | null> => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(user => 
        user._id === id ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user._id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};

// Hook for filtering users
export const useUserFilters = (users: IUser[]) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>(users);

  useEffect(() => {
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const phone = user.phone.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || phone.includes(search);
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return {
    searchTerm,
    setSearchTerm,
    filteredUsers,
  };
};

// Hook for user statistics
export const useUserStats = (users: IUser[], filteredUsers: IUser[]): UserStats => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    newThisMonth: 0,
    filteredResults: 0,
  });

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newThisMonth = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;

    setStats({
      totalUsers: users.length,
      newThisMonth,
      filteredResults: filteredUsers.length,
    });
  }, [users, filteredUsers]);

  return stats;
};