import React, { useState, useEffect } from "react";
import { FiXCircle } from "react-icons/fi";
import "./../Css/adminBookings.css";
import "./../Css/serviceModel.css";
import AdminHeader from "../../Components/adminheader";
import { IoMdAddCircleOutline } from "react-icons/io";
import axios from "axios";
import Swal from "sweetalert2";

function ARoutes() {
  const [charter, setCharter] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [charterFilter, setCharterFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoutes, setNewRoutes] = useState({
    sector: "",
    duration: "",
    winterWeightKg: "",
    summerWeightKg: "",
    charter: "",
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState({
    sector: "",
    duration: "",
    summerWeight: "",
    winterWeight: "",
    status: "",
    charter: ""
  });
  const [id, setID] = useState();

  useEffect(() => {
    const fetchCharter = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/charter");
        setCharter(Array.isArray(response.data.data) ? response.data.data : []);
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

    fetchCharter();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/routes");
        setRoutes(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Error fetching charter data",
          icon: "error",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
        });
      }
    };

    fetchData();
  }, [selectedRoutes]);

  const handleAddRoutes = () => {
    setShowAddForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewRoutes({ ...newRoutes, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:4001/api/routes", {
        sector: newRoutes.sector,
        duration: newRoutes.duration,
        summerWeight: newRoutes.summerWeightKg,
        winterWeight: newRoutes.winterWeightKg,
        charter: newRoutes.charter,
      });

      if (response.data.status === "success") {
        Swal.fire({
          title: "Success!",
          text: "Route Added Successfully",
          icon: "success",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
        });
        setNewRoutes({
          sector: "",
          duration: "",
          winterWeightKg: "",
          summerWeightKg: "",
          charter: "",
        });
        setRoutes([...routes, response.data.data]);
        setFilteredRoutes([...routes, response.data.data]);
        setShowAddForm(false);
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response
          ? error.response.data.message
          : "An error occurred during the submission",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  const openModal = (route) => {
    setID(route._id);
    setSelectedRoutes(route);
    setModalOpen(true);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setModalOpen(false);
  };

  useEffect(() => {
    const filtered = routes.filter(
      (route) =>
        (route.charter.toLowerCase().includes(charterFilter.toLowerCase()) ||
          charterFilter === "") &&
        route.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoutes(filtered);
    setCurrentPage(1);
  }, [searchTerm, charterFilter, routes]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCharterChange = (e) => {
    setCharterFilter(e.target.value);
  };

  const indexOfLastRoute = currentPage * itemsPerPage;
  const indexOfFirstRoute = indexOfLastRoute - itemsPerPage;
  const currentRoutes = filteredRoutes.slice(indexOfFirstRoute, indexOfLastRoute);

  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteRoutes = (rid) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to delete this ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1E306D",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://localhost:4001/api/routes/${rid}`);
          if (response.data.status === "success") {
            Swal.fire({
              title: 'Success!',
              text: 'Route Deleted Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedRoutes({
            sector: "",
            duration: "",
            summerWeight: "",
            winterWeight: "",
            status: "",
            charter: ""
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
      text: "Are you sure you want to make changes to this routes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Routes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(`http://localhost:4001/api/routes/${id}`, {
            sector: selectedRoutes.sector,
            duration: selectedRoutes.duration,
            summerWeight: selectedRoutes.summerWeight,
            winterWeight: selectedRoutes.winterWeight,
            status: selectedRoutes.status,
            charter: selectedRoutes.charter
          });
          if (response.data.status === "success") {
            Swal.fire({
              title: 'Success!',
              text: 'Route Updated Successfully',
              icon: 'success',
              confirmButtonColor: '#1E306D',
              confirmButtonText: 'OK'
            });
          }
          setSelectedRoutes({
            sector: "",
            duration: "",
            summerWeight: "",
            winterWeight: "",
            status: "",
            charter: ""
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
      <div className="admin-title">
        <AdminHeader title="Routes" />
      </div>
      <div className="booking-table-container">
        <div className="booking-table-controls">
          <div className="booking-left-controls">
            <input
              type="text"
              placeholder="Search by Charter..."
              className="booking-search-bar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="booking-right-controls">
            <select
              className="booking-filter-select"
              value={charterFilter}
              onChange={handleCharterChange}
            >
              <option value="">All Charters</option>
              {charter.map((chart) => (
                <option key={chart._id} value={chart._id}>
                  {chart.name}
                </option>
              ))}
            </select>

            <button className="booking-add-button" onClick={handleAddRoutes}>
              Add Routes
              <IoMdAddCircleOutline size={20} background="#22326E" />
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className="form-title">Routes Form</div>

              <form className="service-admin-form" onSubmit={handleFormSubmit}>
                <div className="service-form-group service-description-full">
                  <div className="popup-title ">Charter</div>
                  <label>Charter</label>
                  <select
                    name="charter"
                    value={newRoutes.charter}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Charter</option>
                    {charter.map((chart) => (
                      <option key={chart._id} value={chart._id}>
                        {chart.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="popup-title ">Details</div>
                <div className="service-form-columns">
                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Sector</label>
                      <input
                        type="text"
                        name="sector"
                        value={newRoutes.sector}
                        onChange={handleFormChange}
                        placeholder="Sector"
                        required
                      />
                    </div>

                    <div className="service-form-group">
                      <label>Winter Weight (kg)</label>
                      <input
                        type="number"
                        name="winterWeightKg"
                        value={newRoutes.winterWeightKg}
                        onChange={handleFormChange}
                        placeholder=" Winter Weight (kg)"
                        required
                      />
                    </div>
                  </div>

                  <div className="service-form-column-right">
                    <div className="service-form-group">
                      <label>Duration (Minutes)</label>
                      <input
                        type="number"
                        name="duration"
                        value={newRoutes.duration}
                        onChange={handleFormChange}
                        placeholder="Duration( In Minutes)"
                        required
                      />
                    </div>

                    <div className="service-form-group">
                      <label>Summer Weight (kg)</label>
                      <input
                        type="number"
                        name="summerWeightKg"
                        value={newRoutes.summerWeightKg}
                        onChange={handleFormChange}
                        placeholder="Summer Weight (kg)"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="service-admin-form-button">
                  <button
                    type="submit"
                    className="admin-submit-button"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sector</th>
              <th>Duration</th>
              <th>Winter Weight (kg)</th>
              <th>Summer Weight (kg)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRoutes.map((route, index) => (
              <tr key={route._id} onClick={() => openModal(route)} className='booking-table-row-hover'>
                <td>{index + 1}</td>
                <td>{route.sector}</td>
                <td>{route.duration}</td>
                <td>{route.winterWeight}</td>
                <td>{route.summerWeight}</td>
                <td className="booking-action-icons">
                  <button className="booking-delete-button" onClick={(e) => { e.stopPropagation(); deleteRoutes(route._id) }}>
                    <FiXCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal Code */}
        {isModalOpen && selectedRoutes && (
          <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={closeModal}>
                &times;
              </span>
              <div className="form-title">Update Routes</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdate();
                  closeModal();
                }}
              >

                <div className="service-form-columns">
                  <div className="service-form-column-left">
                    <div className="service-form-group">
                      <label>Charter</label>
                      <select
                        name="charter"
                        value={selectedRoutes.charter || ''}
                        onChange={(e) =>
                          setSelectedRoutes({
                            ...selectedRoutes,
                            charter: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Charter</option>
                        {charter.map((chart) => (
                          <option key={chart._id} value={chart._id}>
                            {chart.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="service-form-group">
                      <label>Sector</label>
                      <input
                        type="text"
                        name="sector"
                        value={selectedRoutes.sector}
                        onChange={(e) =>
                          setSelectedRoutes({
                            ...selectedRoutes,
                            sector: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="service-form-group">
                      <label>Winter Weight (kg)</label>
                      <input
                        type="number"
                        name="winterWeight"
                        value={selectedRoutes.winterWeight}
                        onChange={(e) =>
                          setSelectedRoutes({
                            ...selectedRoutes,
                            winterWeight: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="service-form-column-right">
                    <div className="service-form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={selectedRoutes.status}
                        onChange={(e) =>
                          setSelectedRoutes({
                            ...selectedRoutes,
                            status: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </div>
                    <div className="service-form-group">
                      <label>Duration (Minutes)</label>
                      <input
                        type="number"
                        name="duration"
                        value={selectedRoutes.duration}
                        onChange={(e) =>
                          setSelectedRoutes({
                            ...selectedRoutes,
                            duration: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="service-form-group">
                      <label>Summer Weight (kg)</label>
                      <input
                        type="number"
                        name="summerWeight"
                        value={selectedRoutes.summerWeight}
                        onChange={(e) =>
                          setSelectedRoutes({
                            ...selectedRoutes,
                            summerWeight: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="service-admin-form-buttons">
                  <button
                    type="submit"
                    className="admin-submit-button"
                  >
                    Update
                  </button>
                </div>
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

        <p className="booking-results-count">{routes.length} Results</p>
      </div>
    </main>
  );
}

export default ARoutes;
