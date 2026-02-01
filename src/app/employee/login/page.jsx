'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import url from '../../../../url'
const EmployeeLogin = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeName.trim()) {
      newErrors.employeeName = 'Employee name is required';
    } else if (formData.employeeName.length < 2) {
      newErrors.employeeName = 'Employee name must be at least 2 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${url.API_URL}/employees/login`, {
        employeeName: formData.employeeName,
        password: formData.password
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('employee', JSON.stringify(response.data.data.employee));
        
        setMessage('Login successful! Redirecting...');
        
        // Navigate to dashboard
        setTimeout(() => {
          router.push('/employee/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h1 className="login-title">Employee Login</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="employeeName" className="form-label">
              Employee Name
            </label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              placeholder="Enter your employee name"
              className={`form-input ${errors.employeeName ? 'error' : ''}`}
              autoComplete="username"
            />
            {errors.employeeName && (
              <span className="error-message">{errors.employeeName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="login-footer">
          Contact your administrator if you forgot your password
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .login-title {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          color: #666;
          margin: 0;
          font-size: 16px;
        }

        .login-form {
          width: 100%;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #1890ff;
        }

        .form-input.error {
          border-color: #ff4d4f;
        }

        .error-message {
          display: block;
          margin-top: 6px;
          color: #ff4d4f;
          font-size: 12px;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-bottom: 16px;
        }

        .login-button:hover:not(:disabled) {
          background: #40a9ff;
        }

        .login-button:disabled {
          background: #d9d9d9;
          cursor: not-allowed;
        }

        .message {
          padding: 12px;
          border-radius: 6px;
          text-align: center;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .message.success {
          background: #f6ffed;
          border: 1px solid #b7eb8f;
          color: #52c41a;
        }

        .message.error {
          background: #fff2f0;
          border: 1px solid #ffccc7;
          color: #ff4d4f;
        }

        .login-footer {
          text-align: center;
          font-size: 12px;
          color: #888;
          margin-top: 16px;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
          }
          
          .login-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeLogin;
