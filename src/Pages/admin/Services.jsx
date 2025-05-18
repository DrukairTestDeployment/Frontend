import React, { useState, useEffect } from 'react';
import { FiXCircle } from "react-icons/fi";
import "./../Css/adminBookings.css";
import "./../Css/serviceModel.css";
import AdminHeader from '../../Components/adminheader';
import { IoMdAddCircleOutline } from "react-icons/io";
import axios from 'axios';
import Swal from 'sweetalert2';

function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    service: "",
    priceInUSD: "",
    priceInBTN: "",
    description: ""
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState({
    name: "",
    priceInUSD: "",
    priceInBTN: "",
    description: ""
  });
  const [id, setID] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/services');
        setServices(Array.isArray(response.data.data) ? response.data.data : []);
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
  }, [selectedService]);

  useEffect(() => {
    const result = services.filter(service =>
      Object.values(service).some(
        value => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredServices(result);
    setCurrentPage(1);
  }, [searchTerm, services]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddService = () => {
    setShowAddForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setShowAddForm(false);
    setNewService({
      service: "",
      priceInUSD: "",
      priceInBTN: "",
      description: ""
    });
    try {
      const response = await axios.post('http://localhost:4001/api/services', {
        name: newService.service,
        priceInUSD: newService.priceInUSD,
        priceInBTN: newService.priceInBTN,
        description: newService.description
      });
      if (response.data.status === "success") {
        Swal.fire({
          title: 'Success!',
          text: 'Service Added Successfully',
          icon: 'success',
          confirmButtonColor: '#1E306D',
          confirmButtonText: 'OK'
        });
        setServices([...services, response.data.data]);
        setFilteredServices([...services, response.data.data]);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response ? error.response.data.message : 'An error occurred during login',
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK'
      });
    }
  };

  const indexOfLastService = currentPage * itemsPerPage;
  const indexOfFirstService = indexOfLastService - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteService = (sid) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to delete this Service?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1E306D",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://localhost:4001/api/services/${sid}`);
          if (response.data.status === "success") {
            Swal.fire({
              title: 'Success!',
              text: 'Service Deleted Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedService({
            name: "",
            status: "",
            priceInUSD: "",
            priceInBTN: "",
            description: ""
          });
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Error deleting data',
            icon: 'error',
            confirmButtonColor: '#1E306D',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  const openModal = (service) => {
    setID(service._id);
    setSelectedService(service);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setShowAddForm(false);
  };

  const onUpdate = () => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to make changes to this service?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Service"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(`http://localhost:4001/api/services/${id}`, {
            name: selectedService.name,
            priceInUSD: selectedService.priceInUSD,
            status: selectedService.status,
            priceInBTN: selectedService.priceInBTN,
            description: selectedService.description,
          });
          if (response.data.status === "success") {
            Swal.fire({
              title: 'Success!',
              text: 'Service Updated Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedService({
            name: "",
            priceInUSD: "",
            priceInBTN: "",
            status: "",
            description: ""
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
    <main className="admin-table-container">
      <div className='admin-title'>
        <AdminHeader title="Services" />
      </div>
      <div className="booking-table-container">

        <div className="booking-table-controls">
          <div className="booking-left-controls">
            <input
              type="text"
              placeholder="Search..."
              className="booking-search-bar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="booking-right-controls">
            <button className="booking-add-button" onClick={handleAddService}>Add Service
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
              <div className='form-title'>Service Form</div>

              <form className="service-admin-form" onSubmit={handleFormSubmit}>
                <div className="service-form-group service-description-full">
                  <label>Service Name</label>
                  <input
                    type="text"
                    name="service"
                    value={newService.service}
                    onChange={handleFormChange}
                    placeholder='Enter Service Name'
                    required
                  />
                </div>
                <div className="service-form-columns">
                  <div className="service-form-column-right">
                    <div className="service-form-group">
                      <label>Price(in USD)</label>
                      <input
                        type="number"
                        name="priceInUSD"
                        value={newService.priceInUSD}
                        onChange={handleFormChange}
                        placeholder='Amount in $'
                        required
                      />
                    </div>
                  </div>

                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Price(in BTN)</label>
                      <input
                        type="number"
                        name="priceInBTN"
                        value={newService.priceInBTN}
                        onChange={handleFormChange}
                        placeholder='Amount in Nu.'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="service-form-group service-description-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={newService.description}
                    onChange={handleFormChange}
                    placeholder='Eg. It is for people who travels alot'
                    required
                  />
                </div>

                <button type="submit" className="admin-submit-button">
                  Add
                </button>
              </form>
              <hr className="service-divider" />
            </div>
          </div>
        )}

        <table className="booking-table">
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Service</th>
              <th>Price(in USD)</th>
              <th>Price(in BTN)</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentServices.map((service, index) => (
              <tr key={service._id} onClick={() => openModal(service)} className='booking-table-row-hover'>
                <td>{indexOfFirstService + index + 1}</td>
                <td>{service.name}</td>
                <td>{service.priceInUSD}</td>
                <td>{service.priceInBTN}</td>
                <td>{service.status}</td>
                <td>{service.description}</td>
                <td className="booking-action-icons">
                  <button className="booking-delete-button" onClick={(e) => { e.stopPropagation(); deleteService(service._id) }}>
                    <FiXCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* updates Model */}
        {isModalOpen && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className='form-title'>Service Form</div>

              <form className="service-admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdate();
                  closeModal();
                }}>
                <div className="popup-title ">Details</div>
                <div className="service-form-columns">
                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Service</label>
                      <input
                        type="text"
                        name="name"
                        value={selectedService.name || ""}
                        onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="service-form-group">
                      <label>Price(in USD)</label>
                      <input
                        type="number"
                        name="price"
                        value={selectedService.priceInUSD || ""}
                        onChange={(e) => setSelectedService({ ...selectedService, priceInUSD: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="service-form-column-right">

                    <div className="service-form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={selectedService.status || ""}
                        onChange={(e) => setSelectedService({ ...selectedService, status: e.target.value })}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="service-form-group">
                      <label>Price(in BTN)</label>
                      <input
                        type="number"
                        name="price"
                        value={selectedService.priceInBTN || ""}
                        onChange={(e) => setSelectedService({ ...selectedService, priceInBTN: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="service-form-group service-description-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={selectedService.description || ""}
                    onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="admin-submit-button">
                  Update
                </button>
              </form>
            </div>
          </div>
        )}

        {/* pagenation */}
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

        <p className="booking-results-count">{services.length} Results</p>
      </div>
    </main>
  );
}

export default Services;
