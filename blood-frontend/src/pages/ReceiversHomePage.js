import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export default function ReceiverHomePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // 1. Security Check: Redirect if not logged in
  useEffect(() => {
    if (!userId) {
      navigate('/emergency-login');
    }
  }, [userId, navigate]);

  const sectionStyle = {
    backgroundColor: 'rgba(9, 85, 75, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 0 20px rgba(255,255,255,0.15)',
    color: 'white'
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'inherit'
  };

  if (!userId) return null; // Prevent flicker before redirect

  return (
    <div className="container mt-5 mb-5">
      <div className="p-4">
        <h2 className="text-center mb-4 fw-bold text-white">🩸 Receiver HomePage 🩸</h2>
        <h5 className="text-center mb-4 fw-bold text-warning">Welcome! Explore our life-saving services below.</h5>

        {/* Emergency Blood Request - Uses dynamic userId from localStorage */}
        <div className="text-center mb-5" style={{marginTop:'50px', marginBottom:'60px'}}>
          <Link to={`/suggestions/${userId}`} style={linkStyle}>
            <Button 
              style={{
                background:'rgb(18, 20, 128)',
                border:'2px solid white',
                fontWeight:'bolder',
                boxShadow:'0 0 10px white'
              }} 
              size="lg"
            >
              🚨 Emergency Blood Request 🚨
            </Button>
          </Link>
        </div>

        {/* Blood Centres */}
        <section style={sectionStyle}>
          <h5 className="fw-bold text-warning">🏥 Nearest Blood Centres</h5>
          <p>Find blood banks and donation centres near your location.</p>
          <Link to="/nearby-centres" style={linkStyle}>
            <Button variant="outline-light" size="sm">Find Centres</Button>
          </Link>
        </section>

        {/* Appointment Booking */}
        <section style={sectionStyle}>
          <h5 className="fw-bold text-warning">📅 Book an Appointment</h5>
          <p>Choose a centre and schedule your appointment at your convenience.</p>
          <Link to="/emergency-appointment" style={linkStyle}>
            <Button variant="outline-light" size="sm">Book Now</Button>
          </Link>
        </section>

      </div>
    </div>
  );
}
