// src/pages/ContactPage.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import '../App.css';
import axios from 'axios';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', mobile: '', message: '' }); // Fixed initial state to include mobile
  const [submitted, setSubmitted] = useState(false);

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. Updated to use the dynamic variable
      await axios.post(`${API_BASE_URL}/api/contact/`, {
        name: form.name,
        mobile: form.mobile,
        message: form.message
      });

      setSubmitted(true);
      setForm({ name: '', mobile: '', message: '' });
    } catch (err) {
      alert("❌ Failed to send message. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="contact-page py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <h1 className="text-center text-warning mb-4">📞 Contact Us 📞</h1>

            {submitted && (
              <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
                ✅ Message sent successfully! We'll get back to you soon.
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="p-4 mt-4" style={{
              backgroundColor: 'rgba(54, 4, 54, 0.62)',
              backdropFilter: 'blur(10px)',
              width: '100%',
              maxWidth: '1000px',
              color: 'white',
              borderRadius: '1rem',
              boxShadow: '0 0 30px rgb(65, 5, 60)',
              marginTop: '60px'
            }}>
              <Form.Group className="mb-3">
                <Form.Label>Your Name :</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Your Contact :</Form.Label>
                <Form.Control
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter your contact no."
                  required
                  style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Your Message</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Type your message here"
                  required
                  style={{ background: 'wheat', border: '2px solid rgb(100, 4, 92)' }}
                />
              </Form.Group>

              <div className="text-center">
                <Button type="submit" className="btn btn-danger w-100">
                  Send Message
                </Button>
              </div>
            </Form>

            {/* Contact Info Box */}
            <Container className=" pt-2 pb-4 mb-4" style={{
              background: 'linear-gradient(135deg, rgba(61, 173, 177, 0.44) 0%, rgba(4, 52, 80, 0.45) 100%)',
              borderRadius: '2rem',
              boxShadow: '0 0 15px rgb(4, 49, 63)',
              width: '1000px',
              maxWidth: '100%',
              marginTop: '80px'
            }}>
              <h2 style={{
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bolder',
                paddingTop: '20px',
                paddingBottom: '10px'
              }}>
                OUR DETAILS
              </h2>

              <Card className="p-4 shadow-lg" style={{ borderRadius: '1rem', backgroundColor: 'rgba(10, 121, 106, 0.342)', color: 'white' }}>
                <Row>
                  <Col md={4} className="mb-3">
                    <h5 className='text-warning fw-bold'>📍 Address</h5>
                    <p>123 ABC Road, Gwl (M.P.) 474012</p>
                  </Col>
                  <Col md={4} className="mb-3">
                    <h5 className='text-warning fw-bold'>📞 Phone</h5>
                    <p>+91 8109xxxxxx</p>
                  </Col>
                  <Col md={4}>
                    <h5 className='text-warning fw-bold'>📧 Email</h5>
                    <p>osheendohareABC@gmail.com</p>
                  </Col>
                </Row>
              </Card>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
