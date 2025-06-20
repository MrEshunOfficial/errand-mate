
// hooks/useAdminUsers.ts - Custom hook for user management
'use client';

import { useCallback, useEffect } from 'react';
import { useAdminContext } from './useAdminContext';

interface UseAdminUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  roleFilter?: 'all' | 'user' | 'admin' | 'super_admin';
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { state, dispatch } = useAdminContext();
  const { page = 1, limit = 20, search, roleFilter = 'all' } = options;

  const fetchUsers = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { section: 'users', loading: true } });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_USERS', payload: data });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          section: 'users', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    }
  }, [dispatch, page, limit, search, roleFilter]);

  const promoteUser = useCallback(async (userId: string, newRole: 'admin' | 'super_admin') => {
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to promote user');
      }

      dispatch({ type: 'UPDATE_USER_ROLE', payload: { userId, newRole } });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [dispatch]);

  const demoteUser = useCallback(async (targetEmail: string) => {
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to demote user');
      }

      // Find user and update their role
      const user = state.users.users.find(u => u.email === targetEmail);
      if (user) {
        dispatch({ type: 'UPDATE_USER_ROLE', payload: { userId: user._id, newRole: 'user' } });
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [dispatch, state.users.users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: state.users.users,
    totalUsers: state.users.totalUsers,
    totalPages: state.users.totalPages,
    currentPage: state.users.currentPage,
    loading: state.loading.users,
    error: state.error.users,
    refetch: fetchUsers,
    promoteUser,
    demoteUser,
  };
}