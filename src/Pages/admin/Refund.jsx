import React, { useState, useEffect } from 'react';
import { FiXCircle } from "react-icons/fi";
import "./../Css/adminBookings.css";
import "./../Css/serviceModel.css";
import AdminHeader from '../../Components/adminheader';
import { IoMdAddCircleOutline } from "react-icons/io";
import axios from 'axios';
import Swal from 'sweetalert2';

function Refund() {
  const [refunds, setRefunds] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRefund, setNewRefund] = useState({
    refundName: "",
    refundPlanPercent: "",
    description: ""
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState({
    name: "",
    plan: "",
    status: "",
    description: ""
  });
  const [id, setID] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://helistaging.drukair.com.bt/api/refund');
        setRefunds(Array.isArray(response.data.data) ? response.data.data : []);
        setFilteredRefunds(Array.isArray(response.data.data) ? response.data.data : []);
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
  }, [selectedRefund]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewRefund({ ...newRefund, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://helistaging.drukair.com.bt/api/refund', {
        name: newRefund.refundName,
        plan: newRefund.refundPlanPercent,
        description: newRefund.description
      });
      if (response.data.status === "success") {
        Swal.fire({
          title: 'Success!',
          text: 'Refund Plan Added Successfully',
          icon: 'success',
          confirmButtonColor: '#1E306D',
          confirmButtonText: 'OK'
        });
        setRefunds([...refunds, response.data.data]);
        setFilteredRefunds([...refunds, response.data.data]);
        setShowAddForm(false);
        setNewRefund({
          refundName: "",
          refundPlanPercent: "",
          description: ""
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response ? error.response.data.message : 'An error occurred during submission',
        icon: 'error',
        confirmButtonColor: '#1E306D',
        confirmButtonText: 'OK'
      });
    }
  };

  const closeModal = () => {
    setShowAddForm(false);
    setModalOpen(false);
  };
  const openModal = (refund) => {
    setID(refund._id);
    setSelectedRefund(refund);
    setModalOpen(true);
  };

  useEffect(() => {
    const filtered = refunds.filter(refund =>
      Object.values(refund).some(
        value => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRefunds(filtered);
    setCurrentPage(1);
  }, [searchTerm, refunds]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const indexOfLastRefund = currentPage * itemsPerPage;
  const indexOfFirstRefund = indexOfLastRefund - itemsPerPage;
  const currentRefunds = filteredRefunds.slice(indexOfFirstRefund, indexOfLastRefund);

  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteRefundPlan = (rid) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to delete this Refund Plan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1E306D",
      confirmButtonText: "Yes, delete it!"
    }).then( async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`https://helistaging.drukair.com.bt/api/refund/${rid}`);
          if(response.data.status === "success"){
            Swal.fire({
              title: 'Success!',
              text: 'Refund Plan Deleted Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedRefund({
            name: "",
            plan: "",
            status: "",
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

  const onUpdate = () => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to make changes to this refund?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Refund"
    }).then( async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(`https://helistaging.drukair.com.bt/api/refund/${id}`, {
            name: selectedRefund.name,
            plan: selectedRefund.plan,
            status: selectedRefund.status,
            description: selectedRefund.description,
          });
          if(response.data.status === "success"){
            Swal.fire({
              title: 'Success!',
              text: 'Refund Updated Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedRefund({
            name: "",
            plan: "",
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
        <AdminHeader title="Refund" />
      </div>
      <div className="booking-table-container">
        <div className="booking-table-controls">
          <div className="booking-left-controls">
            <input
              type="text"
              placeholder="Search by Refund Name..."
              className="booking-search-bar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="booking-right-controls">
            <button className="booking-add-button" onClick={() => setShowAddForm(true)}>Refund Plan
              <IoMdAddCircleOutline size={20} />
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className='form-title'>Refund Form</div>
              <form className="service-admin-form" onSubmit={handleFormSubmit}>
                <div className='popup-title'>Details</div>
                <div className="service-form-columns">
                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Refund Plan Name</label>
                      <input
                        type="text"
                        name="refundName"
                        value={newRefund.refundName}
                        onChange={handleFormChange}
                        placeholder='Refund Plan Name'
                        required
                      />
                    </div>
                  </div>
                  <div className="service-form-column-right">
                    <div className="service-form-group">
                      <label>Refund Plan (%)</label>
                      <input
                        type="number"
                        name="refundPlanPercent"
                        value={newRefund.refundPlanPercent}
                        onChange={handleFormChange}
                        placeholder='Refund Plan (%)'
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="service-form-group service-description-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={newRefund.description}
                    onChange={handleFormChange}
                    placeholder='About Refund'
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
              <th>Refund Name</th>
              <th>Refund Plan (%)</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRefunds.map((refund, index) => (
              <tr key={refund._id} onClick={() => openModal(refund)} className='booking-table-row-hover'>
                <td>{indexOfFirstRefund + index + 1}</td>
                <td>{refund.name}</td>
                <td>{refund.plan}%</td>
                <td>{refund.description}</td>
                <td className="booking-action-icons">
                  <button className="booking-delete-button" onClick={(e) => { e.stopPropagation(); deleteRefundPlan(refund._id) }}>
                    <FiXCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/*updates model*/}

        {isModalOpen && selectedRefund && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className='form-title'>Refund Form</div>
              <form className="service-admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdate();
                  closeModal();
                }} >
                <div className='popup-title'>Details</div>
                <div className="service-form-columns">
                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Refund Plan Name</label>
                      <input
                        type="text"
                        name="refundName"
                        value={selectedRefund.name}
                        onChange={(e) => setSelectedRefund({ ...selectedRefund, refundName: e.target.value, })}
                        required
                      />
                    </div>
                    <div className="service-form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={selectedRefund.status}
                        onChange={(e) => setSelectedRefund({ ...selectedRefund, status: e.target.value, })}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </div>

                  </div>
                  <div className="service-form-column-right">
                    <div className="service-form-group">
                      <label>Refund Plan (%)</label>
                      <input
                        type="number"
                        name="refundPlanPercent"
                        value={selectedRefund.plan}
                        onChange={(e) => setSelectedRefund({ ...selectedRefund, refundPlanPercent: e.target.value, })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="service-form-group service-description-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={selectedRefund.description}
                    onChange={(e) => setSelectedRefund({ ...selectedRefund, description: e.target.value, })}
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

        {/* pagination */}

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
        <p className="booking-results-count">{filteredRefunds.length} Results</p>
      </div>
    </main>
  );
}

export default Refund;
