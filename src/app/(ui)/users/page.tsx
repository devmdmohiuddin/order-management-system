"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast'; // You'll need to install this: npm install react-hot-toast

// Components
import UserStatsCards from '@/components/UserStatsCards';
import UserSearchBar from '@/components/UserSearchBar';
import UserTable from '@/components/UserTable';
import UserFormModal from '@/components/UserFormModal';

// Hooks
import { useUsers, useUserFilters, useUserStats } from '@/hooks/useUsers';

// Types
import { IUser, UserFormData } from '@/types/user.types'

const UserManagementPage: React.FC = () => {
  // Navigation state
  // const [activeTab, setActiveTab] = useState<string>('users');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // User data and operations
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  
  // Search and filtering
  const { searchTerm, setSearchTerm, filteredUsers } = useUserFilters(users);
  
  // Statistics
  const stats = useUserStats(users, filteredUsers);

  // Handle user creation
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setIsSubmitting(true);
      const { email, ...requiredData } = userData;
      const createData = {
        ...requiredData,
        ...(email && { email }), // Only include email if it's provided
      };
      
      await createUser(createData);
      toast.success('User created successfully!');
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle user update
  const handleUpdateUser = async (userData: UserFormData) => {
    if (!editingUser) return;
    
    try {
      setIsSubmitting(true);
      const { email, ...requiredData } = userData;
      const updateData = {
        ...requiredData,
        ...(email && { email }), // Only include email if it's provided
      };
      
      await updateUser(editingUser._id, updateData);
      toast.success('User updated successfully!');
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  // Open modal for editing
  const handleEditUser = (user: IUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleCreateNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Handle form submission
  const handleFormSubmit = (userData: UserFormData) => {
    if (editingUser) {
      handleUpdateUser(userData);
    } else {
      handleCreateUser(userData);
    }
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  User Management
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage all users in your system - Create, view, edit, and delete users
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  onClick={handleCreateNew}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <UserStatsCards stats={stats} loading={loading} />

            {/* Search Bar */}
            <UserSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by name or phone number..."
            />

            {/* Users Table */}
            <UserTable
              users={filteredUsers}
              loading={loading}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onCreateNew={handleCreateNew}
            />

            {/* User Form Modal */}
            <UserFormModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleFormSubmit}
              editingUser={editingUser}
              isLoading={isSubmitting}
            />
      </div>
    </div>
  );
};

export default UserManagementPage;