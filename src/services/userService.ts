// services/userService.ts

import { IUser, CreateUserData, UpdateUserData, ApiResponse } from '../types/user.types';

class UserService {
  private baseURL = '/api/users';

  // Get all users from database
  async getAllUsers(): Promise<IUser[]> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<IUser[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get single user by ID
  async getUserById(id: string): Promise<IUser> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<IUser> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user');
      }

      return result.data!;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user in database
  async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<IUser> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }

      return result.data!;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user in database
  async updateUser(id: string, userData: Partial<UpdateUserData>): Promise<IUser> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<IUser> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user');
      }

      return result.data!;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user from database
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Check if phone number exists
  async checkPhoneExists(phone: string): Promise<boolean> {
    try {
      const response = await fetch('/api/users/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ exists: boolean }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check phone');
      }

      return result.data?.exists || false;
    } catch (error) {
      console.error('Error checking phone:', error);
      throw error;
    }
  }
}

export const userService = new UserService();