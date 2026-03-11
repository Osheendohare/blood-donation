import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { mobile, password } = formData;

    if (!mobile || !password) {
      setMessage('Please enter both mobile number and password.');
      return;
    }

    try {
      // 2. Updated to use the dynamic variable
      const res = await axios.post(`${API_BASE_URL}/login/`, {
        mobile: mobile.trim(),
        password,
      });

      const { id } = res.data;

      localStorage.setItem('userId', id);
      alert('Login successful!');
      navigate('/donor-health-form');
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="container mt-5 p-4" style={{
      backgroundColor: 'rgba(82, 4, 82, 0.62)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      maxWidth: '500px',
      color: 'white',
      borderRadius: '1rem',
      boxShadow: '0 0 30px rgb(100, 4, 92)'
    }}>
      <h2 className="text-center text-white mb-4">🔐 Login with Password 🔐</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Mobile Number:</label>
          <input
            type="text"
            name="mobile"
            placeholder="mobile no."
            className="form-control"
            value={formData.mobile}
            onChange={handleChange}
            required
            style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
          />
        </div>

        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            placeholder="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
          />
        </div>

        <button type="submit" className="btn btn-danger w-100">
          Login
        </button>
        <p className="mt-2 text-center">
          <Link to="/forgot-password" className="text-warning text-decoration-underline">
            Forgot Password?
          </Link>
        </p>

      </form>

      <p className="mt-4 text-center">
        New user? <Link to="/register" className="text-warning text-decoration-underline">Register Now</Link>
      </p>
    </div>
  );
}
