import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(() => {
    const saved = localStorage.getItem('teacherData');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('teacherToken') || null);
  const [loading, setLoading] = useState(false);

  const login = async (teacherId, password) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', {
        teacherId: teacherId.trim(),
        password
      });

      const { token: receivedToken, teacher: teacherData } = response.data;
      localStorage.setItem('teacherToken', receivedToken);
      localStorage.setItem('teacherData', JSON.stringify(teacherData));
      setToken(receivedToken);
      setTeacher(teacherData);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid faculty ID or password.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherData');
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
