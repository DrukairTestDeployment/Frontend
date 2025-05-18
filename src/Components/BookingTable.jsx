import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import "./booking.css";
import bookingData from './Booking.json';

const BookingTable = () => {
  const [allBookings] = useState(bookingData.bookings);
  const [bookings, setBookings] = useState(allBookings);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filteredBookings = allBookings.filter((booking) =>
      Object.values(booking).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setBookings(filteredBookings);
    setCurrentPage(1);
  }, [searchTerm, allBookings]);

  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="booking-table-container">
      <h2 className="booking-table-title">Booking</h2>
      
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
          <select className="booking-filter-select">
            <option>Currency type</option>
            <option>Currency type</option>
            <option>Currency type</option>
          </select>
          <select className="booking-filter-select">
            <option>Published Route</option>
            <option>Published Route</option>
            <option>Published Route</option>
          </select>
          <button className="booking-add-button">Add Booking +</button>
        </div>
      </div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>Sl. No</th>
            <th>Time</th>
            <th>Date</th>
            <th>Pickup Point</th>
            <th>Destination</th>
            <th>Passenger</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.map((booking, index) => (
            <tr key={booking.id}>
              <td>{indexOfFirstBooking + index + 1}</td>
              <td>{booking.time}</td>
              <td>{booking.date}</td>
              <td>{booking.pickup}</td>
              <td>{booking.destination}</td>
              <td>{booking.passenger}</td>
              <td className="booking-action-icons">
                <button className="booking-edit-button">
                  <FiCheckCircle size={20} />
                </button>
                <button className="booking-delete-button">
                  <FiXCircle size={20} />
                </button>
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

      <p className="booking-results-count">{bookings.length} Results</p>
    </div>
  );
};

export default BookingTable;