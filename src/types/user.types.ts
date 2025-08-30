// types/user.types.ts

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  _id: string;
}

export interface UserFilters {
  searchTerm: string;
}

export interface UserStats {
  totalUsers: number;
  newThisMonth: number;
  filteredResults: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
  editingUser: IUser | null;
  isLoading: boolean;
}