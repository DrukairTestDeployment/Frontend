import React, { useState, useEffect } from "react";
import "./../Css/adminBookings.css";
import AdminHeader from "../../Components/adminheader";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import AdminBookingModal from "../../Components/AdminBookingModal";
import AdminAddBookingModal from "../../Components/AdminAddBookingModal";
import Swal from "sweetalert2";
import { IoMdAddCircleOutline } from "react-icons/io";
import axios from "axios";
import HelicopterLoader from "../../Components/HelicopterLoader";

function AdminBooking() {
  const [loading, setLoading] = useState(false);
  const [Bookings, setAllBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [bookings, setBookings] = useState(Bookings);
  const [agencys, setAgency] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
  const [agencyCurrentPage, setAgencyCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [agencySearchTerm, setAgencySearchTerm] = useState("");
  const [legs, setLeg] = useState([]);
  const [selectedLegs, setSelectedLegs] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isAddBookingModalOpen, setAddBookingModalOpen] = useState(false);
  const [id, setID] = useState("");
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [newAgency, setNewAgency] = useState({
    name: "",
    code: "",
  });
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedRoute, setSelectedRoute] = useState("ALL");

  const [isUpdateAgencyModalOpen, setUpdateAgencyModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [newAssignAgency, setNewAssignAgency] = useState({
    name: "",
  });
  const [showAssignAgencyModal, setShowAssignAgencyModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleAsignFormChange = (e) => {
    const { name, value } = e.target;
    setNewAssignAgency((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeAssignAgencyModal = () => {
    setShowAssignAgencyModal(false);
    setSelectedBookingId(null);
    setNewAssignAgency({ name: "" });
  };
  const openUpdateAgencyModal = (agency) => {
    setSelectedAgency(agency);
    setUpdateAgencyModalOpen(true);
  };

  const closeUpdateAgencyModal = () => {
    setUpdateAgencyModalOpen(false);
    setSelectedAgency(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://helistaging.drukair.com.bt/api/agents");
        setAgency(Array.isArray(response.data.data) ? response.data.data : []);
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
  }, [newAgency, selectedAgency]);

  // Sorting bookings based on flight date

  const handleSortOrderChange = (e) => {
    const newOrder = e.target.value;
    setSortOrder(newOrder);

    // Sort the bookings based on flight date
    const sortedBookings = [...Bookings].sort((a, b) => {
      const dateA = new Date(a.flight_date.split('/').reverse().join('-'));
      const dateB = new Date(b.flight_date.split('/').reverse().join('-'));

      return newOrder === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    setAllBookings(sortedBookings);
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`https://helistaging.drukair.com.bt/api/bookings`, {
          withCredentials: true
        });
        const fetchedBookings = response.data.data || [];

        const processedBookings = fetchedBookings
          .filter((booking) => booking.status === "Booked" || booking.status === "Pending")
          .sort((a, b) => {
            const dateA = new Date(a.flight_date);
            const dateB = new Date(b.flight_date);
            return sortOrder === "asc"
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime();
          })
          .map((booking) => ({
            ...booking,
            flight_date: new Date(booking.flight_date).toLocaleDateString("en-GB"),
          }));

        setAllBookings(processedBookings);
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
    };
    fetchBooking();
  }, [sortOrder]);

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
  }, [Bookings]);

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
  }, [Bookings]);

  const handleUpdateAgency = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "",
      text: "Are you sure you want to make changes to this agent?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Agent",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(
            `https://helistaging.drukair.com.bt/api/agents/${selectedAgency._id}`,
            {
              name: selectedAgency.name,
              code: selectedAgency.code,
            }
          );
          if (response.data.status === "success") {
            Swal.fire({
              title: "Success!",
              text: "Agency Updated Successfully",
              icon: "success",
              confirmButtonColor: "#1E306D",
              confirmButtonText: "OK",
            });
          }
          setSelectedAgency(null);
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.response
              ? error.response.data.message
              : "Error updating agent",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      }
    });
    closeUpdateAgencyModal();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewAgency({ ...newAgency, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "",
      text: "Are you sure you want to add this agent?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1E306D",
      confirmButtonText: "Yes, add it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `https://helistaging.drukair.com.bt/api/agents`,
            {
              name: newAgency.name,
              code: newAgency.code,
            }
          );
          if (response.data.status === "success") {
            Swal.fire({
              title: "Success!",
              text: "Agent Added Successfully",
              icon: "success",
              confirmButtonColor: "#1E306D",
              confirmButtonText: "OK",
            });
          }
          setAgency([...agencys, { ...newAgency, id: agencys.length + 1 }]);
          setShowAgencyForm(false);
          setNewAgency({
            name: "",
            code: "",
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.response
              ? error.response.data.message
              : "Error adding agent",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const filterLeg = (id) => {
    const filter = legs.filter(
      (leg) => leg.booking_id === id
    );
    setSelectedLegs(filter);
  };

  const filterPassenger = (id) => {
    const filter = passengers.filter(
      (passenger) => passenger.booking_id === id
    );
    setSelectedPassengers(filter);
  };

  const openModal = (booking) => {
    filterLeg(booking._id);
    filterPassenger(booking._id);
    setSelectedBooking(booking);
    setID(booking._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
    setShowAgencyForm(false);
    setSelectedLegs([]);
  };

  const openAddBookingModal = () => {
    setAddBookingModalOpen(true);
  };

  const closeAddBookingModal = () => {
    setAddBookingModalOpen(false);
  };

  const declineBooking = async (bookingId) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to decline?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Decline Booking",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.post(
            `https://helistaging.drukair.com.bt/api/bookings/decline/${bookingId}`
          );
          if (response.data.status === "success") {
            Swal.fire({
              title: "",
              text: "Booking Declined Successfully",
              icon: "success",
            });
            const updatedBookings = bookings.map((booking) =>
              booking._id === bookingId
                ? { ...booking, status: "Declined", payable: false }
                : booking
            );

            setAllBookings(updatedBookings);
            window.location.reload();
          } else {
            throw new Error(
              response.data.message || "Failed to approve booking"
            );
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const acceptBooking = async (bookingId) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to accept?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Accept Booking",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.post(
            `https://helistaging.drukair.com.bt/api/bookings/approve/${bookingId}/${newAssignAgency.name}`
          );
          if (response.data.status === "success") {
            Swal.fire({
              title: "",
              text: "Booking Accepted Successfully",
              icon: "success",
            });
            const updatedBookings = Bookings.map((booking) =>
              booking._id === bookingId
                ? { ...booking, status: "Confirmed", payable: true }
                : booking
            );
            setAllBookings(updatedBookings);
            window.location.reload();
          } else {
            throw new Error(
              response.data.message || "Failed to approve booking"
            );
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.response.data.message,
            icon: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    });
    setShowAssignAgencyModal(false);
    setSelectedBookingId(bookingId);
  };

  const openAgencyModal = (id) => {
    setShowAssignAgencyModal(true);
    setSelectedBookingId(id);
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
            remarks:passenger.remarks,
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
            remarks:passenger.remarks,
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
    }
    
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
  
  const handleUpdate = async (updatedBookingData, routes, images) => {
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
      confirmButtonText: "Yes, Update Booking",
    }).then(async (result) => {
      if (result.isConfirmed && (updatedBookingData.payment_type !== 'Bank Transfer' && updatedBookingData.payment_type !== 'MBoB')) {
        setLoading(true);
        try {
          const responsePatch = await axios.patch(
            `https://helistaging.drukair.com.bt/api/bookings/${id}`,
            {
              duration: updatedBookingData.duration,
              assigned_pilot: updatedBookingData.assigned_pilot || null,
              bookingPriceBTN: updatedBookingData.bookingPriceBTN,
              bookingPriceUSD: updatedBookingData.bookingPriceUSD,
              refund_id: updatedBookingData.refund_id,
              payable: updatedBookingData.payable || false,
              layap: updatedBookingData.layap || false,
              payment_status: updatedBookingData.payment_status || "Not paid",
              payment_type: updatedBookingData.payment_type,

              // updated 
              agent_name: updatedBookingData.agent_name,
              agent_contact: updatedBookingData.agent_contact,
              agent_cid: updatedBookingData.agent_cid,
              agent_email: updatedBookingData.agent_email,
              pickup_point: updatedBookingData.pickup_point,
              ground_time: updatedBookingData.ground_time,
              flight_date: updatedBookingData.flight_date,
              departure_time: updatedBookingData.departure_time,
              permission: updatedBookingData.permission,

              status: updatedBookingData.status,
              booking_type: updatedBookingData.booking_type,
              // booking_type: booking.booking_type, 
              journal_no: updatedBookingData.journal_no,
              destination: updatedBookingData.destination,
              destination_other: updatedBookingData.destination_other,
              latitude: updatedBookingData.latitude,
              Longitude: updatedBookingData.Longitude,
              service_id: updatedBookingData.service_id,
              cType: updatedBookingData.cType,
              price,
            }
          );

          if (responsePatch.data.status === "success") {
            for (const route of routes) {
              await postRoute(route);
            }
            Swal.fire({
              title: "",
              text: "Booking Updated Successfully",
              icon: "success",
            });
            const updatedBookings = Bookings.map((booking) =>
              booking._id === id ? { ...booking, status: "Confirmed" } : booking
            );
            setAllBookings(updatedBookings);
            // window.location.reload() 
          } else {
            throw new Error(
              responsePatch.data.message || "Failed to update booking"
            );
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
          });
        } finally {
          setLoading(false);
        }
      } else if (result.isConfirmed && (updatedBookingData.payment_type === "Bank Transfer" || updatedBookingData.payment_type === 'MBoB')) {
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('duration', updatedBookingData.duration);
          formData.append('bookingPriceBTN', updatedBookingData.bookingPriceBTN);
          formData.append('bookingPriceUSD', updatedBookingData.bookingPriceUSD);
          formData.append('refund_id', updatedBookingData.refund_id);
          formData.append('payable', updatedBookingData.payable);
          formData.append('layap', updatedBookingData.layap);
          formData.append('payment_status', updatedBookingData.payment_status);
          formData.append('payment_type', updatedBookingData.payment_type);
          formData.append('image', updatedBookingData.paymentScreenShot);
          formData.append('journal_no', updatedBookingData.journal_no);
          if (updatedBookingData?.assigned_pilot !== null) {
            formData.append('assigned_pilot', updatedBookingData.assigned_pilot);
          }
          // updated 
          formData.append('agent_name', updatedBookingData.agent_name);
          formData.append('agent_contact', updatedBookingData.agent_contact);
          formData.append('agent_cid', updatedBookingData.agent_cid);
          formData.append('agent_email', updatedBookingData.agent_email);
          formData.append('pickup_point', updatedBookingData.pickup_point);
          formData.append('ground_time', updatedBookingData.ground_time);
          formData.append('flight_date', updatedBookingData.flight_date);
          formData.append('departure_time', updatedBookingData.departure_time);
          formData.append('permission', updatedBookingData.permission);

          formData.append('status', updatedBookingData.status);
          formData.append('booking_type', updatedBookingData.booking_type);
          // formData.append('journal_no', updatedBookingData.journal_no); 
          formData.append('latitude', updatedBookingData.latitude);
          formData.append('Longitude', updatedBookingData.Longitude);
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

          const responsePatch = await axios.patch(
            `https://helistaging.drukair.com.bt/api/bookings/imageupdate/${id}`, formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          if (responsePatch.data.status === "success") {
            for (const route of routes) {
              await postRoute(route);
            }
            Swal.fire({
              title: "",
              text: "Booking Updated Successfully",
              icon: "success",
            });
            const updatedBookings = Bookings.map((booking) =>
              booking._id === id ? { ...booking, status: "Confirmed" } : booking
            );
            setAllBookings(updatedBookings);
            window.location.reload()
          } else {
            throw new Error(
              responsePatch.data.message || "Failed to update booking"
            );
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    });
    closeModal();
    setShowAssignAgencyModal(false);
  };

  const deleteAgency = (aid) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to delete this agency?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E306D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `https://helistaging.drukair.com.bt/api/agents/${aid}`
          );
          if (response.data.status === "success") {
            Swal.fire({
              title: "Success!",
              text: "Agent Deleted Successfully",
              icon: "success",
              confirmButtonColor: "#1E306D",
              confirmButtonText: "OK",
            });
          }
          setSelectedAgency({
            name: "",
            code: "",
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Error deleting data",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  useEffect(() => {
    const filteredBookings = Bookings.filter((booking) => {
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
        (selectedRoute === "UNPUBLISHED" &&
          booking.route_type === "Unpublished");

      return matchesSearch && matchesDate && matchesCurrency && matchesRoute;
    });

    setBookings(filteredBookings);
    setBookingCurrentPage(1);
  }, [searchTerm, selectedDate, selectedCurrency, Bookings, selectedRoute]);

  useEffect(() => {
    const filtered = agencys.filter(
      (agency) =>
        agency.name.toLowerCase().includes(agencySearchTerm.toLowerCase()) ||
        agency.code.toLowerCase().includes(agencySearchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
    setAgencyCurrentPage(1);
  }, [agencySearchTerm, agencys]);

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  const handleRouteChange = (e) => {
    setSelectedRoute(e.target.value);
  };

  const handleAgencySearchChange = (e) => {
    setAgencySearchTerm(e.target.value);
  };

  const indexOfLastBooking = bookingCurrentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = bookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const bookingTotalPages = Math.ceil(bookings.length / itemsPerPage);

  const handleBookingPageChange = (pageNumber) => {
    setBookingCurrentPage(pageNumber);
  };

  const indexOfLastAgency = agencyCurrentPage * itemsPerPage;
  const indexOfFirstAgency = indexOfLastAgency - itemsPerPage;
  const currentAgencies = filteredAgencies.slice(
    indexOfFirstAgency,
    indexOfLastAgency
  );

  const agencyTotalPages = Math.ceil(agencys.length / itemsPerPage);

  const handleAgencyPageChange = (pageNumber) => {
    setAgencyCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // console.log(bookings) 

  return (
    <main className="admin-booking-container">
      {loading ? (
        <HelicopterLoader />
      ) : (
        <>
          <div className="admin-title">
            <AdminHeader title="Bookings" />
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
                <button
                  className="booking-add-button"
                  onClick={openAddBookingModal}
                >
                  Add Booking
                  <IoMdAddCircleOutline size={20} background="#22326E" />
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking, index) => (
                  <tr
                    key={booking._id}
                    onClick={() => openModal(booking)}
                    className="booking-table-row-hover"
                  >
                    <td>{indexOfFirstBooking + index + 1}</td>
                    <td>{booking.bookingID}</td>
                    <td>{booking.departure_time}</td>
                    <td>{booking.flight_date}</td>
                    <td>
                      {booking.destination === null
                        ? booking.destination_other
                        : booking.destination.sector}
                    </td>
                    <td>{booking.payment_status}</td>
                    <td>{booking.route_type}</td>
                    <td className="booking-action-icons">
                      <button
                        className="booking-edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (booking.payment_status === "Paid" || booking.payment_status === 'Credit') {
                            openAgencyModal(booking._id);
                          } else {
                            Swal.fire({
                              title: "Information",
                              text: "The payment for this booking is incomplete!",
                              icon: "info",
                              confirmButtonColor: "#1E306D",
                              showConfirmButton: false,
                              timer: 2000,
                            });
                          }
                        }}
                      >
                        <FiCheckCircle size={20} />
                      </button>
                      <button
                        className="booking-delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          declineBooking(booking._id);
                        }}
                      >
                        <FiXCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookingTotalPages > 1 && (
              <div className="booking-pagination">
                <button
                  onClick={() =>
                    handleBookingPageChange(bookingCurrentPage - 1)
                  }
                  disabled={bookingCurrentPage === 1}
                >
                  {"<"}
                </button>

                {/* {[...Array(bookingTotalPages)].map((_, pageIndex) => (
                  <button
                    key={pageIndex + 1}
                    onClick={() => handleBookingPageChange(pageIndex + 1)}
                    className={
                      bookingCurrentPage === pageIndex + 1 ? "active-page" : ""
                    }
                  >
                    {pageIndex + 1}
                  </button>
                ))} */}

                {/* Pagination test  */}
                {[...Array(bookingTotalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isFirst = pageNumber === 1;
                  const isLast = pageNumber === bookingTotalPages;
                  const isCurrent = pageNumber === bookingCurrentPage;
                  const isNearCurrent = Math.abs(pageNumber - bookingCurrentPage) <= 1;

                  if (isFirst || isLast || isCurrent || isNearCurrent) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handleBookingPageChange(pageNumber)}
                        className={isCurrent ? "active-page" : ""}
                      >
                        {pageNumber}
                      </button>
                    );
                  }

                  if (
                    pageNumber === bookingCurrentPage - 2 ||
                    pageNumber === bookingCurrentPage + 2
                  ) {
                    return <span key={`dots-${pageNumber}`}>...</span>;
                  }

                  return null;
                })}


                <button
                  onClick={() =>
                    handleBookingPageChange(bookingCurrentPage + 1)
                  }
                  disabled={bookingCurrentPage === bookingTotalPages}
                >
                  {">"}
                </button>
              </div>
            )}

            <p className="booking-results-count">{bookings.length} Results</p>
          </div>

          {/* assign agency modal */}
          {showAssignAgencyModal && (
            <div className="service-modal-overlay agency-modal-overlay">
              <div className="service-modal-content">
                <span
                  className="service-modal-close-button"
                  onClick={closeAssignAgencyModal}
                >
                  &times;
                </span>
                <div className="form-title"> Asign Agency Form</div>
                <form
                  className="service-admin-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // console.log("selectedBookingID", selectedBookingId); 
                    if (!selectedBookingId) {
                      handleUpdate();
                    } else {
                      acceptBooking(selectedBookingId);
                    }
                  }}
                >
                  <div className="popup-title">Details</div>
                  <div className="service-form-columns">
                    <div className="service-form-column-left">
                      <div className="service-form-group">
                        <label>Agency Name</label>
                        <select
                          type="text"
                          name="name"
                          value={newAssignAgency.name}
                          onChange={handleAsignFormChange}
                          required
                        >
                          <option disabled value="">
                            Agency Name
                          </option>
                          {agencys.map((agency) => (
                            <option key={agency._id} value={agency._id}>
                              {agency.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="admin-submit-button">
                    Assign
                  </button>
                </form>
                <hr className="service-divider" />
              </div>
            </div>
          )}

          {/* Agency table */}
          <div className="admin-title">
            <AdminHeader title="Agency" />
          </div>
          <div className="booking-table-container">
            <div className="booking-table-controls">
              <div className="booking-left-controls">
                <input
                  type="text"
                  placeholder="Search Agency..."
                  className="booking-search-bar"
                  value={agencySearchTerm}
                  onChange={handleAgencySearchChange}
                />
              </div>
              <div className="booking-right-controls">
                <button
                  className="booking-add-button"
                  onClick={() => setShowAgencyForm(true)}
                >
                  Add Agency{" "}
                  <IoMdAddCircleOutline size={20} background="#22326E" />
                </button>
              </div>
            </div>

            {/* add agency modal */}
            {showAgencyForm && (
              <div className="service-modal-overlay">
                <div className="service-modal-content">
                  <span
                    className="service-modal-close-button"
                    onClick={closeModal}
                  >
                    &times;
                  </span>
                  <div className="form-title">Agency Form</div>
                  <form
                    className="service-admin-form"
                    onSubmit={handleFormSubmit}
                  >
                    <div className="popup-title">Details</div>
                    <div className="service-form-columns">
                      <div className="service-form-column-left">
                        <div className="service-form-group">
                          <label>Agency Name</label>
                          <input
                            type="text"
                            name="name"
                            value={newAgency.name}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="service-form-column-right">
                        <div className="service-form-group">
                          <label>Code</label>
                          <input
                            type="code"
                            name="code"
                            value={newAgency.code}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      </div>
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
                  <th>Name</th>
                  <th>Code</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentAgencies.map((agency, index) => (
                  <tr
                    key={agency._id}
                    onClick={() => openUpdateAgencyModal(agency)}
                    className="booking-table-row-hover"
                  >
                    <td>{indexOfFirstAgency + index + 1}</td>
                    <td>{agency.name}</td>
                    <td>{agency.code}</td>
                    <td className="booking-action-icons">
                      <button
                        className="booking-delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAgency(agency._id);
                        }}
                      >
                        <FiXCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {agencyTotalPages > 1 && (
              <div className="booking-pagination">
                <button
                  onClick={() => handleAgencyPageChange(agencyCurrentPage - 1)}
                  disabled={agencyCurrentPage === 1}
                >
                  {"<"}
                </button>
                {[...Array(agencyTotalPages)].map((_, pageIndex) => (
                  <button
                    key={pageIndex + 1}
                    onClick={() => handleAgencyPageChange(pageIndex + 1)}
                    className={
                      agencyCurrentPage === pageIndex + 1 ? "active-page" : ""
                    }
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  onClick={() => handleAgencyPageChange(agencyCurrentPage + 1)}
                  disabled={agencyCurrentPage === agencyTotalPages}
                >
                  {">"}
                </button>
              </div>
            )}

            <p className="booking-results-count">{agencys.length} Results</p>
          </div>

          {/* Update Agency Modal */}
          {isUpdateAgencyModalOpen && selectedAgency && (
            <div className="service-modal-overlay">
              <div className="service-modal-content">
                <span
                  className="service-modal-close-button"
                  onClick={closeUpdateAgencyModal}
                >
                  &times;
                </span>
                <div className="form-title">Update Agency</div>
                <form
                  className="service-admin-form"
                  onSubmit={handleUpdateAgency}
                >
                  <div className="popup-title">Details</div>
                  <div className="service-form-columns">
                    <div className="service-form-column-left">
                      <div className="service-form-group">
                        <label>Agency Name</label>
                        <input
                          type="text"
                          name="name"
                          value={selectedAgency.name}
                          onChange={(e) =>
                            setSelectedAgency({
                              ...selectedAgency,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="service-form-column-right">
                      <div className="service-form-group">
                        <label>Code</label>
                        <input
                          type="text"
                          name="code"
                          value={selectedAgency.code}
                          onChange={(e) =>
                            setSelectedAgency({
                              ...selectedAgency,
                              code: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="admin-submit-button">
                    Update
                  </button>
                </form>
              </div>
            </div>
          )}

          <AdminAddBookingModal
            isOpen={isAddBookingModalOpen}
            onClose={closeAddBookingModal}
          />

          {isModalOpen && selectedBooking && Array.isArray(selectedLegs) && (
            <AdminBookingModal
              isModalOpen={isModalOpen}
              onClose={closeModal}
              booking={selectedBooking}
              legs={selectedLegs}
              passengers = {selectedPassengers}
              onUpdate={handleUpdate}
              onOpen={openAgencyModal}
            />
          )}
        </>
      )}
    </main>
  );
}

export default AdminBooking;
