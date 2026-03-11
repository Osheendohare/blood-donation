import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EmergencyRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',            // renamed from 'contact' to 'mobile'
    blood_group: '',
    ward: '',
    password: '',
    confirmPassword: '',
  });

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      alert("❌ Password must be at least 6 characters.");
      return;
    }

    const payload = { ...formData };
    // delete payload.confirmPassword;

    try {
      // 2. Updated to use the dynamic variable
      const res = await axios.post(`${API_BASE_URL}/api/emergency-register/`, payload);
      alert('🚨 Emergency request submitted successfully!');
      navigate(`/emergency-login`);
      console.log('Response:', res.data);
    } catch (error) {
      const msg = error.response?.data?.error || '❌ Submission failed.';
      alert(msg);
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div
        className="p-4"
        style={{
          backgroundColor: 'rgba(82, 4, 82, 0.62)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '500px',
          color: 'white',
          borderRadius: '1rem',
          boxShadow: '0 0 30px rgb(100, 4, 92)'
        }}
      >
        <h3 className="text-white fw-bold text-center mb-4">🩸 Emergency Blood Request 🩸</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name :</label>
            <input
              name="name"
              className="form-control"
              required
              value={formData.name}
              placeholder="name"
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mobile Number :</label>
            <input
              name="mobile"
              className="form-control"
              required
              value={formData.mobile}
              placeholder="mobile number"
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Blood Group :</label>
            <select
              name="blood_group"
              className="form-select"
              required
              value={formData.blood_group}
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            >
              <option value="">Select</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Ward :</label>
            <input
              name="ward"
              className="form-control"
              required
              value={formData.ward}
              placeholder="ward"
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Create Password :</label>
            <input
              type="password"
              name="password"
              className="form-control"
              required
              placeholder="create password"
              value={formData.password}
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password :</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              required
              placeholder="confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            />
          </div>
          <button className="btn btn-danger w-100 fw-bold mt-4" type="submit">
            Submit Emergency Request
          </button>
        </form>

        <p className="mt-4 text-center">
          BACK TO LOGIN?{' '}
          <Link to="/emergency-login" className="text-warning text-decoration-underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
