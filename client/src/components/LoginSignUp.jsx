import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginSignUp.css';

const LoginSignUp = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && !form.name) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const endpoint = isSignUp ? 'signup' : 'signin';
      const response = await axios.post(
        `http://localhost:5000/api/v1/${endpoint}`,
        form,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
        'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setForm({ name: '', email: '', password: '' });
    setErrors({});
    setApiError('');
  };

  return (
    <div className="auth-container">
      <div className="form-side">
        <div className="form-container">
          <div className="form-header">
            <button
              type="button"
              className={`form-switch ${!isSignUp ? 'active' : ''}`}
              onClick={toggleForm}
              disabled={isLoading}
            >
              Login
            </button>
            <button
              type="button"
              className={`form-switch ${isSignUp ? 'active' : ''}`}
              onClick={toggleForm}
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>

          <div className="form-content">
            <form onSubmit={handleSubmit} className={isSignUp ? "sign-up-form" : "login-form"}>
              <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>

              {apiError && (
                <div className="error-message">
                  {apiError}
                </div>
              )}

              {isSignUp && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={isLoading ? 'loading' : ''}
              >
                {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignUp;