import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import { SiGoogletagmanager } from "react-icons/si";
import UserBookingHeader from "../Components/UserBookingHeader";
import "./Css/ManageBooking.css";
import {
  MdOutlineBeenhere,
  MdOutlinePendingActions,
  MdOutlineDone,
  MdOutlineAirplaneTicket,
} from "react-icons/md";
import { BsArrowUpLeftSquare } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
function ManageBooking() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [agentCID, setAgentCID] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [searchMessage, setSearchMessage] = useState("");
  const [txnTime, setTxnTime] = useState("");
  const [orderNo, setOrderNum] = useState("");
  const [commision, setCommision] = useState(0);
  const navigate = useNavigate();
  const statuses = [
    { key: "booked", label: "Booked", icon: MdOutlineBeenhere },
    { key: "confirmed", label: "Confirmed", icon: MdOutlineDone },
    { key: "delayed", label: "Delayed", icon: MdOutlinePendingActions },
    { key: "on-board", label: "On-Board", icon: MdOutlineAirplaneTicket },
    { key: "completed", label: "Completed", icon: BsArrowUpLeftSquare },
    { key: "cancelled", label: "Cancelled", icon: RxCross2 },
  ];
  const pad = (number) => {
    return number < 10 ? "0" + number : number;
  };

  const generateTxnTime = () => {
    const now = new Date();
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
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
  }
  const handlePayment = async (selectedBooking) => {
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
      bfs_txnAmount: selectedBooking.price === 0 ? selectedBooking.bookingPriceBTN : selectedBooking.price,
      bfs_txnCurrency: "BTN",
      bfs_version: "5.0",
      bfs_benfTxnTime,
    };
    try {
      const response = await axios.post("https://helistaging.drukair.com.bt/api/bookings/signchecksum", formData);
      document.getElementById('bfs_checkSum').value = response.data.f_signature;
      document.getElementById('bfs_txnAmount').value = selectedBooking.price === 0 ? selectedBooking.bookingPriceBTN : selectedBooking.price;
      finalPost();
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

  const getStatusIndex = (status) => {
    if (!status) return 0;
    const index = statuses.findIndex(
      (s) => s.key.toLowerCase() === status.toLowerCase()
    );
    return index === -1 ? 0 : index;
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://helistaging.drukair.com.bt/api/bookings/${bookingId}/${agentCID}`
      );
      if (response.data.status === "success") {
        if (response.data.data !== null) {
          setSelectedBooking(response.data.data);
          setActiveTab(0);
          setSearchMessage("");
          fetchPassengers(response.data.data._id);
        } else {
          setSelectedBooking(null);
          setSearchMessage("There is no flight with this booking ID");
        }
      }
    } catch (error) {
      setSelectedBooking(null);
      setSearchMessage(
        error.response
          ? error.response.data.message
          : "An error occurred while retrieving the booking"
      );
    }
  };

  const fetchPassengers = async (id) => {
    try {
      const response = await axios.get(
        `https://helistaging.drukair.com.bt/api/passengers/all/${id}`
      );
      if (response.data.status === "success") {
        if (response.data.data !== null) {
          setPassengers(response.data.data);
          setActiveTab(0);
          setSearchMessage("");
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response
          ? error.response.data.message
          : "An error occurred during login",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  const handlePaymentType = async () => {
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
        handlePayment(selectedBooking)
      } else if (result.isDenied) {
        navigate(`/paymentInternational?price=${selectedBooking.price === 0 ? selectedBooking.bookingPriceUSD : selectedBooking.price}&id=${selectedBooking._id}`)
      }
    });
  }

  useEffect(() => {
    const fetchCommision = async () => {
      try {
        const response = await axios.get(`https://helistaging.drukair.com.bt/api/commision/`);
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

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    const currentStatusIndex = getStatusIndex(selectedBooking.status);
    const isCancelled =
      selectedBooking.status?.toLowerCase() === "cancelled";

    const getIconColor = (index) => {
      if (isCancelled) {
        return index <= 2 ? "#E35205" : "#1E306D";
      }
      return index <= currentStatusIndex ? "#E35205" : "#1E306D";
    };

    const visibleStatuses = isCancelled
      ? [...statuses.slice(0, 2), statuses.find((s) => s.key === "cancelled")]
      : statuses.filter((status) => status.key !== "cancelled");
    return (
      <div className="booking-form-container manageBookingFormContainer">
        <form id="bfsPaymentForm" method="post" action="https://uatbfssecure.rma.org.bt/BFSSecure/makePayment">
          <input type="hidden" name="bfs_msgType" value="AR" />
          <input type="hidden" name="bfs_benfTxnTime" value={txnTime} />
          <input type="hidden" name="bfs_orderNo" value={orderNo} />
          <input type="hidden" name="bfs_benfId" value="BE10000132" />
          <input type="hidden" name="bfs_benfBankCode" value="01" />
          <input type="hidden" name="bfs_txnCurrency" value="BTN" />
          <input type="hidden" name="bfs_txnAmount" id="bfs_txnAmount" />
          <input type="hidden" name="bfs_remitterEmail" value="pwangchuk@rbhsl.bt" />
          <input type="hidden" name="bfs_checkSum" id="bfs_checkSum" />
          <input type="hidden" name="bfs_paymentDesc" value="Sampleproductdescription" />
          <input type="hidden" name="bfs_version" value="5.0" />
        </form>
        <div className="booking-flight-status-wrapper">
          <p className="booking-flight-status-topic">Flight Status</p>
          <div className="flight-status-icon-container">
            {visibleStatuses.map((status, index) => (
              <div key={status.key} className="flight-status-icons">
                <div
                  className="status-icon-container"
                  style={{ border: `1px solid ${getIconColor(index)}` }}
                >
                  <status.icon
                    className="flight-status-icon"
                    style={{ color: getIconColor(index) }}
                  />
                </div>
                <p>{status.label}</p>
              </div>
            ))}
          </div>
        </div>
        <h2 className="detail-popup-title">Booking Details</h2>

        <form>
          <p className="booking-break-header">Client/Agent Details</p>

          <div className="booking-form-group">
            <label>
              Booking ID
              <input
                type="text"
                name="bookingID"
                value={selectedBooking.bookingID || ""}
                readOnly
              />
            </label>
          </div>
          <div className="booking-form-group">
            <label>
              Name of the client/agent
              <input
                type="text"
                name="agentName"
                value={selectedBooking.agent_name || ""}
                readOnly
              />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                name="agentPhone"
                value={selectedBooking.agent_contact || ""}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              CID/Passport
              <input
                type="text"
                name="agentCid"
                value={selectedBooking.agent_cid || ""}
                readOnly
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                name="agentEmail"
                value={selectedBooking.agent_email || ""}
                readOnly
              />
            </label>
          </div>

          <p className="booking-break-header">Flight Logistics</p>
          <div className="booking-form-group">
            <label>
              Destination
              <input
                type="text"
                name="destination"
                value={selectedBooking.destination === null ? selectedBooking.destination_other : selectedBooking.destination.sector}
                readOnly
              />
            </label>
            <label>
              Pick Up Point
              <input
                type="text"
                name="pickUpPoint"
                value={selectedBooking.pickup_point || ""}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Ground Time (If Required)
              <input
                type="text"
                name="groundTime"
                value={selectedBooking.ground_time || ""}
                readOnly
              />
            </label>
            <label>
              Date Of Flight
              <input
                type="text"
                name="flightDate"
                value={new Date(selectedBooking.flight_date).toLocaleDateString('en-GB') || "No Date Scheduled"}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Time of Departure
              <input
                type="text"
                name="departureTime"
                value={selectedBooking.departure_time || ""}
                readOnly
              />
            </label>
            <label>
              Permission for Private Helipad
              <input
                type="text"
                name="privateHelipadPermission"
                value={selectedBooking.permission ? "Yes" : "No"}
                readOnly
              />
            </label>
          </div>

          <div>
            <div className="passenger-tab-wrapper">
              {passengers && passengers.length > 0 ? (
                passengers.map((passenger, index) => (
                  <div
                    key={index}
                    className={`passenger-tab ${activeTab === index ? "active" : ""
                      }`}
                    onClick={() => setActiveTab(index)}
                  >
                    Passenger {index + 1}
                  </div>
                ))
              ) : (
                <p>No passengers found</p>
              )}
            </div>

            {passengers && passengers[activeTab] && (
              <>
                <div className="booking-form-group">
                  <label>
                    Name
                    <input
                      type="text"
                      name="passengerName"
                      value={passengers[activeTab].name || ""}
                      readOnly
                    />
                  </label>
                  <label>
                    Gender
                    <input
                      type="text"
                      name="gender"
                      value={passengers[activeTab].gender || ""}
                      readOnly
                    />
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Weight (Kg)
                    <input
                      type="number"
                      name="weight"
                      value={passengers[activeTab].weight || ""}
                      readOnly
                    />
                  </label>
                  <label>
                    Baggage Weight (Kg)
                    <input
                      type="number"
                      name="luggageWeight"
                      value={passengers[activeTab].bagWeight || ""}
                      readOnly
                    />
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Passport/CID
                    <input
                      type="text"
                      name="cidPassport"
                      value={passengers[activeTab].cid || ""}
                      readOnly
                    />
                  </label>
                  <label>
                    Contact No
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={passengers[activeTab].contact || ""}
                      readOnly
                    />
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Medical Issue
                    <input
                      type="text"
                      name="medicalIssue"
                      value={
                        passengers[activeTab].medIssue || ""
                      }
                      readOnly
                    />
                  </label>
                </div>

                {passengers[activeTab]?.medIssue === 'Yes' && (
                  <div className="booking-form-group">
                    <label>
                      Medical condition description
                      <textarea
                        name="remarks"
                        placeholder="Enter any medical remarks here"
                        value={passengers[activeTab]?.remarks || ''}
                        className="medicalRemarksInput"
                        readOnly
                      ></textarea>
                    </label>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="booking-break-header">Extra Details</p>
          <div className="booking-form-group">
            <label>
              Assigned Pilot
              <input
                type="text"
                name="assignedPilot"
                value={selectedBooking.assigned_pilot ? selectedBooking.assigned_pilot.name : "No Pilots Assigned"}
                readOnly
              />
            </label>
            <label>
              Booking Status
              <input
                type="text"
                name="bookingStatus"
                value={selectedBooking.status || ""}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Service Type
              <input
                type="text"
                name="serviceType"
                value={selectedBooking.service_id.name || ""}
                readOnly
              />
            </label>
            <label>
              Booking Type
              <input
                type="text"
                name="bookingType"
                value={selectedBooking.booking_type || ""}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Higlanders
              <input
                type="text"
                name="bookingPriceBTN"
                value={selectedBooking.layap}
                readOnly
              />
            </label>
            <label>
              Refund (in %)
              <input
                type="Number"
                name="refund_id"
                value={selectedBooking.refund_id ? (parseInt(selectedBooking.refund_id.plan) * 100) : 0}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Price (in BTN)
              <input
                type="Number"
                name="bookingPriceBTN"
                value={Number(selectedBooking.refund_id ? (selectedBooking.bookingPriceBTN - (selectedBooking.bookingPriceBTN * parseFloat(selectedBooking.refund_id.plan / 100))) : selectedBooking.bookingPriceBTN).toFixed(2)}
                readOnly
              />
            </label>
            <label>
              Price(in USD)
              <input
                type="Number"
                name="bookingPriceUSD"
                value={selectedBooking.refund_id ? Number((selectedBooking.bookingPriceUSD) - (selectedBooking.bookingPriceUSD * (selectedBooking.refund_id.plan / 100)) + (((selectedBooking.bookingPriceUSD) - (selectedBooking.bookingPriceUSD * parseFloat(selectedBooking.refund_id.plan / 100))) * commision)).toFixed(2) : Number(selectedBooking.bookingPriceUSD + (selectedBooking.bookingPriceUSD * commision)).toFixed(2)}
                readOnly
              />
            </label>
          </div>
        </form >

        <div className="manageBookingLinks">
          {selectedBooking.payment_status !== "Paid" && selectedBooking.payable ? (
            <Link to="#" onClick={(e) => { e.preventDefault(); handlePaymentType(); }}>
              Proceed To Payment
            </Link>
          ) : null}
        </div>
      </div >
    );
  };

  return (
    <>
      <Header />
      <UserBookingHeader
        headerTitle="Manage Booking"
        headerIcon={<SiGoogletagmanager />}
      />
      <div className="search-booking-form-container">
        <div className="search-booking-form-group">
          <label>
            Booking ID
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter Booking ID"
            />
          </label>
          <label>
            CID/Passport
            <input
              type="text"
              value={agentCID}
              placeholder="Enter CID/Passport"
              onChange={(e) => setAgentCID(e.target.value)}
            />
          </label>
          <button className="FeedbackFormBtn" onClick={handleSearch}>
            Retrieve Booking
          </button>
        </div>
      </div>

      {searchMessage && <p className="no-bookings">{searchMessage}</p>}

      {renderBookingDetails()}
    </>
  );
}

export default ManageBooking;
