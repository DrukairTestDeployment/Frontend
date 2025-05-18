import React, { useEffect, useRef } from 'react';
import CreditDebit from "../Assets/creditDebit.png";
import InternationalPayement from "../Assets/internationalPayment.jpg";

const CreditCardPayment = ({ amount, currency, name }) => {
  const scriptLoaded = useRef(false); // To ensure the script is loaded only once

  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://dev-kpaymentgateway.kasikornbank.com/ui/v2/kpayment.min.js';
    script.async = true;
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('data-apikey', 'pkey_test_21802q4kzSOLcMQCd0YpxgnzfF5no122Kpxl9');
    script.setAttribute('data-amount', amount); // Use the amount prop
    script.setAttribute('data-currency', currency); // Use the currency prop
    script.setAttribute('data-payment-methods', 'card');
    script.setAttribute('data-name', name); // Use the name prop
    script.setAttribute('data-mid', '402324545477001');
    script.setAttribute('id', 'kpayment-script');

    script.onload = () => {
      scriptLoaded.current = true;
    };

    // script.onerror = () => {
    //   console.error('Failed to load the payment script');
    // };

    document.getElementById('paymentForm').appendChild(script);

    return () => {
      const existingScript = document.getElementById('kpayment-script');
      if (existingScript) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [amount, currency, name]); // Ensure to re-run only when these props change

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Any custom logic if needed, though the script should handle the payment
  };

  return (
    <div>
      <form id="paymentForm" method="POST" action="/checkout">
        {/* This form will dynamically handle the payment button injection */}
      </form>

      <div className="payment-card" onClick={handlePaymentSubmit}>
        <div className="payment-card-content">
          <img src={CreditDebit} alt="Credit/Debit Icon" className="card-first-img-payment" />
          <p className="payment-topic">Credit/Debit Card</p>
          <p className="payment-des">
            Your booking will be validated and confirmed automatically. You will receive your electronic ticket(s) by email.
          </p>
          <img src={InternationalPayement} alt="International Payment Icons" className="card-first-second-payment" />
        </div>
      </div>
    </div>
  );
};

export default CreditCardPayment;
