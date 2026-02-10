"use client";
import { useAppSelector, useAppDispatch } from '@/_core/store/hooks';
import { useLoginMutation, useLogoutQuery, useJwtLoginQuery, useChangePasswordMutation } from '../slices';
import { clearAuth } from '../slices';

export function useAuth() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const { data: logoutData } = useLogoutQuery(undefined, { skip: true });
  const { data: jwtData, isLoading: isRefreshing } = useJwtLoginQuery();
  const [changePassword] = useChangePasswordMutation();

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  return {
    user: auth,
    isAuthenticated: !!auth.username,
    isAdmin: auth.isAdmin,
    departments: auth.Departments,
    login,
    logout: handleLogout,
    isLoading: isLoggingIn,
    isRefreshing,
    changePassword,
    jwtData
  };
}
