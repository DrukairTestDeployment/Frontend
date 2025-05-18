import React, { useEffect } from 'react';

const PaymentHandle = () => {
  useEffect(() => {
    fetch('http://localhost:4001/cancelrmapayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: null,
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  return (
    <div className="payment-inter-wrapper">
      <p>Payment Cancelled</p>
    </div>
  );
};

export default PaymentHandle;
