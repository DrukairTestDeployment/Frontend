import React, { useState, useEffect } from 'react';
import '../Css/Profile.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const SuperProfile = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    contactNo: '',
    address: '',
  });
  const id = Cookies.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://helistaging.drukair.com.bt/api/users/${id}`);
        setUser(response.data.data);
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Error fetching data',
          icon: 'error',
          confirmButtonColor: '#1E306D',
          confirmButtonText: 'OK',
        });
      }
    };

    fetchData();
  }, [id]);

  const logout = async () => {
    try {
      const response = await axios.get(`https://helistaging.drukair.com.bt/api/users/logout`, { withCredentials: true });
      if (response.data.status === "success") {
        Cookies.remove('token', { path: '/' });
        navigate('/login')
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error logging out',
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK',
      });
    }
  }

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`https://helistaging.drukair.com.bt/api/users/${id}`, {
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        address: user.address,
      });
      if (response.data.status === "success") {
        Swal.fire({
          title: 'Success!',
          text: 'User Detail Updated Successfully',
          icon: 'success',
          confirmButtonColor: '#1E306D',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response ? error.response.data.message : 'An error occurred during profile update',
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK',
      });
    }
  }

  const updatePassword = () => {
    if (password.newPassword === password.confirmPassword && password.currentPassword !== password.newPassword) {
      Swal.fire({
        title: "",
        text: "Are you sure you want to update your password?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#1E306D",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Update Password"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.patch(`https://helistaging.drukair.com.bt/api/users/updatepassword/${id}`, {
              currentPassword: password.currentPassword,
              newPassword: password.newPassword
            });
            if (response.data.status === "success") {
              Swal.fire({
                title: 'Success!',
                text: 'Password Updated Successfully',
                icon: 'success',
                confirmButtonColor: '#1E306D',
                confirmButtonText: 'OK'
              });
              logout();
            }
          } catch (error) {
            Swal.fire({
              title: 'Error!',
              text: 'Error updating password',
              icon: 'error',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK',
            });
          }
        }
      });
    } else if (password.currentPassword === password.newPassword) {
      Swal.fire({
        title: 'Error!',
        text: "The new password should be different",
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK',
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: "Passwords don't match",
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK',
      });
    }
  };

  const getInitials = (name) => {
    const trimmedName = name.trim();
    const names = trimmedName.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    } else if (names.length === 1 && names[0].length > 0) {
      return names[0][0].toUpperCase();
    }
    return '';
  };

  return (
    <div className="profile-container">
      <div className="profile-main-content">
        <h1 className="profile-title">
          My Profile
          <span className="profile-underline"></span>
        </h1>

        <div className="profile-box">
          <div className="profile-user-icon-container">
            <div className="profile-initials-wrapper">
              <div className="profile-initials">
                {getInitials(user.name)}
              </div>
            </div>
          </div>

          <hr className="profile-thin-line" />
          <div className="profile-details">
            <h2 className="profile-details-header">Details</h2>

            <div className="profile-field-row">
              <div className="profile-field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                />
              </div>
              <div className="profile-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email"
                />
              </div>
            </div>

            <div className="profile-field-row">
              <div className="profile-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="contactNo"
                  value={user.contactNo}
                  onChange={handleChange}
                  placeholder="Enter Your Phone Number"
                />
              </div>
              <div className="profile-field">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={user.address}
                  onChange={handleChange}
                  placeholder="Enter Your Address"
                />
              </div>
            </div>
            <button className="profile-update-btn" onClick={handleFormSubmit}>Update Profile</button>

            <div className="profile-change-password">
              <Link onClick={togglePopup}>Change Password</Link>
            </div>

            <hr className="profile-thin-line" />
          </div>
        </div>
      </div>
      {isPopupOpen && (
        <div className="profile-popup-overlay">
          <div className="profile-popup">
            <div className='form-title'>Change Password</div>
            <button className="service-modal-close-button" onClick={togglePopup}>
              &times;
            </button>
            <div className="profile-popup-body">
              <div className="password-container">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={password.currentPassword}
                  onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                  placeholder="Enter Current Password"
                />
                <span className="profile-password-toggle" onClick={toggleOldPasswordVisibility}>
                  {showOldPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                </span>
              </div>
              <div className="password-container">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={password.newPassword}
                  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                  placeholder="Enter New Password"
                />
                <span className="profile-password-toggle" onClick={toggleNewPasswordVisibility}>
                  {showNewPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                </span>
              </div>
              <div className="password-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={password.confirmPassword}
                  onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                  placeholder="Enter Confirm Password"
                />
                <span className="profile-password-toggle" onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                </span>
              </div>
              <button className="profile-save-changes-btn" onClick={updatePassword}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperProfile;