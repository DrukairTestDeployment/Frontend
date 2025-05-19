import React, { useState, useEffect } from 'react';
import { FiXCircle } from "react-icons/fi";
import "./../Css/adminBookings.css";
import "./../Css/serviceModel.css";
import AdminHeader from '../../Components/adminheader';
import { IoMdAddCircleOutline } from "react-icons/io";
import axios from 'axios';
import Swal from 'sweetalert2';


function Charter() {
  const [charters, setCharters] = useState([]);
  const [filteredCharters, setFilteredCharters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCharter, setNewCharter] = useState({
    charter: "",
    description: ""
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCharter, setSelectedCharter] = useState({
    name: "",
    status: "",
    description: ""
  });
  const [id, setID] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://helistaging.drukair.com.bt/api/charter');
        setCharters(Array.isArray(response.data.data) ? response.data.data : []);
        setFilteredCharters(Array.isArray(response.data.data) ? response.data.data : []);
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
  }, [selectedCharter]);

  const handleAddCharter = () => {
    setShowAddForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewCharter({ ...newCharter, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://helistaging.drukair.com.bt/api/charter', {
        name: newCharter.charter,
        description: newCharter.description
      });
      if (response.data.status === "success") {
        Swal.fire({
          title: 'Success!',
          text: 'Charter Added Successfully',
          icon: 'success',
          confirmButtonColor: '#1E306D',
          confirmButtonText: 'OK'
        });
      }
      setCharters([...charters, response.data.data]);
      setFilteredCharters([...charters, response.data.data]);
      setShowAddForm(false);

      setNewCharter({
        charter: "",
        description: ""
      });
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

  const closeModal = () => {
    setShowAddForm(false);
    setModalOpen(false);
  };
  const openModal = (charter) => {
    setID(charter._id);
    setSelectedCharter(charter);
    setModalOpen(true);
  };


  const onUpdate = () => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to make changes to this charter?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Charter"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(`https://helistaging.drukair.com.bt/api/charter/${id}`, {
            name: selectedCharter.name,
            status: selectedCharter.status,
            description: selectedCharter.description,
          });
          if (response.data.status === "success") {
            Swal.fire({
              title: 'Success!',
              text: 'Charter Updated Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedCharter({
            name: "",
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


  useEffect(() => {
    const filteredCharters = charters.filter(charter =>
      Object.values(charter).some(
        value => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCharters(filteredCharters);
    setCurrentPage(1);
  }, [searchTerm, charters]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const indexOfLastService = currentPage * itemsPerPage;
  const indexOfFirstService = indexOfLastService - itemsPerPage;
  const currentServices = filteredCharters.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(filteredCharters.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteCharter = (cid) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to delete this Charter?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1E306D",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`https://helistaging.drukair.com.bt/api/charter/${cid}`);
          if (response.data.status === "success") {
            Swal.fire({
              title: 'Success!',
              text: 'Charter Deleted Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedCharter({
            name: "",
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

  return (
    <main className="admin-table-container">
      <div className='admin-title'>
        <AdminHeader title="Charter" />
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
            <button className="booking-add-button" onClick={handleAddCharter}>Add Charter
              <IoMdAddCircleOutline size={20} background='#22326E' />
            </button>
          </div>
        </div>

        {/* Modal */}
        {showAddForm && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className='form-title'>Charter Updates Form</div>

              <form className="service-admin-form" onSubmit={handleFormSubmit}>

                <div className="popup-title ">Details</div>
                <div className="service-form-columns">

                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Charter</label>
                      <input
                        type="text"
                        name="charter"
                        value={newCharter.charter}
                        onChange={handleFormChange}
                        placeholder='Charter Name'
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Move description outside the columns */}
                <div className="service-form-group service-description-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={newCharter.description}
                    onChange={handleFormChange}
                    placeholder='About Charter'
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

        <table className="admin-booking-table">
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Charter</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentServices.map((charter, index) => (
              <tr key={charter._id} onClick={() => openModal(charter)} className='booking-table-row-hover'>
                <td>{indexOfFirstService + index + 1}</td>
                <td>{charter.name}</td>
                <td>{charter.description}</td>
                <td className="booking-action-icons">
                  <button className="booking-delete-button" onClick={(e) => { e.stopPropagation(); deleteCharter(charter._id) }}>
                    <FiXCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* updates Model code */}
        {isModalOpen && selectedCharter && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className='form-title'>Charter Updates Form</div>

              <form className="service-admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdate();
                  closeModal();
                }}

              >
                <div className="popup-title ">Details</div>
                <div className="service-form-columns">
                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Charter</label>
                      <input
                        type='text'
                        name="name"
                        value={selectedCharter.name}
                        onChange={(e) => setSelectedCharter({ ...selectedCharter, charter: e.target.value, })}
                        required
                      />
                    </div>
                  </div>
                  <div className="service-form-column-right">
                    <div className="service-form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={selectedCharter.status}
                        onChange={(e) => setSelectedCharter({ ...selectedCharter, status: e.target.value, })}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Enable">Enable</option>
                        <option value="Disable">Disable</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="service-form-group service-description-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={selectedCharter.description}
                    onChange={(e) =>
                      setSelectedCharter({
                        ...selectedCharter,
                        description: e.target.value,
                      })
                    }
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

        <p className="booking-results-count">{charters.length} Results</p>
      </div>

    </main>
  );
}

export default Charter;
