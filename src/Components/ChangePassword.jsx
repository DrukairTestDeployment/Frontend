import React, { useState, useEffect } from 'react';
import './ChangePassword.css';
import './usersignup.css';
import ChangePasswordLogo from '../Assets/translogo.png';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?~`-])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>/?~`-]{8,}$/;

    if (!passwordRegex.test(password)) {
      Swal.fire({
        title: 'Error!',
        text: "Password must contain at least 8 characters, 1 special character, and 1 uppercase letter",
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: "Passwords do not match",
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      title: "",
      text: "Are you sure you want to reset your password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Reset Password"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const params = new URLSearchParams(location.search);
          const remail = params.get('email');
          const rotp = params.get('otp');
          const response = await axios.post(`http://localhost:4001/api/users/reset-password`, {
            email: remail,
            otp: rotp,
            newPassword: password
          });

          if (response.data.status === "success") {
            navigate('/login');
            Swal.fire({
              title: 'Success!',
              text: 'Password Reset Successfully',
              icon: 'success',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
            })
          }
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error.response?.data || 'Error updating password',
            icon: 'error',
            confirmButtonColor: '#1E306D',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  return (
    <div className="change-password-container">
      <div className="change-password-form">
        <div className="change-left-side">
          <h2 className="change-title">Password Reset</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-password">New Password</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="new-password"
                name="new-password"
                className="change-input"
                placeholder='New Password'
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="signup-password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
              </span>
            </div>

            <label htmlFor="confirm-password">Confirm Password</label>

            <div className='password-container'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                name="confirm-password"
                className="change-input"
                placeholder='Confirm Password'
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="signup-password-toggle" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
              </span>

            </div>

            <button type="submit" className="change-button">Submit</button>
          </form>
        </div>

        <Link to="/" className='change-right-side'>
          <div className="change-logo">
            <img src={ChangePasswordLogo} alt="Logo" />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default ChangePassword;