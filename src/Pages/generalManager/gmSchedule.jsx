import React, { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import AdminHeader from '../../Components/adminheader';
import './../Css/sschedules.css';
import SAdminSchedule from '../Super Admin/SAmodal';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as XLSX from 'xlsx';

function GeneralSchedules() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [passengers, setPassenger] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedRoute, setSelectedRoute] = useState("ALL");

  const filterPassenger = (id) => {
    const filter = passengers.filter(passenger => passenger.booking_id === id);
    setSelectedPassengers(filter);
  }

  const openModal = (booking) => {
    filterPassenger(booking._id);
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const prepareExcelData = (bookings, allPassengers) => {
    const sheets = {};

    const scheduleData = bookings.map((booking, index) => ({
      'Sl. No': index + 1,
      'Time': booking.departure_time,
      'Date': booking.flight_date,
      'Pickup Point': booking.pickup_point,
      'Destination': booking.destination === null ? booking.destination_other : booking.destination.sector,
      'Assigned Pilot': booking.assigned_pilot?.name || 'Not Assigned',
      'Status': booking.status,
      'Client/Agent Name': booking.agent_name,
      'Phone Number': booking.agent_contact,
      'CID': booking.agent_cid,
      'Email': booking.agent_email,
      'Ground Time': booking.ground_time || 'N/A',
      'Private Helipad Permission': booking.permission ? "Yes" : "No",
      'Service Type': booking.service_id?.name || 'N/A',
      'Booking Type': booking.booking_type,
      'Payment Type': booking.payment_type,
      'Price (Nu.)': '150,000'
    }));
    sheets['Schedule'] = scheduleData;

    const passengerData = allPassengers.map((passenger, index) => ({
      'Sl. No': index + 1,
      'Booking ID': passenger.booking_id,
      'Name': passenger.name,
      'Gender': passenger.gender,
      'Weight (Kg)': passenger.weight,
      'Baggage Weight (Kg)': passenger.bagWeight,
      'Passport/CID': passenger.cid,
      'Contact No': passenger.contact,
      'Medical Issue': passenger.medIssue || 'None'
    }));
    sheets['Passengers'] = passengerData;

    return sheets;
  };

  const handleDownload = () => {
    Swal.fire({
      title: "Download Schedule Data",
      text: "Do you want to download the schedule data as Excel file?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, download it!",
      cancelButtonText: "No, cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const excelData = prepareExcelData(filteredBookings, passengers);
          const wb = XLSX.utils.book_new();

          const wsSchedule = XLSX.utils.json_to_sheet(excelData.Schedule);
          const scheduleColWidths = [
            { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 25 },
            { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
            { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }
          ];
          wsSchedule['!cols'] = scheduleColWidths;

          const wsPassengers = XLSX.utils.json_to_sheet(excelData.Passengers);
          const passengerColWidths = [
            { wch: 8 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
            { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 30 }
          ];
          wsPassengers['!cols'] = passengerColWidths;

          [wsSchedule, wsPassengers].forEach(ws => {
            const range = XLSX.utils.decode_range(ws['!ref']);

            for (let C = range.s.c; C <= range.e.c; ++C) {
              const address = XLSX.utils.encode_col(C) + "1";
              if (!ws[address]) continue;
              ws[address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                alignment: { horizontal: "center", vertical: "center" },
                fill: { fgColor: { rgb: "1E306D" } }
              };
            }

            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
              for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[address]) continue;
                ws[address].s = {
                  alignment: { horizontal: "center", vertical: "center" },
                  font: { color: { rgb: "000000" } },
                  fill: { fgColor: { rgb: "FFFFFF" } }
                };
              }
            }
          });

          XLSX.utils.book_append_sheet(wb, wsSchedule, 'Schedule');
          XLSX.utils.book_append_sheet(wb, wsPassengers, 'Passengers');

          const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
          const fileName = `generalManager-schedule-${date}.xlsx`;
          XLSX.writeFile(wb, fileName);

          Swal.fire({
            title: "Success!",
            text: "Schedule data has been downloaded successfully!",
            icon: "success",
            confirmButtonColor: "#1E306D",
            timer: 1500,
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Failed to download schedule data",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };


  // Sorting bookings based on flight date

  const handleSortOrderChange = (e) => {
    const newOrder = e.target.value;
    setSortOrder(newOrder);

    // Sort the bookings based on flight date
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = new Date(a.flight_date.split('/').reverse().join('-'));
      const dateB = new Date(b.flight_date.split('/').reverse().join('-'));

      return newOrder === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    setBookings(sortedBookings);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://helistaging.drukair.com.bt/api/bookings');
        const fetchedBookings = response.data.data || [];
        const processedBookings = fetchedBookings
          .filter((booking) => booking.status !== "Booked")
          .sort((a, b) => {
            const dateA = new Date(a.flight_date);
            const dateB = new Date(b.flight_date);
            return sortOrder === "asc"
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime();
          })
          .map(booking => ({
            ...booking,
            flight_date: new Date(booking.flight_date).toLocaleDateString('en-GB'),
            assigned_pilot: booking.assigned_pilot ? {
              ...booking.assigned_pilot,
              name: booking.assigned_pilot.name || 'Not Assigned'
            } : null
          })).filter(booking => booking.status !== "Booked");

        setBookings(processedBookings);

      } catch (error) {
        Swal.fire({
          title: "Information",
          text: "There are no bookings currently!",
          icon: "info",
          confirmButtonColor: "#1E306D",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPassenger = async () => {
      try {
        const response = await axios.get(
          "https://helistaging.drukair.com.bt/api/passengers"
        );
        setPassenger(response.data.data);
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
    fetchPassenger();
  }, [bookings]);

  useEffect(() => {
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(
        booking.flight_date.split("/").reverse().join("-")
      );
      const searchDate = selectedDate ? new Date(selectedDate) : null;

      const matchesSearch = Object.values(booking).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDate =
        !searchDate ||
        (bookingDate.getFullYear() === searchDate.getFullYear() &&
          bookingDate.getMonth() === searchDate.getMonth() &&
          bookingDate.getDate() === searchDate.getDate());

      const matchesCurrency =
        selectedCurrency === "ALL" ||
        (selectedCurrency === "BTN" && booking.cType === "BTN") ||
        (selectedCurrency === "USD" && booking.cType === "USD");

      const matchesRoute =
        selectedRoute === "ALL" ||
        (selectedRoute === "PUBLISHED" && booking.route_type === "Published") ||
        (selectedRoute === "UNPUBLISHED" && booking.route_type === "Unpublished");

      return matchesSearch && matchesDate && matchesCurrency && matchesRoute;
    });

    setFilteredBookings(filteredBookings);
    setCurrentPage(1);
  }, [searchTerm, selectedDate, selectedCurrency, bookings, selectedRoute]);

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleRouteChange = (e) => {
    setSelectedRoute(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <main className="super-admin-table-container">
      <div className='super-admin-title'>
        <AdminHeader title="General Manager Schedules" />
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
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="booking-filter-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <input
              type="date"
              className="booking-filter-select"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <select
              className="booking-filter-select"
              value={selectedCurrency}
              onChange={handleCurrencyChange}
            >
              <option value="ALL">All Currencies</option>
              <option value="BTN">BTN</option>
              <option value="USD">USD</option>
            </select>
            <select
              className="booking-filter-select"
              value={selectedRoute}
              onChange={handleRouteChange}
            >
              <option value="ALL">All Routes</option>
              <option value="PUBLISHED">Published Routes</option>
              <option value="UNPUBLISHED">Unpublished Routes</option>
            </select>
            <button className="download-btn" onClick={handleDownload}>
              Download <FiDownload style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>

        <table className="booking-table">
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Booking ID</th>
              <th>Departure Time</th>
              <th>Date Of Flight</th>
              <th>Destination</th>
              <th>Payment Status</th>
              <th>Route Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking, index) => (
              <tr key={booking._id} onClick={() => openModal(booking)} className='booking-table-row-hover'>
                <td>{indexOfFirstBooking + index + 1}</td>
                <td>{booking.bookingID}</td>
                <td>{booking.departure_time}</td>
                <td>{booking.flight_date}</td>
                <td>{booking.destination === null ? booking.destination_other : booking.destination.sector}</td>
                <td>{booking.payment_status}</td>
                <td>{booking.route_type}</td>
                <td>{booking.status}</td>
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

        <p className="booking-results-count">{bookings.length} Results</p>
      </div>

      <SAdminSchedule
        isOpen={isModalOpen}
        onClose={closeModal}
        booking={selectedBooking}
        passengers={selectedPassengers}
        viewOnly={true}
      />
    </main>
  );
}

export default GeneralSchedules;