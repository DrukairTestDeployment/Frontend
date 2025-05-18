import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import 'chart.js/auto';
import { AiOutlineDownload } from 'react-icons/ai';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

import reservationData from './Reservation.json';

function ReservationComponent() {
  const [reservationResult, setReservationResult] = useState([]);
  const [selectedReservationCategory, setSelectedReservationCategory] = useState('HEMS');

  const reservationTableRef = useRef(null);

  useEffect(() => {
    setReservationResult(reservationData);
  }, []);

  const months = reservationResult.map(item => item.month);
  const hemsReservations = reservationResult.map(item => item.emergency_services?.HEMS?.actual || 0);
  const lcSubsidizedReservations = reservationResult.map(item => item.emergency_services?.LC_subsidized?.actual || 0);
  const lcRgobReservations = reservationResult.map(item => item.charter_services?.LC_RGOB?.actual || 0);
  const lcReservations = reservationResult.map(item => item.charter_services?.LC?.actual || 0);
  const tcReservations = reservationResult.map(item => item.charter_services?.TC?.actual || 0);

  const createReservationChartData = (label, data, color) => ({
    labels: months,
    datasets: [
      {
        label: `${label} (Reservations)`,
        data: data,
        fill: false,
        backgroundColor: color,
        borderColor: color,
        tension: 0.1,
      },
    ],
  });

  const reservationChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reservations',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  const getReservationCategoryData = () => {
    switch (selectedReservationCategory) {
      case 'HEMS':
        return createReservationChartData('HEMS', hemsReservations, 'rgba(75, 192, 192, 0.6)');
      case 'LC-Subsidized':
        return createReservationChartData('LC-Subsidized', lcSubsidizedReservations, 'rgba(255, 99, 132, 0.6)');
      case 'LC-RGOB':
        return createReservationChartData('LC-RGOB', lcRgobReservations, 'rgba(54, 162, 235, 0.6)');
      case 'LC':
        return createReservationChartData('LC', lcReservations, 'rgba(255, 206, 86, 0.6)');
      case 'TC':
        return createReservationChartData('TC', tcReservations, 'rgba(153, 102, 255, 0.6)');
      default:
        return createReservationChartData('HEMS', hemsReservations, 'rgba(75, 192, 192, 0.6)');
    }
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
        const table = tableRef.current;
        if (table) {
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.table_to_sheet(table);
          XLSX.utils.book_append_sheet(wb, ws, "Sheet JS");
          XLSX.writeFile(wb, `${filename}.xlsx`);
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

  return (
    <div className="container">
      <div className="controls-container">
        <div className="dropdown-container">
          <label htmlFor="reservation-category-select"></label>
          <select
            id="reservation-category-select"
            value={selectedReservationCategory}
            onChange={(e) => setSelectedReservationCategory(e.target.value)}
          >
            <option value="HEMS">HEMS</option>
            <option value="LC-Subsidized">LC-Subsidized</option>
            <option value="LC-RGOB">LC-RGOB</option>
            <option value="LC">LC</option>
            <option value="TC">TC</option>
          </select>
        </div>

        <div className="download-container">
          <button
            className="download-btn"
            onClick={() => handleDownloadClick(reservationTableRef, "reservation_report")}
          >
            Download<AiOutlineDownload style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </div>

      <div className="chart-container">
        <Line data={getReservationCategoryData()} options={reservationChartOptions} />
      </div>

      <table id="reservation-table" ref={reservationTableRef} style={{ display: 'none' }}>
        <thead>
          <tr>
            <th>Month</th>
            <th>HEMS</th>
            <th>LC-Subsidized</th>
            <th>LC-RGOB</th>
            <th>LC</th>
            <th>TC</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, index) => (
            <tr key={month}>
              <td>{month}</td>
              <td>{hemsReservations[index]}</td>
              <td>{lcSubsidizedReservations[index]}</td>
              <td>{lcRgobReservations[index]}</td>
              <td>{lcReservations[index]}</td>
              <td>{tcReservations[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationComponent;