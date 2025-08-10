import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { setTokenHeader, request } from 'librechat-data-provider';
import { useRecoilState } from 'recoil';
import store from '~/store';

interface AutoLoginResponse {
  success: boolean;
  token: string;
  user: any;
  message: string;
}

/**
 * Hook for auto-login functionality
 * Creates an anonymous user and logs them in automatically
 */
export const useAutoLogin = () => {
  const navigate = useNavigate();
  const [, setUser] = useRecoilState(store.user);

  const autoLoginMutation = useMutation({
    mutationFn: async (): Promise<AutoLoginResponse> => {
      const response = await request.post('/api/auth/auto-login', {});
      return response;
    },
    onSuccess: (data: AutoLoginResponse) => {
      if (data.success && data.token && data.user) {
        // Set token header for future requests
        setTokenHeader(data.token);
        
        // Set user in store
        setUser(data.user);
        
        // Store token in localStorage for persistence
        localStorage.setItem('token', data.token);
        
        // Navigate to main chat
        navigate('/c/new', { replace: true });
        
        // Dispatch custom event to update auth context
        window.dispatchEvent(new CustomEvent('tokenUpdated', { detail: data.token }));
      }
    },
    onError: (error) => {
      console.error('Auto-login failed:', error);
    },
  });

  const triggerAutoLogin = useCallback(() => {
    autoLoginMutation.mutate();
  }, [autoLoginMutation]);

  return {
    autoLogin: triggerAutoLogin,
    isLoading: autoLoginMutation.isPending,
    error: autoLoginMutation.error,
    isSuccess: autoLoginMutation.isSuccess,
  };
};
