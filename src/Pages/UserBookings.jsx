import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Css/userBookings.css";
import Header from "../Components/Header";
import UserBookingHeader from "../Components/UserBookingHeader";
import { LuBookMarked } from "react-icons/lu";
import BookingDetailsModal from "../Components/BookingDetailsModal"; // Import the modal component
import Footer from "../Components/Footer";
import Swal from "sweetalert2";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function UserBookings() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [passengers, setPassenger] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [email, setEmail] = useState();
  const id = Cookies.get("token");
  const [txnTime, setTxnTime] = useState("");
  const [orderNo, setOrderNum] = useState("");
  const [commision, setCommision] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommision = async () => {
      try {
        const response = await axios.get(`http://localhost:4001/api/commision/`);
        const commision = response.data.data[0].commisionValue
        setCommision(parseFloat(commision) / 100)
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

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:4001/api/users/${id}`
          );
          setEmail(response.data.data.email);
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
    }
  }, [id]);

  useEffect(() => {
    if (email) {
      const fetchBooking = async () => {
        try {
          const response = await axios.get(
            `http://localhost:4001/api/bookings/email/all/${email}`
          );
          setBookings(response.data.data);
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
    }
  }, [email]);

  useEffect(() => {
    const fetchPassenger = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4001/api/passengers"
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
  }, []);

  const filterPassenger = (id) => {
    const filter = passengers.filter(
      (passenger) => passenger.booking_id === id
    );
    setSelectedPassengers(filter);
  };

  const openModal = (booking) => {
    filterPassenger(booking._id);
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const pad = (number) => {
    return number < 10 ? "0" + number : number;
  };

  const generateTxnTime = () => {
    const now = new Date();
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  };

  function generateOrderNo(minLength = 14) {
    let orderNo = "";
    while (orderNo.length < minLength) {
      orderNo += Math.floor(Math.random() * 10);
    }
    const extraDigits = Math.floor(Math.random() * 5);
    for (let i = 0; i < extraDigits; i++) {
      orderNo += Math.floor(Math.random() * 10);
    }
    return orderNo;
  }

  const finalPost = () => {
    document.getElementById("bfsPaymentForm").submit();
  };

  const handlePayment = async (booking) => {
    const bfs_benfTxnTime = generateTxnTime();
    const bfs_orderNo = generateOrderNo();
    setTxnTime(bfs_benfTxnTime);
    setOrderNum(bfs_orderNo);
    const formData = {
      bfs_benfBankCode: "01",
      bfs_benfId: "BE10000132",
      bfs_orderNo,
      bfs_msgType: "AR",
      bfs_paymentDesc: "Sampleproductdescription",
      bfs_remitterEmail: "pwangchuk@rbhsl.bt",
      bfs_txnAmount: booking.refund_id ? (booking.bookingPriceBTN + Number(booking.bookingPriceBTN * (booking.refund_id.plan/100))).toFixed(2) : booking.bookingPriceBTN,
      bfs_txnCurrency: "BTN",
      bfs_version: "5.0",
      bfs_benfTxnTime,
    };
    try {
      const response = await axios.post(
        "http://localhost:4001/api/bookings/signchecksum",
        formData
      );
      document.getElementById("bfs_checkSum").value = response.data.f_signature;
      document.getElementById("bfs_txnAmount").value = booking.refund_id ? (booking.bookingPriceBTN + Number(booking.bookingPriceBTN * (booking.refund_id.plan/100))).toFixed(2) : booking.bookingPriceBTN;
      finalPost()
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Error making payment",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <Header />
      <UserBookingHeader
        headerTitle="My Bookings"
        headerIcon={<LuBookMarked />}
      />
      <div className="booking-card-wrapper">
        <form
          id="bfsPaymentForm"
          method="post"
          action="https://uatbfssecure.rma.org.bt/BFSSecure/makePayment"
        >
          <input type="hidden" name="bfs_msgType" value="AR" />
          <input type="hidden" name="bfs_benfTxnTime" value={txnTime} />
          <input type="hidden" name="bfs_orderNo" value={orderNo} />
          <input type="hidden" name="bfs_benfId" value="BE10000132" />
          <input type="hidden" name="bfs_benfBankCode" value="01" />
          <input type="hidden" name="bfs_txnCurrency" value="BTN" />
          <input type="hidden" name="bfs_txnAmount" id="bfs_txnAmount" />
          <input
            type="hidden"
            name="bfs_remitterEmail"
            value="pwangchuk@rbhsl.bt"
          />
          <input type="hidden" name="bfs_checkSum" id="bfs_checkSum" />
          <input
            type="hidden"
            name="bfs_paymentDesc"
            value="Sampleproductdescription"
          />
          <input type="hidden" name="bfs_version" value="5.0" />
        </form>
        {bookings.length > 0 ? (
          <div className="booking-card-container">
            {bookings.map((booking, index) => (
              <div className="booking-card-item" key={index}>
                <div className="booking-content">
                  <div className="booking-content-left">
                    <p>Agent Name:</p>
                    <p>{booking.agent_name}</p>
                  </div>
                  <div className="booking-content-right">
                    <p>Date:</p>
                    <p>
                      {new Date(booking.flight_date).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>
                </div>
                <div className="booking-content">
                  <div className="booking-content-left">
                    <p>Payable:</p>
                    <p>
                      {booking.payable === true ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="booking-content-right">
                    <p>Price:</p>
                    <p>{booking.refund_id? ((booking.bookingPriceBTN) - Number(booking.bookingPriceBTN * (booking.refund_id.plan/100)).toFixed(2)):(booking.bookingPriceBTN)} BTN / {booking.refund_id ? Number((booking.bookingPriceUSD) - (booking.bookingPriceUSD * (booking.refund_id.plan/100))+(((booking.bookingPriceUSD) - (booking.bookingPriceUSD * parseFloat(booking.refund_id.plan/100))) * commision)).toFixed(2) : Number(booking.bookingPriceUSD + (booking.bookingPriceUSD * commision)).toFixed(2)} USD</p>
                  </div>
                </div>
                <div className="booking-content">
                  <div className="booking-content-left">
                    <p>Duration:</p>
                    <p>
                      {booking.destination === null
                        ? booking.duration
                        : booking.destination.duration}{" "}
                      mins
                    </p>
                  </div>
                  <div className="booking-content-right">
                    <p>Time:</p>
                    <p>{booking.departure_time}</p>
                  </div>
                </div>
                <div className="booking-link">
                  {booking.payment_status === "Paid" ? (
                    <Link to="#" onClick={() => openModal(booking)}>
                      View Details
                    </Link>
                  ) : booking.payable === false ? (
                    <Link to="#" onClick={() => {
                      Swal.fire({
                        title: "Information",
                        text: "Your booking is not verified yet!",
                        icon: "info",
                        confirmButtonColor: "#1E306D",
                        showConfirmButton: false,
                        timer: 1000,
                      })
                    }}
                    >
                      Proceed To Payment
                    </Link>
                  ) : (
                    <Link to="#" onClick={() => {
                      Swal.fire({
                        title: 'Choose A Payment Method',
                        showDenyButton: true,
                        confirmButtonText: 'Local Payment',
                        denyButtonText: 'International Payment',
                        confirmButtonColor: '#1E306D',
                        denyButtonColor: '#d33',
                        customClass: {
                          confirmButton: 'custom-confirm-button',
                          denyButton: 'custom-deny-button'
                        }
                      }).then((result) => {
                        if (result.isConfirmed) {
                          handlePayment(booking)
                        } else if (result.isDenied) {
                          navigate(`/paymentInternational?price=${booking.refund_id ? Number((booking.bookingPriceUSD) - (booking.bookingPriceUSD * (booking.refund_id.plan/100))+(((booking.bookingPriceUSD) - (booking.bookingPriceUSD * (booking.refund_id.plan/100))) * commision)).toFixed(2) : Number(booking.bookingPriceUSD + (booking.bookingPriceUSD * commision)).toFixed(2)}&id=${booking._id}`)
                        }
                      })
                    }}>
                      Proceed To Payment
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="noData">You have made no bookings</p>
        )}
      </div>

      {/* Modal for booking details */}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        booking={selectedBooking}
        passengers={selectedPassengers}
      />
      <Footer />
    </>
  );
}

export default UserBookings;
