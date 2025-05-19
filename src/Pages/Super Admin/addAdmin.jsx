import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../Css/add.css";
import Swal from 'sweetalert2';
import axios from "axios";
import { IoMdAddCircleOutline } from "react-icons/io";
import { BsEye, BsEyeSlash } from 'react-icons/bs';


const AdminTable = () => {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmin] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [role, setRole] = useState();
    const [newAdmin, setNewAdmin] = useState({
        name: "",
        contactNumber: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
        status: "Active",
        recruitmentDate: new Date().toLocaleDateString()
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const response = await axios.get('https://helistaging.drukair.com.bt/api/users');
                const admins = response.data.data.filter(user => user.role.name === 'ADMIN');
                setAdmins(Array.isArray(admins) ? admins : []);
                setFilteredAdmin(Array.isArray(admins) ? admins : []);
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

        fetchAdmin();
    }, [newAdmin]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://helistaging.drukair.com.bt/api/roles');
                const userRole = response.data.data.find(role => role.name === 'ADMIN');
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

    useEffect(() => {
        const filtered = admins.filter((admin) =>
            Object.values(admin).some(
                (value) =>
                    typeof value === "string" &&
                    value.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredAdmin(filtered);
        setCurrentPage(1);
    }, [searchTerm, admins]);

    const indexOfLastAdmin = currentPage * itemsPerPage;
    const indexOfFirstAdmin = indexOfLastAdmin - itemsPerPage;
    const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);

    const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddAdmin = () => {
        setShowAddForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin({ ...newAdmin, [name]: value });
    };

    const contactRegex = /^(17|77)\d{6}$/;

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!contactRegex.test(newAdmin.contactNumber)) {
            Swal.fire("Error", "Contact number must start with 17 or 77 and be 8 digits long.", "error");
        }else if (newAdmin.password !== newAdmin.confirmPassword) {
            Swal.fire("Error", "Passwords do not match!", "error");
        }else {
            try {
                const response = await axios.post('https://helistaging.drukair.com.bt/api/users/register', {
                    name: newAdmin.name,
                    email: newAdmin.email,
                    contactNo: newAdmin.contactNumber,
                    password: newAdmin.password,
                    address: newAdmin.address,
                    role: role,
                    rDate: newAdmin.recruitmentDate,
                    status: newAdmin.status
                });
                if (response.data.status === 'success') {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Registration Successful!',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                    })
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response ? error.response.data.message : 'An error occurred during registration',
                    icon: 'error',
                    confirmButtonColor: '#1E306D',
                    confirmButtonText: 'OK'
                });
            }
            setAdmins([...admins, { ...newAdmin, id: admins.length + 1 }]);
            setShowAddForm(false);
            setNewAdmin({
                name: "",
                contactNumber: "",
                email: "",
                address: "",
                password: "",
                confirmPassword: "",
                status: "Active",
                recruitmentDate: new Date().toLocaleDateString(),
            });
        }
    };

    const closeModal = () => {
        setShowAddForm(false);
    };

    const deactivateUser = (uid) => {
        Swal.fire({
            title: "",
            text: "Are you sure you want to disable this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1E306D",
            confirmButtonText: "Yes, disable it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.patch(`https://helistaging.drukair.com.bt/api/users/${uid}`, {
                        status: "Inactive",
                    });
                    if (response.data.status === "success") {
                        Swal.fire({
                            title: 'Success!',
                            text: 'User Disabled Successfully',
                            icon: 'success',
                            confirmButtonColor: '#1E306D',
                            confirmButtonText: 'OK'
                        });
                    }
                    setNewAdmin({
                        name: "",
                        contactNumber: "",
                        email: "",
                        address: "",
                        password: "",
                        confirmPassword: "",
                        status: "Active",
                        recruitmentDate: new Date().toLocaleDateString(),
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Error updating data',
                        icon: 'error',
                        confirmButtonColor: '#1E306D',
                        confirmButtonText: 'OK',
                    });
                }
            }
        });
    };
    const activateUser = (uid) => {
        Swal.fire({
            title: "",
            text: "Are you sure you want to activate this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1E306D",
            confirmButtonText: "Yes, activate it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.patch(`https://helistaging.drukair.com.bt/api/users/${uid}`, {
                        status: "Active"
                    });
                    if (response.data.status === "success") {
                        Swal.fire({
                            title: 'Success!',
                            text: 'User Activated Successfully',
                            icon: 'success',
                            confirmButtonColor: '#1E306D',
                            confirmButtonText: 'OK'
                        });
                    }
                    setNewAdmin({
                        name: "",
                        contactNumber: "",
                        email: "",
                        address: "",
                        password: "",
                        confirmPassword: "",
                        status: "Active",
                        recruitmentDate: new Date().toLocaleDateString(),
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Error updating data',
                        icon: 'error',
                        confirmButtonColor: '#1E306D',
                        confirmButtonText: 'OK',
                    });
                }
            }
        });
    }

    return (
        <main className="admin-add-container">
            <div className="admin-table-container">
                <h2 className="admin-table-title">Admin Table</h2>

                <div className="admin-table-controls">
                    <div className="admin-left-controls">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="admin-search-bar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="admin-right-controls">
                        <button className="admin-add-button" onClick={handleAddAdmin}>
                            Add Admin  <IoMdAddCircleOutline size={15} background='#22326E' />

                        </button>
                    </div>
                </div>

                {/* Modal for adding admin */}
                {showAddForm && (
                    <div className="modal-overlay">
                        <div className="super-modal-content">
                            <span className="modal-close-button" onClick={closeModal}>
                                &times;
                            </span>
                            <div className='form-title'>Admin Form</div>

                            <form className="admin-form" onSubmit={handleFormSubmit}>
                                <div className="popup-title">Details</div>
                                <div className="form-columns">
                                    <div className="form-column-left">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={newAdmin.name}
                                                onChange={handleFormChange}
                                                placeholder="Name"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="text"
                                                name="contactNumber"
                                                value={newAdmin.contactNumber}
                                                onChange={handleFormChange}
                                                placeholder="Phone Number"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <div className="password-container">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={newAdmin.password}
                                                    onChange={handleFormChange}
                                                    placeholder="Password"
                                                    required
                                                />
                                                <span className="admin-add-password-toggle" onClick={togglePasswordVisibility}>
                                                    {showPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                                                </span>
                                            </div>
                                        </div>


                                    </div>

                                    <div className="form-column-right">
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="example@gmail.com"
                                                value={newAdmin.email}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={newAdmin.address}
                                                onChange={handleFormChange}
                                                placeholder="Address"
                                                required
                                            />
                                        </div>



                                        <div className="form-group">
                                            <label>Confirm Password</label>
                                            <div className="password-container">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={newAdmin.confirmPassword}
                                                    onChange={handleFormChange}
                                                    placeholder="Confirm Password"
                                                    required
                                                />
                                                <span className="admin-add-password-toggle" onClick={toggleConfirmPasswordVisibility}>
                                                    {showConfirmPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="admin-submit-button">
                                    Add
                                </button>
                            </form>
                            <hr className="divider" />
                        </div>
                    </div>
                )}

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Sl. No</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Recruitment Date</th>
                            <th>Contact Number</th>
                            <th>Address</th>
                            <th>Email Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAdmins.map((admin, index) => (
                            <tr key={admin._id}>
                                <td>{indexOfFirstAdmin + index + 1}</td>
                                <td>{admin.name}</td>
                                <td>{admin.status}</td>
                                <td>{admin.rDate}</td>
                                <td>{admin.contactNo}</td>
                                <td>{admin.address}</td>
                                <td>{admin.email}</td>
                                <td className="admin-action-icons">
                                    {admin.status === "Active" ? (
                                        <button className="admin-delete-button" onClick={() => deactivateUser(admin._id)}>
                                            <FiXCircle size={20} />
                                        </button>
                                    ) : (
                                        <button className="admin-edit-button" onClick={() => activateUser(admin._id)}>
                                            <FiCheckCircle size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="admin-pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            {"<"}
                        </button>
                        {[...Array(totalPages)].map((_, pageIndex) => (
                            <button
                                key={pageIndex + 1}
                                onClick={() => handlePageChange(pageIndex + 1)}
                                className={currentPage === pageIndex + 1 ? "active-page" : ""}
                            >
                                {pageIndex + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            {">"}
                        </button>
                    </div>
                )}

                <p className="admin-results-count">{admins.length} Results</p>
            </div>
        </main>
    );
};

export default AdminTable;
