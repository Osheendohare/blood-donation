// DonationCampsPage.js
import React, { useState } from 'react';
import { Button, Card, Row, Col, Container, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import camps from '../data/CampData';
import '../App.css';
import axios from 'axios';

export default function DonationCampsPage() {
  const [registeredCamps, setRegisteredCamps] = useState([]);

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleRegister = async (camp) => {
    const userId = localStorage.getItem('userId'); 
    if (!userId) {
      alert('❌ User not logged in. Please log in first.');
      return;
    }

    if (registeredCamps.length > 0) {
      alert("⚠️ You are already registered for another camp. Only one registration allowed.");
      return;
    }

    const confirm = window.confirm(`Are you sure you want to register for "${camp.name}" in ${camp.city}?`);
    if (!confirm) return;

    try {
      // 2. Updated to use the dynamic variable
      await axios.post(`${API_BASE_URL}/api/register-camp/`, {
        user_profile: parseInt(userId),
        camp_name: camp.name,
        city: camp.city,
        date: camp.date
      });

      alert("✅ Successfully registered for the camp!");
      setRegisteredCamps([...registeredCamps, camp.id]);
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      alert("❌ Registration failed. Please try again.");
    }
  };

  const renderStatusBadge = (status) => (
    <Badge bg={status === "ongoing" ? "success" : "warning"} className="mb-2 text-capitalize">
      {status}
    </Badge>
  );

  return (
    <Container className="mt-4">
      <h1 className="text-center mt-4 pt-4 text-warning mb-4">🩸 Blood Donation Camps 🩸</h1>

      {["Gwalior", "Jhansi"].map(city => (
        <div key={city} className="mb-5 mt-4 pt-4">
          <h3 className="text-white text-center mb-4">🏙️ {city} 🏙️</h3>
          <Row>
            {camps
              .filter(c => c.city === city)
              .map(camp => (
                <Col md={6} lg={4} key={camp.id} className="mb-4">
                  <Card className="h-100 mt-4 zoom-card text-light"
                    style={{
                      backgroundColor: 'rgba(53, 51, 45, 0.8)',
                      borderRadius: '1rem',
                      boxShadow: '0 0 15px rgb(214, 166, 8)',
                      border: '1px solid rgb(214, 166, 8)',
                      width: '90%',
                      maxWidth: '700px',
                      transition: 'transform 0.3s ease-in-out',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Card.Body>
                      <Card.Title className="fw-bold fs-5">{camp.name}</Card.Title>
                      {renderStatusBadge(camp.status)}
                      <Card.Text className="mt-2">
                        📍 <strong>Location:</strong> {camp.location}<br />
                        📅 <strong>Date:</strong> {camp.date}
                      </Card.Text>
                      <Button
                        variant={registeredCamps.includes(camp.id) ? "secondary" : "danger"}
                        disabled={registeredCamps.includes(camp.id)}
                        onClick={() => handleRegister(camp)}
                      >
                        {registeredCamps.includes(camp.id) ? "Registered" : "Register Now"}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </div>
      ))}
    </Container>
  );
}
