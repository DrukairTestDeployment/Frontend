import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Payment.css";

const PaymentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  let price = queryParams.get("price");
  let id = queryParams.get("id");

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("hasReloaded");
    if (!hasReloaded || hasReloaded === "false") {
      sessionStorage.setItem("hasReloaded", "true");
      window.location.reload();
      return;
    }

    // Load the KPayment script
    const script = document.createElement("script");
    script.src =
      "https://dev-kpaymentgateway.kasikornbank.com/ui/v2/kpayment.min.js";
    script.type = "text/javascript";
    script.dataset.apikey = "pkey_test_21802q4kzSOLcMQCd0YpxgnzfF5no122Kpxl9";
    script.dataset.amount = price;
    script.dataset.currency = "USD";
    script.dataset.paymentMethods = "card";
    script.dataset.name = "DrukAir Heli Reservation";
    script.dataset.mid = "402324545477001";

    script.onload = () => {
      const waitForButtonAndClick = () => {
        const pButton = document.querySelector(".pay-button");
        if (pButton) {
          pButton.click();
        } else {
          setTimeout(waitForButtonAndClick, 100);
        }
      };
      waitForButtonAndClick();
    };

    script.onerror = () => {
      Swal.fire({
        icon: "error",
        title: "Script Load Error",
        text: "Failed to load payment script. Please try again.",
      });
    };

    document.getElementById("paymentForm").appendChild(script);

    return () => {
      setTimeout(() => {
        const popup = document.querySelector('iframe[id^="kpaymentFrame"]');
        if (popup) {
          popup.remove();
        }

        const overlays = document.querySelectorAll('[class*="kpayment"]');
        overlays.forEach((element) => element.remove());
        const backGround = document.querySelector(
          ".payment-container[_kpayment].show"
        );
        if (backGround) {
          backGround.remove();
        }

        document.body.style.removeProperty("overflow-y");
        document.body.style.overflow = "auto";
        document.body.classList.remove("scroll-y-hidden");

        sessionStorage.setItem("hasReloaded", "false");
      }, 300);
    };
  }, [price]);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    const apiKey = "skey_test_218026cQ7I9H8vganqmm0SJcYihygrRWOCLLr";
    const formData = new FormData(event.target);
    const token = formData.get("token");

    function generateReferenceOrder() {
      const timestamp = Date.now().toString();
      const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
      return timestamp + randomDigits;
    }

    try {
      const response = await fetch(
        "https://dev-kpaymentgateway-services.kasikornbank.com/card/v2/charge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            amount: price,
            currency: "USD",
            description: "DrukAir Heli Reservation System Payment",
            source_type: "card",
            mode: "token",
            token,
            reference_order: generateReferenceOrder(),
            ref_1: "ref1",
            ref_2: "123456",
            additional_data: {
              mid: "402324545477001",
            },
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            const transactionId = data.id;

            const paymentPopup = window.open(
              data.redirect_url,
              "PaymentPopup",
              "width=600,height=600,left=100,top=100"
            );

            const checkTransactionStatus = setInterval(() => {
              if (paymentPopup.closed) {
                clearInterval(checkTransactionStatus);
              } else {
                try {
                  fetch(
                    `https://dev-kpaymentgateway-services.kasikornbank.com/card/v2/charge/${transactionId}`,
                    {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                        "x-api-key": apiKey,
                      },
                    }
                  )
                    .then((response) => response.json())
                    .then((transactionData) => {
                      if (transactionData.transaction_state === "Authorized") {
                        clearInterval(checkTransactionStatus);
                        Swal.fire({
                          icon: "success",
                          title: "Payment Successful",
                          text: "Transaction has been authorized.",
                        }).then(() => {
                          navigate(`/paymentresult?tid=${transactionId}&id=${id}`);
                          paymentPopup.close();
                        });
                      } else if (transactionData.status === "fail") {
                        clearInterval(checkTransactionStatus);
                        Swal.fire({
                          icon: "error",
                          title: "Payment Failed",
                          text: "Transaction could not be completed.",
                        }).then(() => {
                          navigate(`/paymentresult?tid=${transactionId}&id=${id}`);
                          paymentPopup.close();
                        });
                      }
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                      Swal.fire({
                        icon: "error",
                        title: "Transaction Error",
                        text: "An error occurred while checking the transaction status.",
                      });
                    });
                } catch (e) { }
              }
            }, 10000);
          } else {
            Swal.fire({
              icon: "error",
              title: "Payment Failed",
              text: "Payment failed. Please try again.",
            });
          }
        });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Request Error",
        text: "An error occurred during the payment request. Please try again.",
      });
    }
  };

  return (
    <div className="payment-inter-wrapper">
      <form
        className="international-Payment"
        id="paymentForm"
        method="POST"
        action="/checkout"
        onSubmit={handlePaymentSubmit}
      ></form>
    </div>
  );
};

export default PaymentForm;
