import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHelicopter } from 'react-icons/fa';
import {
    BsGrid1X2Fill, BsFillBookmarkFill, BsFillPinMapFill, BsPersonCircle,
    BsListCheck, BsFillGearFill, BsArrowLeftCircleFill,
    BsCashStack, BsFillPersonFill, BsCalendarCheckFill,
} from 'react-icons/bs';
import logo from "./../Assets/translogo.png";
import './../Pages/Css/admin.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function AdminSidebar() {
    const [isSidebarOpen] = useState(true);
    const [user, setUser] = useState();
    const location = useLocation();
    const id = Cookies.get('token');

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:4001/api/users/${id}`,{
                    withCredentials:true
                });
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
        <aside id="admin_sidebar" className={isSidebarOpen ? "sidebar-responsive" : ""}>
            <div className='sidebar-title'>
                <div className='sidebar-brand'>
                    <img src={logo} alt="Logo" className='logo_header' />
                </div>
            </div>

            <ul className='sidebar-list'>
                <li className={`sidebar-list-item ${isActive('/admin-dashboard') ? 'active' : ''}`}>
                    <Link to="/admin-dashboard">
                        <BsGrid1X2Fill className='icon' /> Dashboard
                    </Link>
                </li>

                <li className={`sidebar-list-item ${isActive('/admin-Bookings') ? 'active' : ''}`}>
                    <Link to="/admin-Bookings">
                        <BsFillBookmarkFill className='icon' /> Bookings
                    </Link>
                </li>
                <li className={`sidebar-list-item ${isActive('/admin-Schedule') ? 'active' : ''}`}>
                    <Link to="/admin-Schedule">
                        <BsCalendarCheckFill className='icon' /> Schedules
                    </Link>
                </li>
                <li className={`sidebar-list-item ${isActive('/services') ? 'active' : ''}`}>
                    <Link to="services">
                        <FaHelicopter className='icon' /> Services
                    </Link>
                </li>
                <li className={`sidebar-list-item ${isActive('/charter') ? 'active' : ''}`}>
                    <Link to="/charter">
                        <BsListCheck className='icon' /> Charter
                    </Link>
                </li>
                <li className={`sidebar-list-item ${isActive('/routes') ? 'active' : ''}`}>
                    <Link to="/routes">
                        <BsFillPinMapFill className='icon' /> Routes
                    </Link>
                </li>
                <li className={`sidebar-list-item ${isActive('/admin-user') ? 'active' : ''}`}>
                    <Link to="/admin-user">
                        <BsFillPersonFill className='icon' /> Users
                    </Link>
                </li>
                <li className={`sidebar-list-item ${isActive('/refund') ? 'active' : ''}`}>
                    <Link to="/refund">
                        <BsArrowLeftCircleFill className='icon' /> Refunds
                    </Link>
                </li>
                {/* <li className={`sidebar-list-item ${isActive('/admin-feedback') ? 'active' : ''}`}>
                    <Link to="/admin-feedback">
                        <BsChatSquareTextFill className='icon' /> Feedbacks
                    </Link>
                </li> */}
                <li className={`sidebar-list-item ${isActive('/revenue') ? 'active' : ''}`}>
                    <Link to="/revenue">
                        <BsCashStack className='icon' /> Revenue
                    </Link>
                </li>
                <hr className='line' />
                <li className={`sidebar-list-item ${isActive('/admin-profile') ? 'active' : ''}`}>
                    <Link to="/admin-profile">
                        <BsPersonCircle className='icon' /> {user ? user.name : "Loading..."}
                    </Link>
                </li>
                <li className={`sidebar-list-item ${isActive('#') ? 'active' : ''}`}>
                    <Link onClick={logout}>
                        <BsFillGearFill className='icon' /> Log Out
                    </Link>
                </li>
            </ul>
        </aside>
    );
}

export default AdminSidebar;