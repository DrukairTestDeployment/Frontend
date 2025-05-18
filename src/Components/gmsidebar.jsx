import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    BsGrid1X2Fill, BsPersonCircle,
    BsFillGearFill, BsCalendarCheckFill,
} from 'react-icons/bs';
import logo from "./../Assets/translogo.png";
import './../Pages/Css/super.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function GmSidebar() {
    const [isSidebarOpen] = useState(true);
    const location = useLocation();
    const [user, setUser] = useState();
    const id = Cookies.get('token');

    const isActive = (path) => {
        return location.pathname === path;
    };
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:4001/api/users/${id}`);
                setUser(response.data.data);
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

    return (
        <aside id="superadmin_sidebar" className={isSidebarOpen ? "superadmin-sidebar-responsive" : ""}>
            <div className='superadmin-sidebar-title'>
                <div className='superadmin-sidebar-brand'>
                    <img src={logo} alt="Logo" className='logo_header' />
                </div>
            </div>

            <ul className='superadmin-sidebar-list'>
                <li className={`superadmin-sidebar-list-item ${isActive('/gm-dashboard') ? 'active' : ''}`}>
                    <Link to="/gm-dashboard">
                        <BsGrid1X2Fill className='icon' />Dashboard
                    </Link>
                </li>

                <li className={`superadmin-sidebar-list-item ${isActive('/gm-schedules') ? 'active' : ''}`}>
                    <Link to="/gm-schedules">
                        <BsCalendarCheckFill className='icon' /> Schedules
                    </Link>
                </li>

                <hr className='superadmin-line' />
                <li className={`superadmin-sidebar-list-item ${isActive('/gm-profile') ? 'active' : ''}`}>
                    <Link to="/gm-profile">
                        <BsPersonCircle className='icon' /> {user ? user.name : "Loading..."}
                    </Link>
                </li>
                <li className={`superadmin-sidebar-list-item ${isActive('#') ? 'active' : ''}`}>
                    <Link onClick={logout}>
                        <BsFillGearFill className='icon' /> Log Out
                    </Link>
                </li>
            </ul>
        </aside>
    );
}

export default GmSidebar;
