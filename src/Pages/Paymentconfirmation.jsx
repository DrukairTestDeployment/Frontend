import React, { useEffect, useState } from "react";
import "./Css/paymentconfirm.css";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Swal from "sweetalert2";
import axios from "axios";
import { useLocation } from "react-router-dom";

function PaymentConfirmation() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tid = queryParams.get("tid");
  const id = queryParams.get("id");

  const [booking, setBooking] = useState();
  const [transData, setTransData] = useState();
  const apiKey = "skey_test_218026cQ7I9H8vganqmm0SJcYihygrRWOCLLr";

  useEffect(() => {
    if (id) {
      const fetchBookingData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:4001/api/bookings/${id}`
          );
          setBooking(response.data.data);
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Error fetching booking data",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      };

      fetchBookingData();
    }
  }, [id]);

  useEffect(() => {
    if (tid) {
      const fetchTransactionData = async () => {
        try {
          const response = await fetch(
            `https://dev-kpaymentgateway-services.kasikornbank.com/card/v2/charge/${tid}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
              },
            }
          );
          const transactionData = await response.json();
          setTransData(transactionData);
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Error fetching transaction data",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      };

      fetchTransactionData();
    }
  }, [tid]);

  useEffect(() => {
    const updateBooking = async () => {
      try {
        if (
          id &&
          transData?.transaction_state === "Authorized" &&
          transData?.status === "success"
        ) {
          const response = await axios.patch(
            `http://localhost:4001/api/bookings/${id}`,
            {
              payment_status: "Paid",
              cType: "USD",
              price: booking?.bookingPriceUSD,
            }
          );
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Error updating booking data",
          icon: "error",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
        });
      }
    };

    if (transData) {
      updateBooking();
    }
  }, [transData, id, booking?.bookingPriceUSD]);

  return (
    <>
      <Header />
      <div>
        <div className="payment-containerss">
          <div className="payment-header">
            <div className="payment-header-text">
              PAYMENT CONFIRMATION {"   "}
              <span style={{ color: "#E35205" }}> (DRUKAIR HELI-RESERVATION)</span>
            </div>
          </div>

          <div className="payment-section-header">AGENT INFORMATION</div>
          <div className="info-row">
            <div className="info-label">NAME</div>
            <div className="info-value">{booking?.agent_name}</div>
          </div>
          <div className="info-row">
            <div className="info-label">AGENT CID</div>
            <div className="info-value">{booking?.agent_cid}</div>
          </div>
          <div className="info-row">
            <div className="info-label">BOOKING REFERENCE</div>
            <div className="info-value">{booking?.bookingID}</div>
          </div>
          <div className="info-row">
            <div className="info-label">ISSUED THROUGH</div>
            <div className="info-value">{booking?.booking_type}</div>
          </div>

          <div className="payment-section-header">FARE INFORMATION</div>

          <div className="info-row">
            <div className="info-label">TRANSACTION STATUS</div>
            <div className="info-value">{transData?.transaction_state}</div>
          </div>
          <div className="info-row">
            <div className="info-label">FLIGHT FARE</div>
            <div className="info-value">
              {transData?.amount} {transData?.currency}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">PAYMENT MESSAGE</div>
            <div className="info-value">
              {transData?.status === "success"
                ? "Payment Transfer Successful"
                : transData?.failure_message}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">TRANSACTION DESCRIPTION</div>
            <div className="info-value">{transData?.description}</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PaymentConfirmation;
