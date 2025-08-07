import React, { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import AdminHeader from '../../Components/adminheader';
import './../Css/adminBookings.css';
import AdminScheduleModal from '../../Components/AdminScheduleModal';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as XLSX from 'xlsx';
import HelicopterLoader from "../../Components/HelicopterLoader";

function AdminSchedule() {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [legs, setLeg] = useState([]);
  const [selectedLegs, setSelectedLegs] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedRoute, setSelectedRoute] = useState("ALL");
  const [id, setID] = useState("");

  const filterPassengers = (id) => {
    const filtered = passengers.filter(passenger => passenger.booking_id === id);
    setSelectedPassengers(filtered);
  };

  const filterLeg = (id) => {
    const filter = legs.filter(
      (leg) => leg.booking_id === id
    );
    setSelectedLegs(filter);
  };

  const openModal = (booking) => {
    filterLeg(booking._id);
    filterPassengers(booking._id);
    setSelectedBooking(booking);
    setID(booking._id);
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
      'Price (Nu.)': booking.bookingPriceBTN
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
      'Medical Issue': passenger.medIssue || 'None',
    }));
    sheets['Passengers'] = passengerData;

    return sheets;
  };

  const handleDownload = () => {
    Swal.fire({
      title: "Download Schedule Data",
      text: "Do you want to download the complete schedule data as Excel file?",
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
            { wch: 8 },
            { wch: 15 },
            { wch: 15 },
            { wch: 25 },
            { wch: 25 },
            { wch: 20 },
            { wch: 15 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }
          ];
          wsSchedule['!cols'] = scheduleColWidths;

          const wsPassengers = XLSX.utils.json_to_sheet(excelData.Passengers);
          const passengerColWidths = [
            { wch: 8 },
            { wch: 20 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 30 }
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
          const fileName = `admin-schedule-${date}.xlsx`;
          XLSX.writeFile(wb, fileName);

          Swal.fire({
            title: "Success!",
            text: "Complete schedule data has been downloaded successfully!",
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

  const postPassenger = async (passenger, rid) => {
    // for (const passenger of passengers) {
    try {
      if (passenger._id) {
        await axios.patch(`https://helistaging.drukair.com.bt/api/passengers/${passenger._id}`, {
          name: passenger.name,
          weight: passenger.weight,
          cid: passenger.cid,
          bagWeight: passenger.bagWeight,
          gender: passenger.gender,
          medIssue: passenger.medIssue,
          contact: passenger.contact,
          remarks: passenger.remarks,
        });
      } else {
        await axios.post("https://helistaging.drukair.com.bt/api/passengers", {
          name: passenger.name,
          weight: passenger.weight,
          cid: passenger.cid,
          bagWeight: passenger.bagWeight,
          gender: passenger.gender,
          medIssue: passenger.medIssue,
          contact: passenger.contact,
          booking_id: id,
          leg_id: rid,
          remarks: passenger.remarks,
        });
      }

    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response
          ? error.response.data.message
          : "An error occurred",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
    // }
  };

  const postRoute = async (route) => {
    // for (const passenger of passengers) {
    try {
      if (route._id) {
        const response = await axios.patch(`https://helistaging.drukair.com.bt/api/leg/${route._id}`, {
          name: route.name,
        });
        if (response.data.status === "success") {
          for (const passenger of route.passengers) {
            await postPassenger(passenger, response.data.data._id);
          }
        } else {
          throw new Error(
            response.data.message || "Failed to update booking"
          );
        }
      } else {
        const response = await axios.post("https://helistaging.drukair.com.bt/api/leg", {
          name: route.name,
          booking_id: id,
        });
        if (response.data.status === "success") {
          for (const passenger of route.passengers) {
            await postPassenger(passenger, response.data.data._id);
          }
        } else {
          throw new Error(
            response.data.message || "Failed to update booking"
          );
        }
      }

    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response
          ? error.response.data.message
          : "An error occurred",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  }

  const onUpdate = async (updatedBookingData, routes, images) => {
    let price = 0;
    if (
      updatedBookingData.payment_status === "Paid" &&
      (!updatedBookingData.cType || updatedBookingData.cType === "None")
    ) {
      Swal.fire({
        title: "Missing Currency Type",
        text: "Please select a currency type",
        icon: "warning",
      });
      return;
    }

    if (parseInt(updatedBookingData.duration) === 0) {
      Swal.fire({
        title: "Missing duration",
        text: "Please enter the duration",
        icon: "warning",
      });
      return;
    }

    if (updatedBookingData.cType === "USD") {
      price = updatedBookingData.bookingPriceUSD;
    } else if (updatedBookingData.cType === "BTN") {
      price = updatedBookingData.bookingPriceBTN;
    }
    Swal.fire({
      title: "",
      text: "Are you sure you want to make changes to this booking?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Booking"
    }).then(async (result) => {
      if (result.isConfirmed && (updatedBookingData.payment_type !== 'Bank Transfer' && updatedBookingData.payment_type !== 'MBoB')) {
        setLoading(true);
        try {
          const response = await axios.patch(
            `https://helistaging.drukair.com.bt/api/bookings/${updatedBookingData._id}`,
            {
              status: updatedBookingData.status,
              assigned_pilot: updatedBookingData.assigned_pilot || null,
              refund_id: updatedBookingData.refund_id,
              payable: updatedBookingData.payable,

              // Update
              duration: updatedBookingData.duration,
              bookingPriceBTN: updatedBookingData.bookingPriceBTN,
              bookingPriceUSD: updatedBookingData.bookingPriceUSD,
              agent_name: updatedBookingData.agent_name,
              agent_contact: updatedBookingData.agent_contact,
              layap: updatedBookingData.layap || false,
              agent_cid: updatedBookingData.agent_cid,
              agent_email: updatedBookingData.agent_email,
              pickup_point: updatedBookingData.pickup_point,
              ground_time: updatedBookingData.ground_time,
              flight_date: updatedBookingData.flight_date?.includes('/')
                ? updatedBookingData.flight_date.split('/').reverse().join('-')
                : updatedBookingData.flight_date,
              departure_time: updatedBookingData.departure_time,
              permission: updatedBookingData.permission,
              journal_no: updatedBookingData.journal_no,
              latitude: updatedBookingData.latitude,
              Longitude: updatedBookingData.Longitude,
              payment_status: updatedBookingData.payment_status || "Not paid",
              payment_type: updatedBookingData.payment_type,
              destination: updatedBookingData.destination,
              destination_other: updatedBookingData.destination_other,
              service_id: updatedBookingData.service_id,
              cType: updatedBookingData.cType,
              price,
            }
          );
          if (response.data.status === "success") {
            for (const route of routes) {
              await postRoute(route);
            }
            Swal.fire({
              title: "",
              text: "Booking Updated Successfully",
              icon: "success",
              confirmButtonColor: "#1E306D",
              timer: 1500
            });
            const updatedBookings = bookings.map(booking =>
              booking._id === updatedBookingData._id
                ? {
                  ...booking,
                  status: updatedBookingData.status,
                  assigned_pilot: updatedBookingData.assigned_pilot ? {
                    ...updatedBookingData.assigned_pilot,
                    name: updatedBookingData.assigned_pilot.name || 'Not Assigned',
                    // UPDATED
                    agent_name: booking.agent_name,
                    agent_contact: booking.agent_contact,
                    agent_cid: booking.agent_cid,
                    agent_email: booking.agent_email,
                    pickup_point: booking.pickup_point,
                    ground_time: booking.ground_time,
                    flight_date: booking.flight_date,
                    departure_time: booking.departure_time,
                    permission: booking.permission,
                    // booking_type: booking.booking_type,
                    payment_status: booking.payment_status,
                    journal_no: booking.journal_no,
                    latitude: booking.latitude,
                    Longitude: booking.Longitude

                  } : null,
                  refund: updatedBookingData.refund,
                  duration: updatedBookingData.duration,
                  price,
                }
                : booking
            );
            // console.log(updatedBookings) 
            setBookings(updatedBookings);
            setFilteredBookings(updatedBookings);
            setModalOpen(false);
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || "Failed to update booking",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK"
          });
        } finally {
          setLoading(false)
        }
      } else if (result.isConfirmed && (updatedBookingData.payment_type === "Bank Transfer" || updatedBookingData.payment_type === 'MBoB')) {
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('payment_type', updatedBookingData.payment_type);
          formData.append('status', updatedBookingData.status);
          if (updatedBookingData?.assigned_pilot !== null) {
            formData.append('assigned_pilot', updatedBookingData.assigned_pilot);
          }
          formData.append('refund_id', updatedBookingData.refund_id);
          formData.append('image', updatedBookingData.paymentScreenShot);
          formData.append('journal_no', updatedBookingData.journal_no);


          // updated 
          formData.append('agent_name', updatedBookingData.agent_name);
          formData.append('agent_contact', updatedBookingData.agent_contact);
          formData.append('agent_cid', updatedBookingData.agent_cid);
          formData.append('agent_email', updatedBookingData.agent_email);
          formData.append('pickup_point', updatedBookingData.pickup_point);
          formData.append('ground_time', updatedBookingData.ground_time);
          formData.append('flight_date', updatedBookingData.flight_date?.includes('/')
                ? updatedBookingData.flight_date.split('/').reverse().join('-')
                : updatedBookingData.flight_date);
          formData.append('departure_time', updatedBookingData.departure_time);
          formData.append('permission', updatedBookingData.permission);
          formData.append('latitude', updatedBookingData.latitude);
          formData.append('Longitude', updatedBookingData.Longitude);
          formData.append('duration', updatedBookingData.duration);
          formData.append('bookingPriceBTN', updatedBookingData.bookingPriceBTN);
          formData.append('bookingPriceUSD', updatedBookingData.bookingPriceUSD);
          formData.append('payable', updatedBookingData.payable || false);
          formData.append('layap', updatedBookingData.layap || false);
          formData.append('payment_status', updatedBookingData.payment_status || "Not paid");
          formData.append('destination', updatedBookingData.destination);
          formData.append('destination_other', updatedBookingData.destination_other);
          formData.append('service_id', typeof updatedBookingData.service_id === 'object'
            ? updatedBookingData.service_id._id
            : updatedBookingData.service_id);
          formData.append('cType', updatedBookingData.cType);
          formData.append("price", price);
          images.forEach((img) => {
            formData.append('image', img.file); // `images` must match multer.array('images', 10)
          });

          const response = await axios.patch(
            `https://helistaging.drukair.com.bt/api/bookings/imageupdate/${updatedBookingData._id}`, formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          if (response.data.status === "success") {
            for (const route of routes) {
              await postRoute(route)
            }
            Swal.fire({
              title: "",
              text: "Booking Updated Successfully",
              icon: "success",
              confirmButtonColor: "#1E306D",
              timer: 1500
            });
            const updatedBookings = bookings.map(booking =>
              booking._id === updatedBookingData._id
                ? {
                  ...booking,
                  status: updatedBookingData.status,
                  assigned_pilot: updatedBookingData.assigned_pilot ? {
                    ...updatedBookingData.assigned_pilot,
                    name: updatedBookingData.assigned_pilot.name || 'Not Assigned'
                  } : null,
                  refund: updatedBookingData.refund,
                  duration: updatedBookingData.duration,
                  permission: updatedBookingData.permission
                }
                : booking
            );
            setBookings(updatedBookings);
            setFilteredBookings(updatedBookings);
            setModalOpen(false);

          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || "Failed to update booking",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK"
          });
        } finally {
          setLoading(false)
        }
      }
    });
  };

  useEffect(() => {
    const filterBookings = () => {
      return bookings.filter((booking) => {
        const matchesSearch = Object.values(booking).some(
          (value) =>
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!selectedDate) return matchesSearch;

        const [day, month, year] = booking.flight_date.split('/');
        const bookingDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return matchesSearch && bookingDate === selectedDate;
      });
    };

    setFilteredBookings(filterBookings());
    setCurrentPage(1);
  }, [searchTerm, selectedDate, bookings]);

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
          .filter((booking) => booking.status !== "Booked" && booking.status !== "Pending")
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
          })).filter(booking => booking.status !== "Booked" && booking.status !== "Pending");

        setBookings(processedBookings);

        // const processedBookings = fetchedBookings.map(booking => ({
        //   ...booking,
        //   flight_date: new Date(booking.flight_date).toLocaleDateString('en-GB'),
        //   assigned_pilot: booking.assigned_pilot ? {
        //     ...booking.assigned_pilot,
        //     name: booking.assigned_pilot.name || 'Not Assigned'
        //   } : null
        // })).filter(booking => booking.status !== "Booked");

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
    const fetchLeg = async () => {
      try {
        const response = await axios.get(
          "https://helistaging.drukair.com.bt/api/leg"
        );
        setLeg(response.data.data);
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
    fetchLeg();
  }, [bookings]);

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const response = await axios.get(
          "https://helistaging.drukair.com.bt/api/passengers"
        );
        setPassengers(response.data.data);
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
    fetchPassengers();
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
    <main className="admin-table-container">
      {loading ? (
        <HelicopterLoader />
      ) : (

        <>
          <div className='admin-title'>
            <AdminHeader title="Schedules" />
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

          <AdminScheduleModal
            isOpen={isModalOpen}
            onClose={closeModal}
            booking={selectedBooking}
            legs={selectedLegs}
            passengers = {selectedPassengers}
            onUpdate={onUpdate}
            
          />
        </>
      )}
    </main>
  );
}

export default AdminSchedule;