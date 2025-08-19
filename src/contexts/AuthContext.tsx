import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isLoading: boolean;
  register: (userData: Partial<User> & { password: string }) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock database - In production, this would be a real database
const MOCK_USERS: User[] = [
  {
    id: '1',
    rollNumber: 'ADM001',
    role: 'admin',
    name: 'John Smith',
    department: 'Traffic Control',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    email: 'user@traffic-monitor.com',
    role: 'user',
    name: 'Sarah Johnson',
    createdAt: new Date('2024-02-10')
  },
  {
    id: '3',
    rollNumber: 'ADM002',
    role: 'admin',
    name: 'Mike Davis',
    department: 'Emergency Response',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '4',
    email: 'jane.doe@gmail.com',
    role: 'user',
    name: 'Jane Doe',
    createdAt: new Date('2024-02-15')
  }
];

// Mock passwords - In production, these would be hashed
const MOCK_PASSWORDS: Record<string, string> = {
  'ADM001': 'admin123!',
  'ADM002': 'admin456!',
  'user@traffic-monitor.com': 'user123!',
  'jane.doe@gmail.com': 'password123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('traffic-monitor-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      let foundUser: User | undefined;
      
      if (credentials.role === 'admin') {
        // For admins, search by roll number
        foundUser = MOCK_USERS.find(u => 
          u.role === 'admin' && u.rollNumber === credentials.identifier
        );
      } else {
        // For users, search by email
        foundUser = MOCK_USERS.find(u => 
          u.role === 'user' && u.email === credentials.identifier
        );
      }
      
      if (!foundUser) {
        setIsLoading(false);
        return {
          success: false,
          error: credentials.role === 'admin' 
            ? 'Invalid roll number or role' 
            : 'Invalid email or role'
        };
      }
      
      // Check password
      const storedPassword = MOCK_PASSWORDS[credentials.identifier];
      if (storedPassword !== credentials.password) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Invalid password'
        };
      }
      
      // Successful login
      setUser(foundUser);
      localStorage.setItem('traffic-monitor-user', JSON.stringify(foundUser));
      setIsLoading(false);
      
      return {
        success: true,
        user: foundUser
      };
      
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<AuthResponse> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Check if user already exists
      const identifier = userData.role === 'admin' ? userData.rollNumber : userData.email;
      const existingUser = MOCK_USERS.find(u => 
        (u.role === 'admin' && u.rollNumber === identifier) ||
        (u.role === 'user' && u.email === identifier)
      );
      
      if (existingUser) {
        setIsLoading(false);
        return {
          success: false,
          error: userData.role === 'admin' 
            ? 'Roll number already registered' 
            : 'Email already registered'
        };
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || '',
        role: userData.role || 'user',
        createdAt: new Date(),
        ...(userData.role === 'admin' 
          ? { rollNumber: userData.rollNumber, department: userData.department }
          : { email: userData.email }
        )
      };
      
      // In production, you would save to database
      MOCK_USERS.push(newUser);
      if (identifier) {
        MOCK_PASSWORDS[identifier] = userData.password;
      }
      
      setIsLoading(false);
      return {
        success: true,
        user: newUser
      };
      
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('traffic-monitor-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};