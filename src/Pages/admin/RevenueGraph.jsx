import React, { useState, useEffect, useRef } from "react";
import '../Css/revenue.css';
import AdminHeader from "../../Components/adminheader";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { AiOutlineDownload } from 'react-icons/ai';
import { Modal, Button, Form } from 'react-bootstrap';
import { IoMdAddCircleOutline } from "react-icons/io";
import axios from "axios";
import HelicopterLoader from "../../Components/HelicopterLoader";

function CategorizedReports() {
  const [performanceData, setPerformanceData] = useState([]);
  const [revenueSums, setRevenueSums] = useState({});
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("Revenue");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [monthlyData, setMonthlyData] = useState({
    january: '',
    february: '',
    march: '',
    april: '',
    may: '',
    june: '',
    july: '',
    august: '',
    september: '',
    october: '',
    november: '',
    december: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypeADD, setSelectedTypeAdd] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [existingId, setExistingId] = useState(null);

  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const displayMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const performanceType = ["Revenue", "Hrs"];

  const revenueTableRef = useRef(null);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedYear, selectedType]);

  useEffect(() => {
    fetchCategories();
  }, []);


  const processPerformanceData = (performance, bookings) => {
    const result = {};

    const initializeServiceYear = (service, year) => {
      if (!result[service]) result[service] = {};
      if (!result[service][year]) {
        result[service][year] = {};
        months.forEach((month) => {
          result[service][year][month] = {
            target: 0,
            actual: 0,
            durationTarget: 0,
            durationActual: 0
          };
        });
      }
    };

    // group performance data by service, year, and type
    const performanceMap = new Map();

    performance.forEach((item) => {
      const key = `${item.serviceName}-${item.year}-${item.performanceType}`;
      if (!performanceMap.has(key)) {
        performanceMap.set(key, item);
      } else {
        const existingItem = performanceMap.get(key);
        if (item._id > existingItem._id) {
          performanceMap.set(key, item);
        }
      }
    });

    // process the deduplicated performance data
    performanceMap.forEach((item) => {
      const year = item.year.toString();
      const service = item.serviceName;

      initializeServiceYear(service, year);
      months.forEach((month) => {
        const value = item[month.toLowerCase()] || 0;
        if (item.performanceType === "Revenue") {
          result[service][year][month].target = value;
        }
        if (item.performanceType === "Hrs") {
          result[service][year][month].durationTarget = value;
        }
      });
    });

    const calculateRefundedPrice = (originalPrice, refundInfo) => {
      if (!refundInfo || !refundInfo.plan) return originalPrice;

      const refundPercentage = parseFloat(refundInfo.plan);
      if (isNaN(refundPercentage)) return originalPrice;

      return originalPrice * ((100 - refundPercentage) / 100);
    };

    bookings.forEach((booking) => {
      if (booking.flight_date) {
        const date = new Date(booking.flight_date);
        const year = date.getFullYear().toString();
        const month = months[date.getMonth()];
        let price = Number(booking.bookingPriceBTN) || 0;
        const service = booking.service_id.name;

        if (booking.refund_id) {
          price = calculateRefundedPrice(price, booking.refund_id)
        }

        initializeServiceYear(service, year);
        result[service][year][month].actual += price;

        const duration = booking.destination?.duration || booking.duration;
        if (duration) {
          result[service][year][month].durationActual += parseFloat(duration);
        }
      }
    });

    return result;
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [response, response1] = await Promise.all([
        axios.get("https://helistaging.drukair.com.bt/api/performance"),
        axios.get("https://helistaging.drukair.com.bt/api/bookings"),
      ]);

      const performance = response.data.data;
      setPerformanceData(performance);

      const paidBookings = response1.data.data.filter(
        booking => booking.payment_status === "Paid" || booking.payment_status === "Credit"
      );
      const bookings = paidBookings;

      const processedData = processPerformanceData(performance, bookings);
      setRevenueSums(processedData);


      const yearsFromData = [
        ...new Set([
          ...performance.map((item) => item.year),
          ...bookings.map((booking) => new Date(booking.flight_date).getFullYear())
        ])
      ].sort();
      setYears(yearsFromData);

      if (yearsFromData.length > 0 && !selectedYear) {
        setSelectedYear(yearsFromData[yearsFromData.length - 1].toString());
      }

      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
      Swal.fire({
        title: "Error!",
        text: "Error fetching performance data: " + error.message,
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://helistaging.drukair.com.bt/api/services");
      const services = response.data.data;
      const serviceNames = services.map(service => service.name);
      setCategory(serviceNames);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Error fetching services: " + error.message,
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  const resetForm = () => {
    setMonthlyData({
      january: '',
      february: '',
      march: '',
      april: '',
      may: '',
      june: '',
      july: '',
      august: '',
      september: '',
      october: '',
      november: '',
      december: ''
    });
    setNewYear("");
    setSelectedCategory("");
    setSelectedTypeAdd("");
    setIsEditing(false);
    setExistingId(null);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    resetForm();
    setShowAddModal(false);
  };

  const handleAddSubmit = () => {
    if (!newYear || !selectedCategory || !selectedTypeADD) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter all the required details',
        icon: 'error',
        confirmButtonColor: '#1E306D',
      });
      return;
    }

    const existingEntry = performanceData.find(
      data =>
        data.year.toString() === newYear &&
        data.serviceName === selectedCategory &&
        data.performanceType === selectedTypeADD
    );

    if (existingEntry) {
      Swal.fire({
        title: 'Existing Entry Found',
        text: `${selectedCategory} (${selectedTypeADD}) for the year ${newYear} already exists. Would you like to update it?`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#1E306D',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it'
      }).then((result) => {
        if (result.isConfirmed) {
          setIsEditing(true);
          setExistingId(existingEntry._id);
          const existingMonthlyData = {};
          months.forEach(month => {
            existingMonthlyData[month.toLowerCase()] = existingEntry[month.toLowerCase()] || '';
          });
          setMonthlyData(existingMonthlyData);
          setShowAddModal(false);
          setShowDetailsModal(true);
        }
      });
    } else {
      setShowAddModal(false);
      setShowDetailsModal(true);
    }
  };

  const handleMonthlyDataChange = (month, value) => {
    setMonthlyData(prevData => ({
      ...prevData,
      [month.toLowerCase()]: value
    }));
  };

  function capitalizeWords(str) {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  const handleDetailsSubmit = async () => {
    try {
      const formData = {
        serviceName: selectedCategory,
        year: parseInt(newYear),
        performanceType: selectedTypeADD,
        ...months.reduce((acc, month) => ({
          ...acc,
          [month]: monthlyData[month.toLowerCase()] || 0,
        }), {})
      };

      let response;
      if (isEditing && existingId) {
        response = await axios.patch(
          `https://helistaging.drukair.com.bt/api/performance/${existingId}`,
          formData
        );
      } else {
        response = await axios.post(
          "https://helistaging.drukair.com.bt/api/performance",
          formData
        );
      }

      resetForm();
      setShowDetailsModal(false);
      await fetchPerformanceData();

      Swal.fire({
        title: 'Success!',
        text: `${selectedType} data has been ${isEditing ? 'updated' : 'added'} successfully.`,
        icon: 'success',
        confirmButtonColor: '#1E306D',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || `Error ${isEditing ? 'updating' : 'adding'} data`,
        icon: 'error',
        confirmButtonColor: '#1E306D',
      });
    }
  };
  const handleDownloadClick = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to download the ${selectedType} report for ${selectedYear}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1E306D',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, download it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const table = document.getElementById('data-table');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(table);

        const colWidths = Array(13).fill({ wch: 10 });
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${selectedType}_${selectedYear}.xlsx`);

        Swal.fire({
          title: 'Downloaded!',
          text: `Your ${selectedType} report for ${selectedYear} has been downloaded.`,
          icon: 'success',
          confirmButtonColor: '#1E306D',
        });
      }
    });
  };
  const getMonthlyData = (serviceName) => {
    const serviceData = revenueSums[serviceName];
    if (!serviceData || !serviceData[selectedYear]) return {};

    const yearData = serviceData[selectedYear];
    const transformedData = {};

    months.forEach(month => {
      const monthData = yearData[month.toLowerCase()];
      if (selectedType === "Revenue") {
        transformedData[month] = monthData?.actual || 0;
        transformedData[`${month}Target`] = monthData?.target || 0;
      } else {
        transformedData[month] = (monthData?.durationActual)/60 || 0;
        transformedData[`${month}Target`] = (monthData?.durationTarget)/60 || 0;
      }
    });

    return transformedData;
  };


  const formatRevenue = (value) => {
    const numValue = Number(value);

    if (isNaN(numValue)) return '0.00';

    if (value >= 1e33) {
      return (value / 1e33).toFixed(2) + 'D';
    } else if (value >= 1e30) {
      return (value / 1e30).toFixed(2) + 'N';
    } else if (value >= 1e27) {
      return (value / 1e27).toFixed(2) + 'O';
    } else if (value >= 1e24) {
      return (value / 1e24).toFixed(2) + 'Sp';
    } else if (value >= 1e21) {
      return (value / 1e21).toFixed(2) + 'S';
    } else if (value >= 1e18) {
      return (value / 1e18).toFixed(2) + 'Qi';
    } else if (value >= 1e15) {
      return (value / 1e15).toFixed(2) + 'Q';
    } else if (value >= 1e12) {
      return (value / 1e12).toFixed(2) + 'T';
    } else if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(2) + 'K';
    }
    return numValue.toFixed(2);
  };


  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="revenue-container">
      {loading ?
        <HelicopterLoader /> :
        <>
          <div className='admin-title'>
            <AdminHeader title={selectedType} />
          </div>

          <div className="containerR">
            <div className="control">
              <select className="dropdown" value={selectedYear} onChange={handleYearChange}>
                <option>Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select className="dropdown" value={selectedType} onChange={handleTypeChange}>
                <option value="Revenue">Revenue</option>
                <option value="Hrs">Hours</option>
              </select>

              <div className="download-container">
                <button className="download-btn" onClick={handleDownloadClick}>
                  Download<AiOutlineDownload style={{ marginLeft: '8px' }} />
                </button>
                <button className="download-btn" onClick={handleAddClick}>
                  Add Perfomance
                  <IoMdAddCircleOutline size={20} background='#22326E' />
                </button>
              </div>
            </div>

            {category.filter(serviceName => {
              const data = getMonthlyData(serviceName);

              const hasValidData = months.some(month => month in data);
              if (hasValidData) {
                // Check if any month has a non-zero target or actual value
                const hasNonZeroValues = months.some(month =>
                  (data[month] || 0) !== 0 || (data[`${month}Target`] || 0) !== 0
                );
                return hasNonZeroValues;
              }

              return false;
            }).map(serviceName => {
              const data = getMonthlyData(serviceName);
              return (
                <table
                  key={serviceName}
                  className={`table table-bordered ${serviceName.toLowerCase().replace(/\s+/g, '-')}-table`}
                >
                  <thead>
                    <tr>
                      <th colSpan={months.length + 1}>
                        {serviceName} ({selectedType === "Revenue" ? "Nu." : "Hrs"})
                      </th>
                    </tr>
                    <tr>
                      <th>Month</th>
                      {displayMonths.map(month => (
                        <th key={month}>{month}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Target</th>
                      {months.map(month => (
                        <td key={month}>
                          {selectedType === "Revenue"
                            ? formatRevenue(data[`${month}Target`] || 0)
                            : (data[`${month}Target`] || 0).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th>Actual</th>
                      {months.map(month => (
                        <td key={month}>
                          {selectedType === "Revenue"
                            ? formatRevenue(data[month] || 0)
                            : (data[month] || 0).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              );
            })}

            <Modal show={showAddModal} onHide={handleCloseAddModal}>
              <Modal.Header>
                <Modal.Title>Add {selectedType}</Modal.Title>
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseAddModal}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', marginLeft: 'auto' }}
                >
                  &times;
                </button>
              </Modal.Header>
              <Modal.Body className="revenue-modal-body">
                <Form>
                  <Form.Group className="revenue-form-group" style={{ width: "100%" }}>
                    <Form.Label>Year</Form.Label>
                    <input
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="Enter A Year"
                      style={{ padding: "8px 12px", outline: "none", width: "100%" }}
                    />
                  </Form.Group>
                  <Form.Group className="revenue-form-group" style={{ marginTop: "-5px" }}>
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)} >
                      <option value="">Select Category</option>
                      {category.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="revenue-form-group" style={{ marginTop: "-5px" }}>
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedTypeADD}
                      onChange={(e) => setSelectedTypeAdd(e.target.value)} >
                      <option value="">Select Type</option>
                      {performanceType.map(pType => (
                        <option key={pType} value={pType}>{pType}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={handleAddSubmit} className="download-btn">
                  Next
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
              <Modal.Header>
                <Modal.Title>
                  Add Monthly {selectedType} Details for {newYear} - {selectedCategory}
                </Modal.Title>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowDetailsModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', marginLeft: 'auto' }}
                >
                  &times;
                </button>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  {months.map(month => (
                    <Form.Group key={month} className="revenue-form-group">
                      <Form.Label>{capitalizeWords(month)}</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="number"
                          placeholder="Target"
                          value={monthlyData[month.toLowerCase()]}
                          onChange={(e) => handleMonthlyDataChange(month, e.target.value)}
                          style={{ fontSize: '16px' }}
                        />

                        <Form.Control
                          type="number"
                          placeholder="Actual"
                          value={selectedType === "Revenue"
                            ? formatRevenue(0)
                            : (0).toFixed(2)}
                          style={{ fontSize: '16px' }}
                          readOnly
                        />
                      </div>
                    </Form.Group>
                  ))}
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={handleDetailsSubmit} className="download-btn">
                  Submit
                </Button>
              </Modal.Footer>
            </Modal>

            <table id="data-table" ref={revenueTableRef} style={{ display: 'none' }}>
              <thead>
                <tr>
                  <th>Month</th>
                  {category.map(cat => (
                    <React.Fragment key={cat}>
                      <th colSpan="2">{cat}</th>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <th></th>
                  {category.map(cat => (
                    <React.Fragment key={cat}>
                      <th>Actual</th>
                      <th>Target</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {months.map((month, index) => (
                  <tr key={month}>
                    <td>{displayMonths[index]}</td>
                    {category.map(serviceName => {
                      const data = getMonthlyData(serviceName);
                      return (
                        <React.Fragment key={serviceName}>
                          <td>{selectedType === "Revenue"
                            ? formatRevenue(data[month] || 0)
                            : (data[month] || 0).toFixed(2)}</td>
                          <td>{selectedType === "Revenue"
                            ? formatRevenue(data[`${month}Target`] || 0)
                            : (data[`${month}Target`] || 0).toFixed(2)}</td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
    </main>
  );
}

export default CategorizedReports;