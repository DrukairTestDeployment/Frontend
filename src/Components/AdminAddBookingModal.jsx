import React, { useState, useEffect } from 'react';
import './BookingDetailsModal.css';
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import Swal from 'sweetalert2';
import axios from 'axios';
import HelicopterLoader from './HelicopterLoader';

function AdminAddBookingModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const genderTypes = ['Male', 'Female', 'Others'];
    const bookingStatuses = ['Booked', 'Pending', 'Confirmed'];
    const paymentTypes = ['Bank Transfer', 'Cash'];
    const bookingTypes = ['Walk-In', 'Online', 'Phone Call'];
    const [pilots, setPilots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [services, setServices] = useState([]);

    const [errors, setErrors] = useState({});
    const [totalWeight, setTotalWeight] = useState(0);
    const [passengers, setPassengers] = useState([{ id: Date.now() }]);
    const [imagePreview, setImagePreview] = useState('');
    const maxFileSize = 5 * 1024 * 1024; // Max size 5MB

    const [priceInBTN, setPriceInBtn] = useState("")
    const [priceInUSD, setPriceInUSD] = useState("")
    const [durationf, setDuration] = useState(0)

    const [durationAdmin, setDurationAdmin] = useState(0)
    const [refunds, setRefunds] = useState([]);
    const [refundChosenPlan, setRefundChosenPlan] = useState(0)

    let finalpriceInBTNOthers = Number(priceInBTN * durationAdmin).toFixed(2)
    let finalpriceInUSDOthers = Number(priceInUSD * durationAdmin).toFixed(2)
    let finalpriceInBTN = Number(priceInBTN * durationf).toFixed(2)
    let finalpriceInUSD = Number(priceInUSD * durationf).toFixed(2)


    let carryingCapacity = 0;
    let flightMonth = 0
    let winterWeight = 450
    let summerWeight = 450

    const summerMonths = [3, 4, 5, 6, 7, 8]
    const isSummer = summerMonths.includes(flightMonth);
    carryingCapacity = isSummer ? summerWeight : winterWeight;


    // Multiple image input
    const [paymentScreenshots, setPaymentScreenshots] = useState([]);

    const handleMultipleFilesChange = (event) => {
        const files = Array.from(event.target.files);

        const validFiles = files.filter(file =>
            file.type.startsWith('image/') && file.size <= maxFileSize
        );

        const newImages = validFiles.map(file => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
        }));

        setPaymentScreenshots(prev => [...prev, ...newImages]);

        // ✅ Reset input value so selecting the same file again works
        event.target.value = null;

    };

    // console.log(paymentScreenshots) 


    const handleRemoveImage = (id) => {
        setPaymentScreenshots(prev => {
            const filtered = prev.filter(img => img.id !== id);
            // Revoke URLs to avoid memory leaks
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.preview);
            return filtered;
        });
    };

    useEffect(() => {
        return () => {
            paymentScreenshots.forEach(img => URL.revokeObjectURL(img.preview));
        };
    }, [paymentScreenshots]);


    const [formData, setFormData] = useState({
        bookingID: "",
        agent_name: "",
        agent_contact: "",
        agent_cid: "",
        agent_email: "",
        layap: false,
        destination: "",
        destination_other: null,
        pickup_point: "",
        ground_time: "",
        latitude: "",
        longitude: "",
        flight_date: "",
        departure_time: "",
        service_id: "",
        permission: "",
        assigned_pilot: null,
        bookingStatus: "",
        payment_type: "",
        booking_type: "",
        cType: "None",
        price: 0,
        bookingPriceUSD: 0,
        bookingPriceBTN: 0,
        payment_status: "Paid",
        journal_no: "",
        paymentScreenShot: null,
        duration: "",
        refund_id: ""
    });

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: checked
        }));
    };
    const [passengerData, setPassengerData] = useState({
        passengers: [{}],
    })

    useEffect(() => {
        const fetchBooking = async () => {
            if (formData.flight_date) {
                try {
                    const date = new Date(formData.flight_date).toLocaleDateString('en-GB');
                    const response = await axios.get(`https://helistaging.drukair.com.bt/api/bookings`);
                    const bookings = response.data.data
                    const filteredBookings = bookings.filter(booking => new Date(booking.flight_date).toLocaleDateString('en-GB') === date)
                    setBookings(Array.isArray(filteredBookings) ? filteredBookings : []);
                } catch (error) {
                    Swal.fire({
                        title: "Error!",
                        text: "Error fetching booking",
                        icon: "error",
                        confirmButtonColor: "#1E306D",
                        confirmButtonText: "OK",
                    });
                }
            }
        };
        fetchBooking();
    }, [formData.flight_date])

    useEffect(() => {
        const fetchRefund = async () => {
            try {
                const response = await axios.get("https://helistaging.drukair.com.bt/api/refund");
                const enabledRefunds = response.data.data.filter(
                    (refund) => refund.status === "Enabled"
                );
                setRefunds(enabledRefunds);
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "Error fetching refund data",
                    icon: "error",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });
            }
        };
        fetchRefund();
    }, []);

    const fetchRefundChosen = async (rId) => {
        try {
            const response = await axios.get(`https://helistaging.drukair.com.bt/api/refund/${rId}`);
            const refundPlan = response.data.data.plan
            setRefundChosenPlan(parseFloat(refundPlan) / 100)
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Error fetching refund data",
                icon: "error",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
            });
        }
    };

    useEffect(() => {
        const fetchPilot = async () => {
            try {
                const response = await axios.get("https://helistaging.drukair.com.bt/api/users", { withCredentials: true });
                const pilots = response.data.data;
                const filteredPilots = pilots.filter(user => user.role.name === "PILOT");

                setPilots(Array.isArray(filteredPilots) ? filteredPilots : []);
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "Error fetching pilot data",
                    icon: "error",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });
            }
        };

        fetchPilot();
    }, [bookings]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("https://helistaging.drukair.com.bt/api/routes");
                setRoutes(Array.isArray(response.data.data) ? response.data.data : []);
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "Error fetching destinations",
                    icon: "error",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('https://helistaging.drukair.com.bt/api/services');
                setServices(Array.isArray(response.data.data) ? response.data.data : []);
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "Error fetching services",
                    icon: "error",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });
            }
        };

        fetchServices();
    }, []);



    const getDuration = async (id) => {
        if (id === "Others") {
            setDuration(0)
        } else {
            try {
                const response = await axios.get(`https://helistaging.drukair.com.bt/api/routes/${id}`);
                const durations = parseInt(response.data.data.duration) / 60
                formData.duration = response.data.data.duration;
                setDuration(durations)
                winterWeight = parseFloat(response.data.data.winterWeight)
                summerWeight = parseFloat(response.data.data.summerWeight)
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: error.response ? error.response.data.error : "Error saving the booking",
                    icon: "error",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });
            }
        }
    }

    const getPrice = async (id) => {
        try {
            const response = await axios.get(`https://helistaging.drukair.com.bt/api/services/${id}`);
            const priceUSD = response.data.data.priceInUSD;
            const priceBTN = response.data.data.priceInBTN;
            setPriceInUSD(priceUSD)
            setPriceInBtn(priceBTN)

        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.response ? error.response.data.error : "Error saving the booking",
                icon: "error",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
            });
        }
    }

    const validateForm = () => {
        const newErrors = {};

        if (totalWeight > carryingCapacity) {
            newErrors.totalWeight = `Total weight exceeds carrying capacity of ${carryingCapacity}kg`;
        }

        passengerData.passengers.forEach((passenger, index) => {
            if (passenger.weight && (isNaN(passenger.weight) || passenger.weight <= 0)) {
                newErrors[`passengers[${index}].weight`] = 'Weight must be a positive number';
            }
            if (passenger.luggageWeight && (isNaN(passenger.luggageWeight) || passenger.luggageWeight < 0)) {
                newErrors[`passengers[${index}].luggageWeight`] = 'Luggage weight must be a non-negative number';
            }

            if (totalWeight > carryingCapacity) {
                Swal.fire({
                    icon: 'error',
                    title: 'Weight Limit Exceeded',
                    text: `Total weight (${totalWeight}kg) exceeds the carrying capacity of ${carryingCapacity}kg`,
                });
                return false;
            }
        });


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e, passengerIndex) => {
        const { name, value } = e.target;
        if (passengerIndex !== undefined) {
            setPassengerData(prevData => ({
                ...prevData,
                passengers: prevData.passengers.map((passenger, index) =>
                    index === passengerIndex ? { ...passenger, [name]: value } : passenger
                )
            }));
        } else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }

        if (name === "refund_id") {
            fetchRefundChosen(value)
        }
    };

    function generateBookingId() {
        const prefix = "DHRS";
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        return prefix + randomDigits;
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Please upload a valid image file.");
                return;
            }

            if (file.size > maxFileSize) {
                alert("File size should not exceed 5MB.");
                return;
            }

            setFormData((prevData) => ({
                ...prevData,
                paymentScreenShot: file,
            }));

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const addPassenger = () => {
        if (passengers.length <= 5) {
            setPassengers([...passengers, { id: Date.now() }]);
            setPassengerData(prevData => ({
                ...prevData,
                passengers: [...prevData.passengers, {}]
            }));
        }
    };

    const removePassenger = (id, index) => {
        if (passengers.length > 1) {
            setPassengers(passengers.filter(passenger => passenger.id !== id));
            setPassengerData(prevData => ({
                ...prevData,
                passengers: prevData.passengers.filter((_, i) => i !== index)
            }));
        }
    };

    useEffect(() => {
        calculateTotalWeight();
    }, [passengerData.passengers]);

    const calculateTotalWeight = () => {
        const weight = passengerData.passengers.reduce((sum, passenger) => {
            return sum + (Number(passenger.weight) || 0) + (Number(passenger.luggageWeight) || 0);
        }, 0);
        setTotalWeight(weight);
    };

    const postPassenger = async (id) => {
        for (const passenger of passengerData.passengers) {
            try {
                await axios.post('https://helistaging.drukair.com.bt/api/passengers', {
                    name: passenger.name,
                    weight: passenger.weight,
                    cid: passenger.cidPassport,
                    bagWeight: passenger.luggageWeight,
                    gender: passenger.gender,
                    medIssue: passenger.medicalCondition,
                    contact: passenger.phoneNumber,
                    booking_id: id,
                    remarks: passenger.remarks
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response ? error.response.data.message : 'An error occurred',
                    icon: 'error',
                    confirmButtonColor: '#1E306D',
                    confirmButtonText: 'OK'
                });
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log(passengerData.passengers)
            Swal.fire({
                title: "",
                text: "Are you sure you want to book?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#1E306D",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, book!"
            }).then(async (result) => {
                if (result.isConfirmed && formData.payment_type !== "Bank Transfer") {
                    setLoading(true);
                    try {
                        const priceCheck = formData.payment_type === "Cash" ? "BTN" : formData.cType
                        const response = await axios.post(`https://helistaging.drukair.com.bt/api/bookings`, {
                            bookingID: generateBookingId(),
                            agent_name: formData.agent_name,
                            agent_contact: formData.agent_contact,
                            agent_cid: formData.agent_cid,
                            agent_email: formData.agent_email,
                            layap: formData.layap,
                            destination: formData.destination,
                            destination_other: formData.destination_other,
                            pickup_point: formData.pickup_point,
                            ground_time: formData.ground_time,
                            flight_date: formData.flight_date,
                            departure_time: formData.departure_time,
                            service_id: formData.service_id,
                            permission: formData.permission,
                            assigned_pilot: formData.assigned_pilot,
                            status: formData.bookingStatus,
                            payment_type: formData.payment_type,
                            booking_type: formData.booking_type,
                            latitude: formData.latitude,
                            Longitude: formData.longitude,
                            cType: priceCheck,
                            bookingPriceUSD: formData.destination === null || formData.destination === "Others" ? finalpriceInUSDOthers : finalpriceInUSD,
                            bookingPriceBTN: formData.destination === null || formData.destination === "Others" ? finalpriceInBTNOthers : finalpriceInBTN,
                            price: priceCheck === "BTN" && (formData.destination === null || formData.destination === "Others") ? finalpriceInBTNOthers
                                : priceCheck === "BTN" && (formData.destination !== null || formData.destination !== "Others") ? finalpriceInBTN
                                    : priceCheck === "USD" && (formData.destination === null || formData.destination === "Others") ? finalpriceInUSDOthers :
                                        priceCheck === "USD" && (formData.destination !== null || formData.destination !== "Others") ? finalpriceInUSD : "0",
                            payment_status: formData.payment_status,
                            duration: formData.destination === null || formData.destination === "Others" ? formData.duration : durationf * 60,
                            refund_id: formData.refund_id
                        });

                        if (response.data.status === "success") {
                            Swal.fire({
                                title: "Success!",
                                text: "Reservation Made Successfully!, A confirmation mail will be sent to your email address",
                                icon: "success",
                                confirmButtonColor: "#1E306D",
                                confirmButtonText: "OK",
                            });

                            postPassenger(response.data.data._id);
                            onClose();
                            // window.location.reload()
                        }
                    } catch (error) {
                        Swal.fire({
                            title: "Error!",
                            text: error.response ? error.response.data : "Error making the reservation",
                            icon: "error",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });
                    } finally {
                        setLoading(false)
                    }
                } else if (result.isConfirmed && formData.payment_type === "Bank Transfer") {
                    setLoading(true)
                    try {
                        formData.bookingID = generateBookingId();
                        formData.payment_status = "Paid";
                        const fFormData = new FormData();
                        fFormData.append('bookingID', formData.bookingID);
                        fFormData.append('agent_name', formData.agent_name);
                        fFormData.append('agent_contact', formData.agent_contact);
                        fFormData.append('agent_cid', formData.agent_cid);
                        fFormData.append('agent_email', formData.agent_email);
                        fFormData.append('layap', formData.layap);
                        fFormData.append('destination', formData.destination);
                        fFormData.append('destination_other', formData.destination_other);
                        fFormData.append('latitude', formData.latitude);
                        fFormData.append('Longitude', formData.longitude);
                        fFormData.append('pickup_point', formData.pickup_point);
                        fFormData.append('ground_time', formData.ground_time);
                        fFormData.append('flight_date', formData.flight_date);
                        fFormData.append('departure_time', formData.departure_time);
                        fFormData.append('service_id', formData.service_id);
                        fFormData.append('permission', formData.permission);
                        fFormData.append('assigned_pilot', formData.assigned_pilot || null);
                        fFormData.append('status', formData.bookingStatus);
                        fFormData.append('payment_type', formData.payment_type);
                        fFormData.append('booking_type', formData.booking_type);
                        fFormData.append('payment_status', formData.payment_status || "Not paid");
                        fFormData.append('cType', 'BTN');
                        fFormData.append('bookingPriceUSD', formData.destination === null || formData.destination === "Others" ? finalpriceInUSDOthers : finalpriceInUSD);
                        fFormData.append('bookingPriceBTN', formData.destination === null || formData.destination === "Others" ? finalpriceInBTNOthers : finalpriceInBTN);
                        fFormData.append('price', formData.destination === null || formData.destination === "Others" ? finalpriceInBTNOthers : finalpriceInBTN);
                        fFormData.append('journal_no', formData.journal_no || "");
                        fFormData.append('image', formData.paymentScreenShot)
                        fFormData.append('duration', formData.destination === null || formData.destination === "Others" ? formData.duration : durationf * 60);
                        fFormData.append('refund_id', formData.refund_id);
                        const response = await axios.post(`https://helistaging.drukair.com.bt/api/bookings/image/`, fFormData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });

                        if (response.data.status === "success") {
                            Swal.fire({
                                title: "Success!",
                                text: "Reservation Made Successfully!, A confirmation mail will be sent to your email address",
                                icon: "success",
                                confirmButtonColor: "#1E306D",
                                confirmButtonText: "OK",
                            });

                            postPassenger(response.data.data._id);
                            onClose();
                            // window.location.reload()
                        }
                    } catch (error) {
                        console.log(error)
                        Swal.fire({
                            title: "Error!",
                            text: error.response ? error.response.data.message : "Error making the reservation",
                            icon: "error",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });
                    } finally {
                        setLoading(false)
                    }
                }
            });
        } else {
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };
    if (!isOpen) return null;


    return (
        <div className="booking-modal-overlay">
            {loading ? <HelicopterLoader /> :
                <div className="booking-modal-content booking-form-container admin-booking-add-form-container">
                    <span className="service-modal-close-button" onClick={onClose}>
                        &times;
                    </span>
                    <div className='form-title'>Booking Details</div>

                    <form onSubmit={handleSubmit}>
                        <p className='booking-break-header'>Client/Agent Details</p>
                        <div className="booking-form-group">
                            <label>
                                Name of the client/agent
                                <input
                                    type="text"
                                    name="agent_name"
                                    placeholder='Enter Agent Name'
                                    value={formData.agent_name}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Phone Number
                                <input
                                    type="number"
                                    name="agent_contact"
                                    placeholder='#########'
                                    value={formData.agent_contact}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.agentPhone && <span className="error">{errors.agentPhone}</span>}
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                CID
                                <input
                                    type="text"
                                    name="agent_cid"
                                    placeholder='Citizenship Identity Number'
                                    value={formData.agent_cid}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Email Address
                                <input
                                    type="email"
                                    name="agent_email"
                                    placeholder='Email@gmail.com'
                                    value={formData.agent_email}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                        </div>
                        <div className="booking-form-group checkbox-layap-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="layap"
                                    checked={formData.layap}
                                    onChange={handleCheckboxChange}
                                />
                                Are all passengers highlanders? (if all passengers are from Laya,Lingzhi,Soe,Merak,Lunana,Geling they will be liable for 50% discount)
                            </label>
                        </div>

                        <p className='booking-break-header'>Flight Logistics</p>
                        <div className="booking-form-group">
                            <label>
                                Destination
                                <select
                                    name="destination"
                                    value={formData.destination || ""}
                                    onChange={(e) => {
                                        handleChange(e);
                                        getDuration(e.target.value);
                                    }}
                                    required
                                >
                                    <option value="" disabled>Select an option</option>
                                    <option value="Others">Others</option>
                                    {routes
                                        .filter((route) => route.status === 'Enabled')
                                        .map((route) => (
                                            <option key={route._id} value={route._id}>
                                                {route.sector}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            {formData.destination === 'Others' && (<label>
                                Destination (Other)
                                <input
                                    type="text"
                                    name="destination_other"
                                    value={formData.destination_other}
                                    onChange={handleChange}
                                    placeholder='Enter Preferred Destination'
                                />
                            </label>
                            )}
                        </div>

                        {formData.destination === "Others" && (
                            <div className="booking-form-group">
                                <label>
                                    Coodinates Latitude(North/South Value)
                                    <input
                                        type="text"
                                        name="latitude"
                                        placeholder='eg. 40.7128 N'
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Coodinates Longitude(East/West Value)
                                    <input
                                        type="text"
                                        name="longitude"
                                        placeholder='eg. 74.0060 W'
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            </div>
                        )}

                        <div className="booking-form-group">
                            <label>
                                Pick Up Point
                                <input
                                    type="text"
                                    name="pickup_point"
                                    value={formData.pickup_point}
                                    onChange={handleChange}
                                    placeholder='Enter Pick Up Point'
                                    required
                                />
                            </label>
                            <label>
                                Ground Time (In Mins)
                                <input
                                    type="number"
                                    name="ground_time"
                                    value={formData.ground_time}
                                    onChange={handleChange}
                                />
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                Date Of Flight
                                <input
                                    type="date"
                                    name="flight_date"
                                    value={formData.flight_date}
                                    onChange={handleChange}
                                    min={getTodayDate()}
                                    required
                                />
                            </label>
                            <label>
                                Time Of Departure
                                <input
                                    type="time"
                                    name="departure_time"
                                    value={formData.departure_time}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                Service Type
                                <select
                                    name="service_id"
                                    value={formData.service_id}
                                    onChange={(e) => {
                                        handleChange(e);
                                        getPrice(e.target.value)
                                    }}
                                    required
                                >
                                    <option value="" disabled>Select Service Type</option>
                                    {services
                                        .filter((service) => service.status === 'Enabled')
                                        .map((service) => (
                                            <option key={service._id} value={service._id}>
                                                {service.name}
                                            </option>
                                        ))}
                                </select>
                            </label>
                            <label>
                                Permission to land if the helipad is privately owned?
                                <div className='helipadPermission'>
                                    <label className='radio-label'>
                                        <input
                                            type="radio"
                                            name="permission"
                                            checked={formData.permission === 'Yes'}
                                            onChange={() => handleChange({ target: { name: 'permission', value: 'Yes' } })}
                                            required
                                        />
                                        Yes
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            type="radio"
                                            name="permission"
                                            checked={formData.permission === 'No'}
                                            onChange={() => handleChange({ target: { name: 'permission', value: 'No' } })}
                                            required
                                        />
                                        No
                                    </label>
                                </div>
                            </label>
                        </div>

                        <p className='passsenger-weight'>
                            *The total carrying capacity should not exceed {carryingCapacity}kg.
                            Current total weight: {totalWeight}kg
                        </p>

                        {passengers.map((passenger, index) => (
                            <div key={passenger.id} className="passengerWrapper">
                                <p className='passsenger-count'>Passenger {index + 1}</p>
                                <div className="booking-form-group">
                                    <label>
                                        Name
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            placeholder='Enter Passenger Name'
                                            value={passengerData.passengers[index]?.name || ''}
                                            onChange={(e) => handleChange(e, index)}
                                        />
                                    </label>
                                    <label>
                                        Gender
                                        <select
                                            name="gender"
                                            value={passengerData.passengers[index]?.gender || ''}
                                            onChange={(e) => handleChange(e, index)}
                                            required
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            {genderTypes.map((genderType, i) => (
                                                <option key={i} value={genderType}>
                                                    {genderType}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Weight(in Kg)
                                        <input
                                            type="number"
                                            name="weight"
                                            placeholder='Enter Passenger Weight'
                                            required
                                            value={passengerData.passengers[index]?.weight || ''}
                                            onChange={(e) => handleChange(e, index)}
                                        />
                                        {errors[`passengers[${index}].weight`] && <span className="error">{errors[`passengers[${index}].weight`]}</span>}
                                    </label>
                                    <label>
                                        Luggage Weight(in Kg)
                                        <input
                                            type="number"
                                            name="luggageWeight"
                                            placeholder='Enter Luggage Weight'
                                            required
                                            value={passengerData.passengers[index]?.luggageWeight || ''}
                                            onChange={(e) => handleChange(e, index)}
                                        />
                                        {errors[`passengers[${index}].luggageWeight`] && <span className="error">{errors[`passengers[${index}].luggageWeight`]}</span>}
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Phone Number
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            placeholder='########'
                                            required
                                            value={passengerData.passengers[index]?.phoneNumber || ''}
                                            onChange={(e) => handleChange(e, index)}
                                        />
                                    </label>
                                    <label>
                                        CID/Passport
                                        <input
                                            type="text"
                                            name="cidPassport"
                                            required
                                            placeholder='Enter Passenger CID or Passport'
                                            value={passengerData.passengers[index]?.cidPassport || ''}
                                            onChange={(e) => handleChange(e, index)}
                                        />
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Any medical conditions that would prevent the passenger from flying briefly above 14,000 Ft without oxygen?
                                        <div className='helipadPermission'>
                                            <label className='radio-label'>
                                                <input
                                                    type="radio"
                                                    name={`medicalCondition-${index}`}
                                                    value="Yes"
                                                    required
                                                    checked={passengerData.passengers[index]?.medicalCondition === 'Yes'}
                                                    onChange={() => handleChange({
                                                        target: {
                                                            name: 'medicalCondition',
                                                            value: 'Yes'
                                                        }
                                                    }, index)}
                                                />
                                                Yes
                                            </label>
                                            <label className='radio-label'>
                                                <input
                                                    type="radio"
                                                    name={`medicalCondition-${index}`}
                                                    value="No"
                                                    required
                                                    checked={passengerData.passengers[index]?.medicalCondition === 'No'}
                                                    onChange={() => handleChange({
                                                        target: {
                                                            name: 'medicalCondition',
                                                            value: 'No'
                                                        }
                                                    }, index)}
                                                />
                                                No
                                            </label>
                                        </div>
                                    </label>
                                </div>

                                {passengerData.passengers[index]?.medicalCondition === 'Yes' && (
                                    <div className="booking-form-group">
                                        <label>
                                            Please provide details about the medical condition
                                            <textarea
                                                name="medicalRemarks"
                                                placeholder="Enter any medical remarks here"
                                                value={passengerData.passengers[index]?.medicalRemarks || ''}
                                                onChange={(e) => handleChange(e, index)}
                                                className='medicalRemarksInput'
                                            ></textarea>
                                            {/* {passengerErrors[index]?.medicalRemarks && <span className="error">{passengerErrors[index].medicalRemarks}</span>}  */}
                                        </label>
                                    </div>
                                )}


                                {index !== 0 && (
                                    <button
                                        type="button"
                                        className='passenger-btn'
                                        onClick={() => removePassenger(passenger.id, index)}
                                    >
                                        Remove Passenger
                                        <div className="passenger-icon-container">
                                            <IoMdRemove className='passenger-icon' />
                                        </div>
                                    </button>
                                )}
                            </div>
                        ))}

                        {passengers.length <= 5 && (
                            <button type="button" className='passenger-btn' onClick={addPassenger}>
                                Add More
                                <div className="passenger-icon-container">
                                    <IoMdAdd className='passenger-icon' />
                                </div>
                            </button>
                        )}

                        <div className="whiteSpace"></div>

                        <p className='booking-break-header'>Extra Details</p>
                        <div className="booking-form-group">
                            <label>
                                Assigned Pilot
                                <select
                                    name="assigned_pilot"
                                    value={formData.assigned_pilot || ""}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select Pilot</option>
                                    {pilots.map((pilot) => (
                                        <option key={pilot._id} value={pilot._id}>
                                            {pilot.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Booking Status
                                <select
                                    name="bookingStatus"
                                    value={formData.bookingStatus}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Booking Status</option>
                                    {bookingStatuses.map((bookingStatus, index) => (
                                        <option key={index} value={bookingStatus}>
                                            {bookingStatus}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                Refund(in %)
                                <select
                                    name="refund_id"
                                    value={formData.refund_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        {formData.refund_id ? formData.refund_id.plan : "Select Refund Plan"}
                                    </option>
                                    {refunds.map((refund) => (
                                        <option key={refund._id} value={refund._id}>
                                            {refund.plan}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {durationf === 0 ?
                            <>
                                <div className="booking-form-group">
                                    <label>
                                        Duration(in mins)
                                        <input
                                            type="number"
                                            name="duration"
                                            placeholder='000'
                                            value={formData.duration}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setDurationAdmin(e.target.value / 60)
                                            }}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Payment Status
                                        <select
                                            name="payment_status"
                                            value={formData.payment_status}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Not paid">Not Paid</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Price (in BTN)
                                        <input
                                            type="Number"
                                            name="bookingPriceBTN"
                                            value={refundChosenPlan === 0 ? Number(finalpriceInBTNOthers).toFixed(2) : Number(finalpriceInBTNOthers - (finalpriceInBTNOthers * refundChosenPlan)).toFixed(2)}
                                            readOnly
                                        />
                                    </label>
                                    <label>
                                        Price(in USD)
                                        <input
                                            type="Number"
                                            name="bookingPriceUSD"
                                            value={refundChosenPlan === 0 ? Number(finalpriceInUSDOthers).toFixed(2) : Number(finalpriceInUSDOthers - (finalpriceInUSDOthers * refundChosenPlan)).toFixed(2)}
                                            readOnly
                                        />
                                    </label>
                                </div>

                            </>
                            :

                            <>
                                <div className="booking-form-group">
                                    <label>
                                        Duration (Mins)
                                        <input
                                            type="Number"
                                            name="duration"
                                            value={durationf * 60}
                                            readOnly
                                        />
                                    </label>

                                    <label>
                                        Payment Status
                                        <select
                                            name="payment_status"
                                            value={formData.payment_status}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Not paid">Not Paid</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Price (in BTN)
                                        <input
                                            type="Number"
                                            name="bookingPriceBTN"
                                            value={refundChosenPlan === 0 ? Number(finalpriceInBTN).toFixed(2) : Number(finalpriceInBTN - (finalpriceInBTN * refundChosenPlan)).toFixed(2)}
                                            readOnly
                                        />
                                    </label>
                                    <label>
                                        Price(in USD)
                                        <input
                                            type="Number"
                                            name="bookingPriceUSD"
                                            value={refundChosenPlan === 0 ? Number(finalpriceInUSD).toFixed(2) : Number(finalpriceInUSD - (finalpriceInUSD * refundChosenPlan)).toFixed(2)}
                                            readOnly
                                        />
                                    </label>
                                </div>

                            </>
                        }


                        <div className="booking-form-group">
                            <label>
                                Payment Type
                                <select
                                    name="payment_type"
                                    value={formData.payment_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Payment Type</option>
                                    {paymentTypes.map((paymentType, index) => (
                                        <option key={index} value={paymentType}>
                                            {paymentType}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Booking Type
                                <select
                                    name="booking_type"
                                    value={formData.booking_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Booking Type</option>
                                    {bookingTypes.map((bookingType, index) => (
                                        <option key={index} value={bookingType}>
                                            {bookingType}
                                        </option>
                                    ))}
                                </select>
                            </label>

                        </div>

                        {/* {formData.payment_type === 'Bank Transfer' && (
                            <div className="booking-form-group">
                                <label>
                                    Jounal Number
                                    <input
                                        type="number"
                                        name="journal_no"
                                        placeholder='Eg. 134567'
                                        value={formData.journal_no}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Payment Screenshot
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                        )}
                        {imagePreview && (
                            <div className='screenshot-wrapper'>
                                <p>Image Preview:</p>
                                <img
                                    src={imagePreview}
                                    alt="Selected"
                                    className='screenshot-img'
                                />
                            </div>
                        )} */}

                        {formData.payment_type === 'Bank Transfer' && (
                            <div className="booking-form-group">
                                <label>
                                    Journal Number
                                    <input
                                        type="number"
                                        name="journal_no"
                                        placeholder="Eg. 134567"
                                        value={formData.journal_no}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={(ref) => (window.__screenshotInput = ref)} // global trigger
                                    onChange={handleMultipleFilesChange}
                                    style={{ display: 'none' }}
                                />

                            </div>

                        )}

                        {formData.payment_type === 'Bank Transfer' && paymentScreenshots.length > 0 && (
                            <div className="screenshot-wrapper">
                                {paymentScreenshots.map((img, index) => (
                                    <div key={img.id} className="screenshot-preview-box">
                                        <img src={img.preview} alt={`Screenshot ${index + 1}`} className="screenshot-img" />
                                        <button type="button" className="remove-btn" onClick={() => handleRemoveImage(img.id)}>
                                            ✖
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.payment_type === 'Bank Transfer' && (
                            <button
                                type="button"
                                onClick={() => window.__screenshotInput && window.__screenshotInput.click()}
                                className="passenger-btn"
                                style={{ margin: "1rem 0" }}
                            >
                                Add Screenshot +
                            </button>
                        )}

                        <button type="submit" className="booking-add-btn">Add Booking</button>
                    </form>
                </div >
            }
        </div >
    );
}

export default AdminAddBookingModal;