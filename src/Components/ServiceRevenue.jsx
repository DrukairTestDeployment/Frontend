import React, { useState, useEffect, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import 'chart.js/auto';
import { AiOutlineDownload } from 'react-icons/ai';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import './financial.css';
import axios from "axios";
import HelicopterLoader from "./HelicopterLoader";
import { RxUpdate } from "react-icons/rx";

function ServiceRevenueComponent() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceMonth, setSelectedServiceMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenue, setRevenue] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceMain, setServiceMain] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('BTN');

  const financialTableRef = useRef(null);
  const serviceRevenueTableRef = useRef(null);

  const [years, setYears] = useState([]);

  const [commisionId, setCommisionId] = useState()
  const [updatedCommisionValue, setUpdatedCommisionValue] = useState(0)

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [servicesResponse, bookingsResponse] = await Promise.all([
        axios.get("http://localhost:4001/api/services/"),
        axios.get("http://localhost:4001/api/bookings/")
      ]);

      

      const services = servicesResponse.data.data;
      const enabledServices = services.filter(service => service.status==="Enabled");
      const serviceNames = enabledServices.map(service => service.name);

      // Filter only paid bookings
      const paidBookings = bookingsResponse.data.data.filter(
        booking => booking.payment_status === "Paid"
      );


      const uniqueYears = Array.from(new Set(paidBookings.map(booking =>
        new Date(booking.flight_date).getFullYear()
      )));
      setYears(uniqueYears.sort((a, b) => a - b));

      setServiceMain(serviceNames);
      setServiceTypes([...serviceNames, "Service"]);
      setSelectedCategory(serviceNames[0]);
      setRevenue(paidBookings);

    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Error fetching data",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCommision = async () => {
      try {
        const response = await axios.get(`http://localhost:4001/api/commision/`);
        const commision = response.data.data[0].commisionValue
        const commissionId = response.data.data[0]._id
        setCommisionId(commissionId)
        setUpdatedCommisionValue(parseFloat(commision));
      } catch (error) {
        Swal.fire({
          title: "Error!",            
          text: "Error fetching comission data",
          icon: "error",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
        });
      }
    };
    fetchCommision();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setUpdatedCommisionValue(parseFloat(value));
  };

  const handleUpdate = (e) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to make changes to the international payment commission?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update commission",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(
            `http://localhost:4001/api/commision/${commisionId}`,
            {
              commisionValue: updatedCommisionValue,
            }
          );
          if (response.data.status === "success") {
            Swal.fire({
              title: "Success!",
              text: "Commission Updated Successfully",
              icon: "success",
              confirmButtonColor: "#1E306D",
              confirmButtonText: "OK",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.response ? error.response.data.message : "Error updating commission",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const calculateRefundedPrice = (originalPrice, refundInfo) => {
    if (!refundInfo || !refundInfo.plan) return originalPrice;

    const refundPercentage = parseFloat(refundInfo.plan);
    if (isNaN(refundPercentage)) return originalPrice;

    return originalPrice * ((100 - refundPercentage) / 100);
  };

  const getRevenueByMonthAndService = () => {
    const revenueMap = new Map();
    months.forEach(month => {
      revenueMap.set(month, new Map());
    });

    if (!revenue.length) return revenueMap;

    revenue.forEach(booking => {
      const bookingDate = new Date(booking.flight_date);
      const bookingYear = bookingDate.getFullYear();

      if (bookingYear === selectedYear) {
        const serviceName = booking.service_id.name;

        let priceBTN = booking.cType === 'BTN' ? booking.bookingPriceBTN : 0;
        let priceUSD = booking.cType === 'USD' ? booking.bookingPriceUSD : 0;

        // Apply refund if exists
        if (booking.refund_id) {
          priceBTN = calculateRefundedPrice(priceBTN, booking.refund_id);
          priceUSD = calculateRefundedPrice(priceUSD, booking.refund_id);
        }

        const month = bookingDate.toLocaleString('default', { month: 'long' });
        const monthData = revenueMap.get(month);

        if (monthData) {
          const currentData = monthData.get(serviceName) || { priceBTN: 0, priceUSD: 0 };
          monthData.set(serviceName, {
            priceBTN: currentData.priceBTN + priceBTN,
            priceUSD: currentData.priceUSD + priceUSD
          });
        }
      }
    });
    return revenueMap;
  };

  const createChartData = (label, data, color) => ({
    labels: months,
    datasets: [
      {
        label: `${label} ${selectedYear} (Actual Earnings)`,
        data: data,
        fill: false,
        backgroundColor: color,
        borderColor: color,
        tension: 0.1,
      },
    ],
  });

  const createBarChartData = (services, earnings, color) => ({
    labels: services,
    datasets: [
      {
        label: `Earnings for ${selectedServiceMonth} ${selectedYear} (NU)`,
        data: earnings,
        backgroundColor: color,
      },
    ],
  });

  const getCategoryData = () => {
    if (isLoading || !selectedCategory) return null;

    const revenueByMonth = getRevenueByMonthAndService();
    const color = selectedCurrency === 'BTN' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)';

    if (selectedCategory === 'Service') {
      const monthData = revenueByMonth.get(selectedServiceMonth);
      const services = Array.from(monthData ? monthData.keys() : []);
      const earnings = services.map(service =>
        monthData ? monthData.get(service)[`price${selectedCurrency}`] || 0 : 0
      );

      return createBarChartData(services, earnings, color);
    } else {
      const serviceData = months.map(month => {
        const monthData = revenueByMonth.get(month);
        return monthData
          ? monthData.get(selectedCategory)?.[`price${selectedCurrency}`] || 0
          : 0;
      });

      return createChartData(selectedCategory, serviceData, color);
    }
  };


  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Earnings (NU)',
        },
      },
      x: {
        title: {
          display: true,
          text: selectedCategory === 'Service' ? 'Service' : 'Month',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const getFilteredServiceRevenueData = () => {
    const revenueByMonth = getRevenueByMonthAndService();
    const monthRevenue = revenueByMonth.get(selectedServiceMonth);

    if (!monthRevenue) return [];

    return Array.from(monthRevenue).map(([service, amounts]) => ({
      year: selectedYear,
      month: selectedServiceMonth,
      service,
      revenueBTN: amounts.priceBTN,
      revenueUSD: amounts.priceUSD
    }));
  };

  const handleDownloadClick = (tableRef, filename) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to download the ${filename} report?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1E306D',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, download it!'
    }).then((result) => {
      if (result.isConfirmed) {
        let dataToDownload;
        if (selectedCategory === 'Service') {
          dataToDownload = XLSX.utils.json_to_sheet(getFilteredServiceRevenueData());
        } else {
          const table = tableRef.current;
          if (table) {
            dataToDownload = XLSX.utils.table_to_sheet(table);
          }
        }

        if (dataToDownload) {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, dataToDownload, "Sheet JS");
          XLSX.writeFile(wb, `${filename}_${selectedYear}.xlsx`);
        }

        Swal.fire({
          title: 'Downloaded!',
          text: `Your ${filename} report has been downloaded.`,
          icon: 'success',
          confirmButtonColor: '#1E306D',
        });
      }
    });
  };

  if (isLoading) {
    return <HelicopterLoader />;
  }

  return (
    <div className="container">
      <div className="controls-container controls-container-top">

        <div className="left-dropdown-container">
          <div className="booking-left-controls">
            <input
              type="Number"
              className="booking-update-bar booking-search-bar"
              value={updatedCommisionValue}
              onChange={handleChange}
            />
          </div>
          <div className="download-container">
            <button
              className="download-btn"
              onClick={handleUpdate}
            >
              Update<RxUpdate style={{ marginLeft: '3px' }} />
            </button>
          </div>
        </div>
        <div className="right-dropdown-container">
          <div className="dropdown-container">
            <div className="dropdown-container">
              <label htmlFor="currency-select"></label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="form-select"
              >
                <option value="BTN">BTN</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="dropdown-container">
              <label htmlFor="year-select"></label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-select"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>


            {selectedCategory === 'Service' && (
              <div className="dropdown-container">
                <label htmlFor="month-select"></label>
                <select
                  id="month-select"
                  value={selectedServiceMonth}
                  onChange={(e) => setSelectedServiceMonth(e.target.value)}
                  className="form-select"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label htmlFor="category-select"></label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              {serviceTypes.map((service, index) => (
                <option key={index} value={service}>
                  {service}
                </option>
              ))}
            </select>

            {selectedCategory === 'Service' && (
              <div className="download-container">
                <button
                  className="download-btn"
                  onClick={() => handleDownloadClick(serviceRevenueTableRef, "service_revenue_report")}
                >
                  Download<AiOutlineDownload style={{ marginLeft: '8px' }} />
                </button>
              </div>
            )}
          </div>

          {selectedCategory !== 'Service' && (
            <div className="download-container">
              <button
                className="download-btn"
                onClick={() => handleDownloadClick(financialTableRef, "financial_report")}
              >
                Download<AiOutlineDownload style={{ marginLeft: '8px' }} />
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="chart-container" style={{ height: '400px' }}>
        {getCategoryData() && (
          selectedCategory === 'Service' ? (
            <Bar data={getCategoryData()} options={chartOptions} />
          ) : (
            <Line data={getCategoryData()} options={chartOptions} />
          )
        )}
      </div>

      <table id="financial-table" ref={financialTableRef} className="table table-bordered" style={{ display: 'none' }}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Month</th>
            {serviceMain.map((service, index) => (
              <th key={index} colSpan="2">
                {service}
              </th>
            ))}
          </tr>
          <tr>
            <th></th>
            <th></th>
            {serviceMain.map(() => (
              <React.Fragment key={`currency-headers-${Math.random()}`}>
                <th>BTN</th>
                <th>USD</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month) => {
            const monthRevenue = getRevenueByMonthAndService().get(month) || new Map();

            return (
              <tr key={`${selectedYear}-${month}`}>
                <td>{selectedYear}</td>
                <td>{month}</td>
                {serviceMain.map((service) => {
                  const revenueData = monthRevenue.get(service) || { priceBTN: 0, priceUSD: 0 };
                  return (
                    <React.Fragment key={`${service}-${month}`}>
                      <td>{revenueData.priceBTN.toLocaleString()}</td>
                      <td>{revenueData.priceUSD.toLocaleString()}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <table id="service-revenue-table" ref={serviceRevenueTableRef} className="table table-bordered" style={{ display: 'none' }}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Month</th>
            <th>Service</th>
            <th>Revenue (BTN)</th>
            <th>Revenue (USD)</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredServiceRevenueData().map((item, index) => (
            <tr key={index}>
              <td>{item.year}</td>
              <td>{item.month}</td>
              <td>{item.service}</td>
              <td>{item.revenueBTN.toLocaleString()}</td>
              <td>{item.revenueUSD.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ServiceRevenueComponent;