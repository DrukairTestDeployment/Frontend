import React, { useState } from 'react';
import './ForgotPassword.css';
import ForgotPasswordLogo from '../Assets/translogo.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HelicopterLoader from './HelicopterLoader';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      Swal.fire({
        title: 'Error!',
        text: 'Email is required.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1E306D',
      });
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Incorrect email ID');
      Swal.fire({
        title: 'Error!',
        text: 'Please enter a valid email address.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1E306D',
      });
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post('https://helistaging.drukair.com.bt/api/users/send-otp', {
        email: email
      });

      if (response.data.status === "OTP sent successfully") {
        Swal.fire({
          title: 'Success!',
          text: 'An OTP has been sent to your email.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1E306D',
        }).then(() => {
          navigate(`/otp?email=${encodeURIComponent(email)}`);
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data || 'An error occurred. Please try again later.';

      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1E306D',
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (loading) {
    return <HelicopterLoader />;
  }


  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <div className="forgot-left-side">
          <h2 className="forgot-title">Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`forgot-input ${emailError ? 'error' : ''}`}
              placeholder='Email'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />

            <button type="submit" className="forgot-button" onClick={handleSubmit}>Send OTP</button>
          </form>
        </div>
        <Link to={"/"} className='change-right-side'>
          <div className="change-logo">
            <img src={ForgotPasswordLogo} alt="Logo" />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
