
import React, { useState, useEffect } from 'react';
import paymentQR from './paymentQR';
export default function OrderForm() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const loadServices = () => {
      const savedServices = JSON.parse(
        localStorage.getItem('pds_services') || '[]'
      );
      setServices(savedServices);
    };

    loadServices();
    window.addEventListener('storage', loadServices);

    return () => {
      window.removeEventListener('storage', loadServices);
    };
  }, []);

  const selected = services.find(
    (item) => item.name === selectedService
  );

  const submitOrder = (e) => {
    e.preventDefault();

    if (!selected) {
      alert('Please select a service');
      return;
    }

    const newOrder = {
      id: Date.now(),
      name,
      mobile,
      service: selected.name,
      price: selected.price,
      details,
      date: new Date().toLocaleString('en-IN'),
      status: 'Pending'
    };

    const orders = JSON.parse(
      localStorage.getItem('pds_orders') || '[]'
    );

    orders.push(newOrder);

    localStorage.setItem(
      'pds_orders',
      JSON.stringify(orders)
    );

    alert('Order saved successfully!');

    const message =
      `New Order - Patel Digital Studio\n` +
      `Name: ${name}\n` +
      `Mobile: ${mobile}\n` +
      `Service: ${selected.name}\n` +
      `Price: ₹${selected.price}\n` +
      `Details: ${details}`;

    window.open(
      `https://wa.me/919301152277?text=${encodeURIComponent(message)}`,
      '_blank'
    );

    setName('');
    setMobile('');
    setDetails('');
    setSelectedService('');
  };

  return (
    <div className="order-form">
      <h2>Place Your Order</h2>

      <form onSubmit={submitOrder}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />

        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          required
        >
          <option value="">Select Service</option>
          {services.map((item, index) => (
            <option key={index} value={item.name}>
              {item.name} - ₹{item.price}
            </option>
          ))}
        </select>

        {selected && (
          <p>Service Price: ₹{selected.price}</p>
        )}
{selected && (
    <div className="payment-section">
        <h3>Pay Online</h3>
            <p>UPI ID: 9301152277@ybl</p>
                <img
                      src="/payment-qr.jpg"
                            alt="Payment QR Code"
                                  width="200"
                                      />
                                          <p>Scan QR Code to Pay</p>
                                            </div>
                                            )}
)}
        <textarea
          placeholder="Order Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
<div className="payment-section">
    <h3>Scan & Pay</h3>

      <p>Payment Name: Patel Digital Studio</p>

        <p>UPI ID: 9301152277@ybl</p>

          <img
              src="/payment-qr.jpg"
                  alt="Patel Digital Studio Payment QR"
                      style={{ width: "200px", height: "200px", objectFit: "contain" }}
                        />

                          <p>Payment करने के बाद Submit Order करें।</p>
                          </div>
        <button type="submit">
          Submit Order
        </button>
      </form>
    </div>
  );
}
