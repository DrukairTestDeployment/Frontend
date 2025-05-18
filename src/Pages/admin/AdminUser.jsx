import React, { useState, useEffect } from 'react';
import { FiXCircle, FiCheckCircle } from "react-icons/fi";
import "./../Css/adminBookings.css";
import AdminHeader from '../../Components/adminheader';
import "./../Css/serviceModel.css";
import { IoMdAddCircleOutline } from "react-icons/io";
import axios from 'axios';
import Swal from 'sweetalert2';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import Cookies from 'js-cookie';

function AdminUser() {
  const token = Cookies.get('jwt');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [newUsers, setNewUsers] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    password: "",
    confirmPassword: "",
    status: "Active",
    recruitmentDate: new Date().toLocaleDateString(),
    role: ""
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
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
        },
            withCredentials: true
        });
        setUsers(Array.isArray(response.data.data) ? response.data.data : []);
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
  }, [newUsers, token]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/roles');
        setRoles(Array.isArray(response.data.data) ? response.data.data : []);
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

    fetchRoles();
  }, []);

  const handleAddUser = () => {
    setShowAddForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUsers({ ...newUsers, [name]: value });
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { name, email, contact, address, password, confirmPassword, role } = newUsers;

    // Check if all fields are filled
    const requiredFields = { name, email, contact, address, password, confirmPassword, role };
    const emptyFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);

    if (emptyFields.length > 0) {
      Swal.fire({
        title: "Error",
        text: `Please fill out the following fields: ${emptyFields.join(', ')}`,
        icon: "error",
      });
      return;
    }

    const contactRegex = /^(17|77|16)\d{6}$/;
    if (!contactRegex.test(contact)) {
      Swal.fire({
        title: "Error",
        text: "Contact number must start with 17, 77 or 16 and be exactly 8 digits!",
        icon: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        title: "Error",
        text: "Passwords do not match!",
        icon: "error",
      });
      return;
    }

    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>\/?~`-])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>\/?~`-]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      Swal.fire({
        title: "Error",
        text: "Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character.",
        icon: "error",
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:4001/api/users/register', {
        name: newUsers.name,
        email: newUsers.email,
        contactNo: newUsers.contact,
        password: newUsers.password,
        address: newUsers.address,
        role: newUsers.role,
        rDate: newUsers.recruitmentDate,
        status: newUsers.status
      });
      if (response.data.status === "success") {
        Swal.fire({
          title: 'Success!',
          text: 'User Added Successfully',
          icon: 'success',
          confirmButtonColor: '#1E306D',
          confirmButtonText: 'OK'
        });
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

    setUsers([...users, { ...newUsers, id: users.length + 1 }]);
    setShowAddForm(false);
    setNewUsers({
      name: "",
      email: "",
      contact: "",
      address: "",
      password: "",
      confirmPassword: "",
      status: "Active",
      recruitmentDate: new Date().toLocaleDateString(),
      role: ""
    });
  };

  const closeModal = () => {
    setShowAddForm(false);
  };

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === "ALL" || user.role.name === selectedRole;

      return matchesSearch && matchesRole;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, selectedRole]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteUser = (uid) => {
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
          const response = await axios.patch(`http://localhost:4001/api/users/${uid}`, {
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
          setNewUsers({
            name: "",
            email: "",
            contact: "",
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

  const activeUser = (uid) => {
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
          const response = await axios.patch(`http://localhost:4001/api/users/${uid}`, {
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
          setNewUsers({
            name: "",
            email: "",
            contact: "",
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

  return (
    <main className="admin-table-container">
      <div className='admin-title'>
        <AdminHeader title="Users" />
      </div>
      <div className="booking-table-container">
        <div className="booking-table-controls">
          <div className="booking-left-controls">
            <input
              type="text"
              placeholder="Search by Name or Email..."
              className="booking-search-bar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="booking-right-controls">
            <select
              className="booking-filter-select"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="ALL">All Roles</option>
              {roles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            <button className="booking-add-button" onClick={handleAddUser}>
              Add User
              <IoMdAddCircleOutline size={20} background='#22326E' />
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className='form-title'>User Form</div>

              <form className="service-admin-form" onSubmit={handleFormSubmit}>
                <div className='popup-title '>Details</div>
                <div className="service-form-columns">
                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newUsers.name}
                        onChange={handleFormChange}
                        placeholder='Name'
                        required
                      />
                    </div>
                    <div className="service-form-group">
                      <label>Contact Number</label>
                      <input
                        type="number"
                        name="contact"
                        value={newUsers.contact}
                        onChange={handleFormChange}
                        placeholder='Contact Number'
                        required
                      />
                    </div>
                    <div className="service-form-group">
                      <label>Password</label>
                      <div className="password-container">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={newUsers.password}
                          onChange={handleFormChange}
                          placeholder='########'
                          required
                        />
                        <span className="admin-password-toggle" onClick={togglePasswordVisibility}>
                          {showPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                        </span>
                      </div>
                    </div>
                    <div className="service-form-group">
                      <label>Role</label>
                      <select className='userdropdown'
                        name="role"
                        value={newUsers.role}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Select Role</option>
                        {roles.filter(
                          (role) => role.name !== "ADMIN" && role.name !== "SUPER ADMIN" && role.name !== "USER"
                        )
                          .map((role) => (
                            <option key={role._id} value={role._id}>
                              {role.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="service-form-column-right">
                    <div className="service-form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newUsers.email}
                        onChange={handleFormChange}
                        placeholder='Email'
                        required
                      />
                    </div>
                    <div className="service-form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={newUsers.address}
                        onChange={handleFormChange}
                        placeholder='Address'
                        required
                      />
                    </div>
                    <div className="service-form-group">
                      <label>Confirm Password</label>
                      <div className="password-container">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={newUsers.confirmPassword}
                          onChange={handleFormChange}
                          placeholder='########'
                          required
                        />
                        <span className="admin-password-toggle" onClick={toggleConfirmPasswordVisibility}>
                          {showConfirmPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="service-modal-footer">
                  <button className="admin-submit-button" type="submit">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table className="booking-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.contactNo}</td>
                <td>{user.address}</td>
                <td>{user.role.name}</td>
                <td>{user.role.name === "USER" && user.otpVerified === false ? 'False' : 'True'}</td>
                <td>{user.status}</td>
                <td>
                  {user.status === "Active" ? (
                    <FiXCircle
                      size={20}
                      color="red"
                      style={{ cursor: 'pointer' }}
                      onClick={() => deleteUser(user._id)}
                    />
                  ) : (
                    <FiCheckCircle
                      size={20}
                      color="green"
                      style={{ cursor: 'pointer' }}
                      onClick={() => activeUser(user._id)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

       
        {totalPages > 1 && (
          <div className="booking-pagination">
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
        <p className="booking-results-count">{users.length} Results</p>
      </div>
    </main>
  );
}

export default AdminUser;