import React, { useState, useEffect } from 'react';
import './BookingDetailsModal.css';
import axios from 'axios';
import Swal from 'sweetalert2';

function BookingDetailsModal({ isOpen, onClose, booking, passengers, legs }) {
    const [activeTab, setActiveTab] = useState(0);
    const [commision, setCommision] = useState(0);
    const [activeRouteIndex, setActiveRouteIndex] = useState(0);
    const [activePassengerIndex, setActivePassengerIndex] = useState(0);
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

    const legsGrouped = legs.map((leg) => ({
        ...leg,
        passengers: passengers.filter(p => p.leg_id === leg._id),
    }));




    if (!isOpen || !booking) return null;

    return (
        <div className="booking-modal-overlay">
            <div className="booking-modal-content booking-form-container">
                <span className="service-modal-close-button" onClick={onClose}>
                    &times;
                </span>
                <div className='form-title'>Booking Details</div>

                <form action="">
                    <p className='booking-break-header'>Client/Agent Details</p>
                    <div className="booking-form-group">
                        <label>
                            Booking ID
                            <input
                                type="text"
                                name="bookingID"
                                value={booking.bookingID}
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
                                value={booking.agent_name}
                                readOnly
                            />
                        </label>
                        <label>
                            Phone Number
                            <input
                                type="number"
                                name="agentPhone"
                                value={booking.agent_contact}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            CID
                            <input
                                type="text"
                                name="agentCid"
                                value={booking.agent_cid}
                                readOnly
                            />
                        </label>

                        <label>
                            Email Address
                            <input
                                type="email"
                                name="agentEmail"
                                value={booking.agent_email}
                                readOnly
                            />
                        </label>
                    </div>
                    <div className="booking-form-group checkbox-layap-group">
                        <label>
                            <input
                                type="checkbox"
                                name="layap"
                                checked={booking.layap}
                                readOnly
                            />
                            Are all passengers highlanders? (if all passengers are from Laya,Lingzhi,Soe,Merak,Lunana,Geling they will be liable for 50% discount)
                        </label>
                    </div>
                    <p className='booking-break-header'>Flight Logistics</p>
                    <div className="booking-form-group">
                        <label>
                            Destination
                            <input
                                type="text"
                                name="destination"
                                value={booking.destination === null ? booking.destination_other : booking.destination.sector}
                                readOnly
                            />
                        </label>

                        <label>
                            Pick Up Point
                            <input
                                type="text"
                                name="pickUpPoint"
                                value={booking.pickup_point}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Ground Time ("If Required")
                            <input
                                name="groundTime"
                                value={booking.ground_time}
                                readOnly
                            />
                        </label>

                        <label>
                            Date Of Flight
                            <input
                                name="flightDate"
                                value={new Date(booking.flight_date).toLocaleDateString('en-GB')}
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
                                value={booking.departure_time}
                                readOnly
                            />
                        </label>

                        <label>
                            Permission for Private Helipad
                            <input
                                type="text"
                                name="name"
                                value={booking.permission ? "Yes" : "No"}
                                readOnly
                            />
                        </label>
                    </div>

                    <div>
                        <>
                            <p className="booking-break-header">Routes and Passengers</p>
                            <div className="passenger-tab-wrapper">
                                {legs.map((route, index) => (
                                    <div
                                        key={route._id}
                                        className={`passenger-tab route-tab ${index === activeRouteIndex ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveRouteIndex(index);
                                            setActivePassengerIndex(0);
                                        }}
                                    >
                                        <span className="route-name-ellipsis">{route.name}</span>
                                    </div>
                                ))}
                            </div>

                            {legsGrouped[activeRouteIndex] && (
                                <div>
                                    <div className="passenger-tab-wrapper">
                                        {legsGrouped[activeRouteIndex].passengers.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`passenger-tab ${idx === activePassengerIndex ? 'active' : ''}`}
                                                onClick={() => setActivePassengerIndex(idx)}
                                            >
                                                Passenger {idx + 1}
                                            </div>
                                        ))}
                                    </div>

                                    {legsGrouped[activeRouteIndex].passengers[activePassengerIndex] && (
                                        <>
                                            {/* Name & Gender */}
                                            <div className="booking-form-group">
                                                <label>
                                                    Name
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].name || ""}
                                                    />
                                                </label>
                                                <label>
                                                    Gender
                                                    <input
                                                        readOnly
                                                        type="text"
                                                        value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].gender || ''}
                                                    />
                                                </label>
                                            </div>

                                            {/* Weight & Luggage */}
                                            <div className="booking-form-group">
                                                <label>
                                                    Weight (Kg)
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].weight || ""}
                                                    />
                                                </label>
                                                <label>
                                                    Baggage Weight (Kg)
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].bagWeight || ""}
                                                    />
                                                </label>
                                            </div>

                                            {/* CID & Contact */}
                                            <div className="booking-form-group">
                                                <label>
                                                    CID/Passport
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].cid || ""}
                                                    />
                                                </label>
                                                <label>
                                                    Contact No
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].contact || ""}
                                                    />
                                                </label>
                                            </div>

                                            {/* Medical Issue */}
                                            <div className="booking-form-group">
                                                <label>
                                                    Medical Issue
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].medIssue || ""}
                                                    />
                                                </label>
                                            </div>

                                            {/* Medical Remarks (if applicable) */}
                                            {legsGrouped[activeRouteIndex].passengers[activePassengerIndex].medIssue === 'Yes' && (
                                                <div className="booking-form-group">
                                                    <label>
                                                        Medical Remarks
                                                        <textarea
                                                            readOnly
                                                            className="medicalRemarksInput"
                                                            value={legsGrouped[activeRouteIndex].passengers[activePassengerIndex].remarks || ""}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                        </>
                    </div>

                    <p className='booking-break-header'>Extra Details</p>
                    <div className="booking-form-group">
                        <label>
                            Assigned Pilot
                            <input
                                type="text"
                                name="assignedPilot"
                                value={booking.assigned_pilot ? booking.assigned_pilot.name : "No Pilots Assigned"}
                                readOnly
                            />
                        </label>
                        <label>
                            Booking Status
                            <input
                                type="text"
                                name="bookingStatus"
                                value={booking.status}
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
                                value={booking.service_id.name}
                                readOnly
                            />
                        </label>
                        <label>
                            Booking Type
                            <input
                                type="text"
                                name="bookingType"
                                value={booking.booking_type}
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
                                value={booking.layap}
                                readOnly
                            />
                        </label>
                        <label>
                            Refund (in %)
                            <input
                                type="Number"
                                name="refund_id"
                                value={booking.refund_id ? (parseInt(booking.refund_id.plan * 100)) : 0}
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
                                value={Number(booking.refund_id ? booking.bookingPriceBTN : (booking.bookingPriceBTN - (booking.bookingPriceBTN * parseFloat(booking.refund_id.plan / 100)))).toFixed(2)}
                                readOnly
                            />
                        </label>
                        <label>
                            Price(in USD)
                            <input
                                type="Number"
                                name="bookingPriceUSD"
                                value={Number(booking.refund_id ? (booking.bookingPriceUSD + (booking.bookingPriceUSD * commision)) : ((booking.bookingPriceUSD - (booking.bookingPriceUSD * parseFloat(booking.refund_id.plan / 100))) + ((booking.bookingPriceUSD - (booking.bookingPriceUSD * parseFloat(booking.refund_id.plan / 100))) * commision))).toFixed(2)}
                                readOnly
                            />
                        </label>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default BookingDetailsModal;