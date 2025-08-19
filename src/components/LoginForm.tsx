import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Shield, Users, UserPlus, LogIn } from 'lucide-react';
import { LoginCredentials } from '../types';

const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const credentials: LoginCredentials = {
      identifier,
      password,
      role
    };
    
    const result = await login(credentials);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    const userData = {
      name,
      role,
      password,
      ...(role === 'admin' 
        ? { rollNumber: identifier, department }
        : { email: identifier }
      )
    };
    
    const result = await register(userData);
    if (result.success) {
      setSuccess('Registration successful! You can now login.');
      setIsLogin(true);
      resetForm();
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setDepartment('');
    setError('');
    setSuccess('');
  };

  const fillDemoCredentials = (demoRole: 'admin' | 'user') => {
    setRole(demoRole);
    if (demoRole === 'admin') {
      setIdentifier('ADM001');
      setPassword('admin123!');
    } else {
      setIdentifier('user@traffic-monitor.com');
      setPassword('user123!');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Traffic Monitor</h1>
            <p className="text-blue-200 mt-2">AI-Powered Emergency System</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                    role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-blue-200 hover:bg-white/20'
                  }`}
                >
                  <Users size={16} />
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                    role === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-blue-200 hover:bg-white/20'
                  }`}
                >
                  <Shield size={16} />
                  Admin
                </button>
              </div>
            </div>

            {/* Name field for registration */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {/* Identifier field */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                {role === 'admin' ? 'Roll Number / ID' : 'Email Address'}
              </label>
              <input
                type={role === 'admin' ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={role === 'admin' ? 'Enter your roll number or ID' : 'Enter your email address'}
                required
              />
            </div>

            {/* Department field for admin registration */}
            {!isLogin && role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Traffic Control, Emergency Response"
                  required
                />
              </div>
            )}

            {/* Password field */}
            <div className="relative">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter your password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9 text-blue-200 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password field for registration */}
            {!isLogin && (
              <div className="relative">
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  minLength={6}
                  required
                />
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="text-green-300 text-sm bg-green-500/20 p-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-red-300 text-sm bg-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          {/* Demo Credentials - Only show for login */}
          {isLogin && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-blue-200 text-sm text-center mb-4">Demo Credentials:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fillDemoCredentials('admin')}
                  className="flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  <Shield size={16} />
                  Admin Demo
                </button>
                <button
                  onClick={() => fillDemoCredentials('user')}
                  className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  <Users size={16} />
                  User Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;