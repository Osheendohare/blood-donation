import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../App.css'; // Custom animation styles

export default function Suggestions() {
  const { id } = useParams();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');

  // 1. Define the API Base URL dynamically
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      let lat = null;
      let lon = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch (err) {
          console.warn("Geolocation access denied or unavailable:", err);
        }
      }

      try {
        // 2. Updated to use the dynamic variable
        const res = await axios.get(`${API_BASE_URL}/api/suggestions/${id}/`, {
          params: { latitude: lat, longitude: lon }
        });

        if (!res.data || res.data.length === 0) {
          setMessage('No available donors found nearby or in your ward at the moment.');
        } else {
          setDonors(res.data);
          setFilteredDonors(res.data);
          setMessage('');
        }
      } catch (error) {
        console.error("Suggestion fetch error:", error.response?.data || error.message);
        setMessage(error.response?.data?.error || 'Error fetching suggestions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [id, API_BASE_URL]); // Added API_BASE_URL to dependencies for best practice

  const handleSearch = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);

    const filtered = donors.filter(donor =>
      donor.name.toLowerCase().includes(text) ||
      donor.blood_group.toLowerCase().includes(text) ||
      (donor.ward && donor.ward.toLowerCase().includes(text)) ||
      (donor.mobile && donor.mobile.includes(text))
    );

    setFilteredDonors(filtered);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <div className="input-group w-25">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, blood group, ward, mobile..."
            value={searchText}
            onChange={handleSearch}
          />
          <span className="input-group-text bg-dark text-warning">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>

      <h2 className="text-center mt-2 mb-5 text-white fw-bold">🩸 Suggested Blood Donors 🩸</h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : message ? (
        <div className="alert alert-warning text-center">{message}</div>
      ) : filteredDonors.length === 0 ? (
        <div className="alert alert-info text-center">No donors match your search.</div>
      ) : (
        <div className="row">
          {filteredDonors.map((donor, index) => (
            <div
              key={donor.id}
              className="col-md-6 mb-4 fade-in-card"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className="card bg-dark"
                style={{
                  borderLeft: '10px solid rgb(233, 200, 14)',
                  borderRadius: '1rem',
                  boxShadow: '0 0 10px yellow'
                }}
              >
                <div className="card-body">
                  <h5 className="card-title text-warning text-uppercase fw-bold">
                    {donor.name}
                  </h5>
                  <p className="card-text text-white mb-1">
                    <strong>Blood Group:</strong> {donor.blood_group}
                    {donor.rh && <span> ({donor.rh})</span>}
                  </p>
                  <p className="card-text text-white mb-1"><strong>Ward:</strong> {donor.ward}</p>
                  <p className="card-text text-white mb-1"><strong>Mobile:</strong> {donor.mobile}</p>
                  {donor.distance !== undefined && donor.distance !== null && (
                    <p className="card-text text-white mb-0">
                      <strong>Distance:</strong> {donor.distance} km
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
