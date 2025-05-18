import React, { useState, useEffect, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import 'chart.js/auto';
import { AiOutlineDownload } from 'react-icons/ai';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import axios from "axios";
import HelicopterLoader from "./HelicopterLoader";

function ServiceHoursComponent() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceMonth, setSelectedServiceMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenue, setRevenue] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceMain, setServiceMain] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState([])

  const financialTableRef = useRef(null);
  const serviceRevenueTableRef = useRef(null);

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
      const enabledServices = services.filter(service => service.status === "Enabled");
      const serviceNames = enabledServices.map(service => service.name);

      const paidBookings = bookingsResponse.data.data.filter(
        booking => booking.payment_status === "Paid"
      );

      const uniqueYears = [...new Set(paidBookings.map(booking => new Date(booking.flight_date).getFullYear()))];
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

  const getHoursByMonthAndService = () => {
    const hoursMap = new Map();

    months.forEach(month => {
      hoursMap.set(month, new Map());
    });

    if (!revenue.length) return hoursMap;

    revenue.forEach(booking => {
      const bookingDate = new Date(booking.flight_date);
      const bookingYear = bookingDate.getFullYear();

      if (bookingYear === selectedYear) {
        const serviceName = booking.service_id.name;
        // Parse duration as number, defaulting to 0 if invalid
        const duration = parseInt(booking.destination === null ? booking.duration : booking.destination.duration) || 0;
        const month = bookingDate.toLocaleString('default', { month: 'long' });

        const monthData = hoursMap.get(month);
        if (monthData) {
          monthData.set(serviceName, (monthData.get(serviceName) || 0) + duration);
        }
      }
    });

    return hoursMap;
  };

  const createChartData = (label, data, color) => ({
    labels: months,
    datasets: [
      {
        label: `${label} ${selectedYear} (Minutes)`,
        data: data,
        fill: false,
        backgroundColor: color,
        borderColor: color,
        tension: 0.1,
      },
    ],
  });

  const createBarChartData = (services, durations, color) => ({
    labels: services,
    datasets: [
      {
        label: `Duration for ${selectedServiceMonth} ${selectedYear} (Minutes)`,
        data: durations,
        backgroundColor: color,
      },
    ],
  });

  const getCategoryData = () => {
    if (isLoading || !selectedCategory) return null;

    const durationsByMonth = getHoursByMonthAndService();
    const colors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(153, 102, 255, 0.6)'
    ];

    if (selectedCategory === 'Service') {
      const monthData = durationsByMonth.get(selectedServiceMonth);
      const services = Array.from(monthData ? monthData.keys() : []);
      const durations = services.map(service => monthData ? monthData.get(service) || 0 : 0);

      return createBarChartData(services, durations, colors[0]);
    } else {
      const serviceData = months.map(month => {
        const monthData = durationsByMonth.get(month);
        return monthData ? monthData.get(selectedCategory) || 0 : 0;
      });

      return createChartData(selectedCategory, serviceData, colors[0]);
    }
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Duration (Minutes)',
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

  const getFilteredServiceDurationData = () => {
    const durationsByMonth = getHoursByMonthAndService();
    const monthDurations = durationsByMonth.get(selectedServiceMonth);

    if (!monthDurations) return [];

    return Array.from(monthDurations).map(([service, duration]) => ({
      year: selectedYear,
      month: selectedServiceMonth,
      service,
      duration: duration
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
          dataToDownload = XLSX.utils.json_to_sheet(getFilteredServiceDurationData());
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
    return <HelicopterLoader />
  }

  return (
    <div className="container">
      <div className="controls-container">
        <div className="dropdown-container">
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
                onClick={() => handleDownloadClick(serviceRevenueTableRef, "service_duration_report")}
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
              onClick={() => handleDownloadClick(financialTableRef, "duration_report")}
            >
              Download<AiOutlineDownload style={{ marginLeft: '8px' }} />
            </button>
          </div>
        )}
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
                {service} (Minutes)
              </th>
            ))}
          </tr>
          <tr>
            <th></th>
            <th></th>
            {serviceMain.map((service, index) => (
              <React.Fragment key={index}>
                <th>Actual</th>
                <th>Target</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month) => {
            const monthDurations = getHoursByMonthAndService().get(month) || new Map();

            return (
              <tr key={`${selectedYear}-${month}`}>
                <td>{selectedYear}</td>
                <td>{month}</td>
                {serviceMain.map((service, index) => {
                  const actualDuration = monthDurations.get(service);
                  const targetDuration = 0;

                  return (
                    <React.Fragment key={index}>
                      <td>{actualDuration ? actualDuration.toLocaleString() : 'N/A'}</td>
                      <td>{targetDuration ? targetDuration.toLocaleString() : 'N/A'}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <table id="service-duration-table" ref={serviceRevenueTableRef} className="table table-bordered" style={{ display: 'none' }}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Month</th>
            <th>Service</th>
            <th>Duration (Minutes)</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredServiceDurationData().map((item, index) => (
            <tr key={index}>
              <td>{item.year}</td>
              <td>{item.month}</td>
              <td>{item.service}</td>
              <td>{item.duration.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ServiceHoursComponent;