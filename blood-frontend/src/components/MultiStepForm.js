import React, { useState } from 'react';
import Step1BasicDetails from './Step1BasicDetails';
import Step2BloodDetails from './Step2BloodDetails';
import Step3AddressDetails from './Step3AddressDetails';
import Step4Password from './Step4Password';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    gender: '',
    age: '',
    mobile: '',
    blood_group: '',
    rh:'',
    role: 'donor',
    availability: true,
    address:'',
    muhalla: '',
    location:'',
    y:'Y',
    ward: '',
    district: '',
    state: '',
    country: '',
    pincode: '',
    password: '',
    occupation:'',
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. Updated to use the dynamic variable
      const res = await axios.post(`${API_BASE_URL}/api/register/`, formData);
      alert('Registered! ID: ' + res.data.id);
      navigate(`/login`);
    } catch (err) {
      console.error("API Error:", err);
      alert('Registration failed: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="container mt-4 p-4" style={{
          backgroundColor: 'rgba(82, 4, 82, 0.62)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '700px',
          color: 'white',
          borderRadius:'1rem',
          boxShadow: '0 0 30px rgb(100, 4, 92)'
        }} >
      <h2 className="text-white fw-bold text-center mb-4">🩸 REGISTER 🩸</h2>
      <h5 style={{color:'aquamarine',fontSize:'1.6rem',textDecoration:'underline'}}>Step {step} of 4</h5>
      
      {step === 1 && <Step1BasicDetails data={formData} onChange={handleChange} onNext={handleNext} />}
      {step === 2 && <Step2BloodDetails data={formData} onChange={handleChange} onNext={handleNext} onPrev={handlePrev} />}
      {step === 3 && <Step3AddressDetails data={formData} onChange={handleChange} onNext={handleNext} onPrev={handlePrev} />}
      {step === 4 && <Step4Password data={formData} onChange={handleChange} onPrev={handlePrev} onSubmit={handleSubmit} />}
      
      <p className="mt-3 text-center">
        BACK TO LOGIN? <Link to="/login" className="text-warning text-decoration-underline">Login here</Link>
      </p>
    </div>
  );
}
