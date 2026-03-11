import React, { useState } from 'react';
import centers from '../data/bloodCenters';
import axios from 'axios';

export default function BookAppointment() {
  const [date, setDate] = useState('');
  const [center, setCenter] = useState('');
  const [message, setMessage] = useState('');

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const centerList = Object.values(centers).flat().map(c => `${c.name} – ${c.address}`);

  const handleBooking = async () => {
    if (!date || !center) {
      setMessage('❌ Please select both date and center.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('❌ User not logged in. Please log in first.');
      return;
    }

    const [name, address] = center.split(' – ');

    try {
      // 2. Updated first axios call
      const res = await axios.get(`${API_BASE_URL}/api/centers/`);
      const matched = res.data.find(c => c.name === name && c.address === address);

      if (!matched) {
        setMessage('❌ Selected center not found in database.');
        return;
      }

      // 3. Updated second axios call
      await axios.post(`${API_BASE_URL}/api/book-appointment/`, {
        user_profile: parseInt(userId),
        center: matched.id,
        date,
      });

      setMessage(`✅ Appointment booked for ${date} at ${center}`);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error booking appointment.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div
        className="p-5 w-100"
        style={{
          maxWidth: '600px',
          backgroundColor: 'rgba(67, 169, 216, 0.25)',
          borderRadius: '1rem',
          boxShadow: '0 0 25px rgb(65, 4, 100)',
          color: 'white',
        }}
      >
        <h3 className="text-center text-warning mb-4 fw-bold">📅 Book a Donation Appointment 📅</h3>

        <div className="mb-3">
          <label className="form-label">Select Blood Centre:</label>
          <select
            value={center}
            onChange={e => setCenter(e.target.value)}
            className="form-select"
            style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
          >
            <option value="">Choose a center</option>
            {centerList.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Choose Date:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="form-control"
            style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
          />
        </div>

        <button onClick={handleBooking} className="btn btn-warning w-100 fw-bold mt-2" style={{ border: '2px solid white', color: 'white', boxShadow: '0 0 5px white' }}>
          Book Now
        </button>

        {message && (
          <div className="mt-4 alert alert-info text-center fw-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
