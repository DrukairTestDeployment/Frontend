import React, { useState, useEffect } from 'react';
import './usersignup.css';
import SignupLogo from '../Assets/translogo.png';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

function UserSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    contactNo: '',
    password: '',
    confirmPassword: ''
  });
  const [role, setRole] = useState();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://helistaging.drukair.com.bt/api/roles');
        const userRole = response.data.data.find(role => role.name === 'USER');
        if (userRole) {
          setRole(userRole._id);
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Error fetching data',
          icon: 'error',
          showConfirmButton: false,
          timer: 1500
        });
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    const nameRegex = /^[A-Za-z\s]{3,50}$/;
    const contactRegex = /^(17|77|16)\d{6}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>\/?~`-])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>\/?~`-]{8,}$/;

    if (!nameRegex.test(formData.name)) {
      setError("Name should only contain letters and be 3-50 characters long.");
      return false;
    }

    if (!contactRegex.test(formData.contactNo)) {
      setError("Contact number must start with 17, 77 or 16 and be 8 digits long.");
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long, with one uppercase letter, one number, and one special character.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const response = await axios.post('https://helistaging.drukair.com.bt/api/users/register', {
          name: formData.name,
          email: formData.email,
          contactNo: formData.contactNo,
          password: formData.password,
          address: formData.address,
          role: role,
          status: "Active",
          rDate: new Date().toLocaleDateString()
        });

        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Registration Successful!',
            text: `A verification OTP has been sent to ${formData.email}. Please check your email to verify your account.`,
            icon: 'success',
            showConfirmButton: false,
            timer: 3000,
          });

          setTimeout(() => {
            navigate('/otpEmail', { state: { email: formData.email } });
          }, 3000);
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response ? error.response.data : 'An error occurred during registration',
          icon: 'error',
          confirmButtonColor: '#1E306D',
          confirmButtonText: 'OK'
        });
      }
      setError('');
    } else {
      Swal.fire({
        title: 'Error!',
        text: error,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1E306D',
      });
    }
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="user-signup-page">
      <div className="user-signup-container">
        <div className="user-signup-form">
          <div className="user-left-side">
            <h2 className="user-signup-title">Register</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name" className="user-label">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="user-signup-input"
                placeholder='Name'
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email" className="user-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="user-signup-input"
                placeholder='Example@gmail.com'
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="email" className="user-label">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                className="user-signup-input"
                placeholder='Address'
                value={formData.address}
                onChange={handleChange}
                required
              />

              <label htmlFor="contact" className="user-label">Contact Number</label>
              <input
                type="tel"
                id="contact"
                name="contactNo"
                className="user-signup-input"
                placeholder='eg.17345678'
                value={formData.contactNo}
                onChange={handleChange}
                required
              />

              <label htmlFor="password" className="user-label">Password</label>
              <div className="password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="user-signup-input"
                  placeholder='********'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span className="signup-password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                </span>
              </div>

              <label htmlFor="confirm-password" className="user-label">Confirm Password</label>
              <div className="password-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirmPassword"
                  className="user-signup-input"
                  placeholder='********'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span className="signup-password-toggle" onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                </span>
              </div>

              <button type="submit" className="user-signup-button">Register</button>
              <p className="user-login-text">Already have an account? <a href="/login" className="user-login-link">Login</a></p>
            </form>
          </div>
          <Link to={"/"} className='change-right-side'>
            <div className="change-logo">
              <img src={SignupLogo} alt="Logo" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserSignup;