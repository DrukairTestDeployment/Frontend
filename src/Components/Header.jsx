import React, { useState, useEffect } from 'react';
import '../Pages/Css/header.css'; // Import the CSS file
import Logo from "../Assets/logo.png"
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

const Header = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState();
  const id = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:4001/api/users/${id}`);
          if(response.data.data.role.name === "USER"){
            setUser(response.data.data);
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Error fetching data",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      };
  
      fetchData();
    }
  }, [id]);
  

  const logout = () => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.get(`http://localhost:4001/api/users/logout`, { withCredentials: true });
          if (response.data.status === "success") {
            Cookies.remove('token', { path: '/' });
            Swal.fire({
              title: 'Success!',
              text: 'Logout Successful',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
            });
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
    })
  }

  function getInitials(name) {
    const nameArray = name.split(' ').filter(word => word.length > 0);
    const initials = nameArray.map(word => word[0].toUpperCase()).join('');

    return initials;
  }

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <header className="userHeader">
      <div className="header-content-wrapper">
        <Link to="/bookingForm">
          <img src={Logo} alt="Druk Heli Logo" className="header-logo" />
        </Link>
        <Link to="/bookingForm">
          <h1 className="header-title">DrukAir Heli Reservation System</h1>
        </Link>
        {user ?
          <div className="initials-container" onClick={toggleDropdown}>

            <div className="initials-circle">{user ? getInitials(user.name) : "Loading..."}</div>
            <ul className={`dropdown-menu ${isDropdownVisible ? 'show' : ''}`}>
              <Link to="/profile">
                <li>Profile</li>
              </Link>

              <Link to='/UserBookings'>
                <li>My Bookings</li>
              </Link>

              <Link onClick={logout}>
                <li>Logout</li>
              </Link>
            </ul>
          </div>
          :
          <div className="initials-container header-button-container">
            <Link to={"/register"} className='headerButtons'>Signup</Link>
            <Link to={"/login"} className='headerButtons'>Login</Link>
          </div>
        }
      </div>
    </header>
  );
};

export default Header;

