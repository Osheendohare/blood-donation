import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function HealthEligibilityForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    donatedRecently: '',
    onMedication: '',
    medicationDetails: '',
    chronicDisease: '', // Fixed key name consistency
    recentFever: '',
    underageOrUnderweight: '',
    consent: false,
  });

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check consent
    if (!formData.consent) {
      alert('❌ You must confirm your consent to proceed.');
      return;
    }

    // Eligibility conditions
    if (formData.donatedRecently === 'yes') {
      alert('❌ You are not eligible to donate blood now because you have donated within the past 3 months.');
      return;
    }

    if (formData.onMedication === 'yes') {
      alert('❌ You are currently on medication, so you are not eligible to donate blood now.');
      return;
    }

    if (formData.chronicDisease === 'yes') {
      alert('❌ You have chronic disease, so you are not eligible to donate blood now.');
      return;
    }

    if (formData.recentFever === 'yes') {
      alert('❌ You had a fever or infection recently. Please wait at least 14 days to donate blood.');
      return;
    }

    if (formData.underageOrUnderweight === 'yes') {
      alert('❌ You must be at least 18 years old and meet minimum weight requirements to donate blood.');
      return;
    }

    // Passed all checks
    try {
      console.log('Submitted Health Info:', formData);
      // 2. Updated to use the dynamic variable
      await axios.post(`${API_BASE_URL}/api/donor-health-form/`, formData);
      alert('✅ Health and eligibility info submitted successfully!');
      navigate(`/donor-homepage`);
    } catch (err) {
      console.error("Submission error:", err);
      alert('❌ Error submitting health form. Please try again.');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div
        className="p-4"
        style={{
          backgroundColor: 'rgba(11, 122, 80, 0.62)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '600px',
          color: 'white',
          borderRadius: '1rem',
          boxShadow: '0 0 30px rgb(11, 128, 60)',
        }}
      >
        <h3 className="text-white fw-bold text-center mb-4">🩺 Health & Eligibility Form 🩺</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Have you donated blood in the past 3 months?</label>
            <select
              name="donatedRecently"
              className="form-select"
              required
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Are you currently on any medication?</label>
            <select
              name="onMedication"
              className="form-select"
              required
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {formData.onMedication === 'yes' && (
            <div className="mb-3">
              <label>If yes, specify:</label>
              <input
                type="text"
                className="form-control"
                name="medicationDetails"
                onChange={handleChange}
                style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
              />
            </div>
          )}

          <div className="mb-3">
            <label>Any chronic diseases or conditions?</label>
            <select
              name="chronicDisease"
              className="form-select"
              required
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          {formData.chronicDisease === 'yes' && (
            <div className="mb-3">
              <label>If yes, specify:</label>
              <input
                type="text"
                className="form-control"
                name="chronicDetails"
                onChange={handleChange}
                style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
              />
            </div>
          )}

          <div className="mb-3">
            <label>Had a fever, infection, or vaccination recently? (last 14 days)</label>
            <select
              name="recentFever"
              className="form-select"
              required
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Are you underweight or under 18 years old?</label>
            <select
              name="underageOrUnderweight"
              className="form-select"
              required
              onChange={handleChange}
              style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="form-check mb-3 mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              name="consent"
              onChange={handleChange}
              id="consentCheck"
            />
            <label className="form-check-label" htmlFor="consentCheck">
              I confirm the above details are accurate and I'm willing to donate blood in an emergency.
            </label>
          </div>

          <button className=" w-100 fw-bold mt-3" type="submit" style={{background:'rgb(151, 149, 14)',color:'white',borderRadius:'0.5rem', boxShadow:'0 0 10px rgb(151, 149, 14)', border:'1px solid white'}}>
            Submit Health Info
          </button>
        </form>
      </div>
    </div>
  );
}
