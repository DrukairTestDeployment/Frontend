import React, { useState, useEffect } from 'react';
import './BookingDetailsModal.css';
import axios from "axios";
import Swal from "sweetalert2";
import { IoMdRemove, IoMdAdd, IoIosRemoveCircleOutline } from "react-icons/io";

// pdf
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


function AdminBookingModal({ isModalOpen, onClose, booking, legs, passengers, onUpdate }) {
    const [priceInUSDOthers, setPriceInUSDOthers] = useState(booking.bookingPriceUSD)
    const [priceInBtnOthers, setPriceInBtnOthers] = useState(booking.bookingPriceBTN)
    const paymentTypes = ['Bank Transfer', 'Cash', 'MBoB', 'Credit Card'];
    const [pilots, setPilots] = useState([]);
    const bookingStatuses = ['Booked', 'Pending', 'Confirmed'];
    const bookingTypes = ['Walk-In', 'Online', 'Phone Call', 'Agency', 'Email'];

    const [weightLimits, setWeightLimits] = useState({
        summer: 450,
        winter: 450,
    });

    const getSeasonFromDate = (dateStr) => {
        if (!dateStr) return "summer";
        const month = new Date(dateStr).getMonth() + 1; 
        return (month >= 3 && month <= 8) ? "summer" : "winter";
    };


    // Responsive route changes
    const cTypes = ['None', 'BTN', 'USD'];
    const [durationf, setDuration] = useState(0)
    const [routes, setRoutes] = useState([]);
    const [services, setServices] = useState([]);
    const [finalpriceInBTNOthers, setFinalPriceInBtnOthers] = useState(0);
    const [finalpriceInUSDOthers, setFinalPriceInUSDOthers] = useState(0);
    // const [images, setImages] = useState([])
    const [paymentScreenshots, setPaymentScreenshots] = useState([]);

    // Passenger list downloads
    const [downloadFormat, setDownloadFormat] = useState("");

    // Dynamic routes
    const [routeList, setRouteList] = useState([]);
    const [newRouteName, setNewRouteName] = useState('');
    const [activeRouteIndex, setActiveRouteIndex] = useState(0);
    const [activePassengerIndex, setActivePassengerIndex] = useState(0);
    const maxPassengersPerRoute = 6;

    useEffect(() => {
        if (Array.isArray(legs) && Array.isArray(passengers)) {
            const mapped = legs.map(leg => ({
                ...leg,
                passengers: passengers.filter(p => p.leg_id?.toString() === leg._id?.toString())
            }));
            setRouteList(mapped);
        }
    }, [legs, passengers]);


    const addRoute = () => {
        if (!newRouteName.trim()) return;
        const newRoute = {
            name: newRouteName.trim(),
            passengers: [
                {
                    name: '',
                    weight: '',
                    bagWeight: '',
                    cid: '',
                    contact: '',
                    medIssue: '',
                    remarks: '',
                    gender: ''
                }
            ],
        };
        setRouteList([...routeList, newRoute]);
        setNewRouteName('');
        setActiveRouteIndex(routeList.length);
        setActivePassengerIndex(0);
    };

    const removeRoute = (id) => {

        // Unsaved routes
        const isUnsaved = !id;

        if (isUnsaved) {
            // Remove from state only
            const updated = routeList.filter(route => route._id !== id);
            setRouteList(updated);
            setActiveRouteIndex(Math.max(0, updated.length - 1));
            return;
        }


        // saved routes
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to remove this route?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(
                        `https://helistaging.drukair.com.bt/api/leg/${id}`
                    );

                    if (response.data.status === "success") {
                        Swal.fire({
                            title: "Success!",
                            text: "Route Removed Successfully",
                            icon: "success",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });
                    } else {
                        Swal.fire({
                            title: "Warning!",
                            text: "Deletion may not have been successful",
                            icon: "warning",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        title: "Error!",
                        text: error.response?.data?.message || "Error deleting route",
                        icon: "error",
                        confirmButtonColor: "#1E306D",
                        confirmButtonText: "OK",
                    });

                }
                // if (activeRouteIndex >= updated.length) {
                //     setActiveRouteIndex(Math.max(0, updated.length - 1));
                // }
            }
        });
    };

    const updateRouteName = (id, newName) => {
        Swal.fire({
            title: "",
            text: "Are you sure you want to update the route name?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1E306D",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Update Route Name",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.patch(`https://helistaging.drukair.com.bt/api/leg/${id}`, {
                        name: newName
                    });
                    if (res.data.status === "success") {
                        Swal.fire({
                            title: "Success!",
                            text: "Route Name Updated Successfully",
                            icon: "success",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
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
        })
    };

    const addPassengerToRoute = (routeId) => {
        setRouteList(routeList.map((route, idx) => {
            if (route._id === routeId && route.passengers?.length < maxPassengersPerRoute) {
                const newPassengers = [...route.passengers, {
                    name: '', weight: '', bagWeight: '', cid: '', contact: '', medIssue: '', remarks: '', gender: ''
                }];
                if (idx === activeRouteIndex) {
                    setActivePassengerIndex(newPassengers.length - 1);
                }
                return { ...route, passengers: newPassengers };
            }
            return route;
        }));
    };

    const updatePassenger = (routeId, index, field, value) => {
        setRouteList(prevRoutes =>
            prevRoutes.map(route => {
                if (route._id === routeId) {
                    const updatedPassengers = [...route.passengers];
                    updatedPassengers[index][field] = value;

                    // Calculate total weight
                    const totalWeight = updatedPassengers.reduce((sum, p) =>
                        sum + (parseFloat(p.weight || 0) + parseFloat(p.bagWeight || 0)), 0
                    );

                    // Get current season
                    const season = getSeasonFromDate(bookingUpdate.flight_date);
                    const weightLimit = weightLimits[season];

                    if (totalWeight > weightLimit) {
                        Swal.fire({
                            title: "Exceeded Weight Limit!",
                            text: `Total passenger + baggage weight (${totalWeight} kg) exceeds the ${season} limit of ${weightLimit} kg.`,
                            icon: "error",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });
                        return route; // prevent update
                    }

                    return { ...route, passengers: updatedPassengers };
                }
                return route;
            })
        );
    };


    const removePassengerFromRoute = (passengerId) => {
        const isUnsaved = !passengerId;

        if (isUnsaved) {
            setRouteList(prev =>
                prev.map((route, i) =>
                    i === activeRouteIndex
                        ? {
                            ...route,
                            passengers: route.passengers.filter((_, idx) => idx !== activePassengerIndex)
                        }
                        : route
                )
            );
            setActivePassengerIndex(0);
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to remove this passenger?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(
                        `https://helistaging.drukair.com.bt/api/passengers/${passengerId}`
                    );

                    if (response.data.status === "success") {
                        Swal.fire({
                            title: "Success!",
                            text: "Passenger Deleted Successfully",
                            icon: "success",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });

                        setRouteList(prev =>
                            prev.map((route, i) =>
                                i === activeRouteIndex
                                    ? {
                                        ...route,
                                        passengers: route.passengers.filter((p, idx) => p._id !== passengerId)
                                    }
                                    : route
                            )
                        );

                        setActivePassengerIndex(0);
                    } else {
                        Swal.fire({
                            title: "Warning!",
                            text: "Deletion may not have been successful",
                            icon: "warning",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        title: "Error!",
                        text: error.response?.data?.message || "Error deleting passenger",
                        icon: "error",
                        confirmButtonColor: "#1E306D",
                        confirmButtonText: "OK",
                    });
                }
            }
        });
    };


    const handleRouteDoubleClick = (id, currentName) => {
        Swal.fire({
            title: 'Edit Route Name',
            input: 'text',
            inputValue: currentName,
            showCancelButton: true,
            confirmButtonText: 'Update',
            preConfirm: (newName) => {
                if (!newName.trim()) {
                    Swal.showValidationMessage('Name cannot be empty');
                }
                return newName.trim();
            }
        }).then(result => {
            if (result.isConfirmed) {
                updateRouteName(id, result.value);
            }
        });
    };

    // End of block

    const getDuration = async (id) => {
        if (id === "Others") {
            setDuration(0)
        } else {
            try {
                const response = await axios.get(`https://helistaging.drukair.com.bt/api/routes/${id}`);
                const durations = parseInt(response.data.data.duration)
                setBookingUpdate((prev) => ({
                    ...prev,
                    duration: durations,
                }));
                setWeightLimits({
                    summer: parseFloat(response.data.data.summerWeight),
                    winter: parseFloat(response.data.data.winterWeight),
                });
          
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

    // Price dynamic
    const getPrice = async (id) => {
        try {
            const response = await axios.get(`https://helistaging.drukair.com.bt/api/services/${id}`);
            const priceUSD = response.data.data.priceInUSD;
            const priceBTN = response.data.data.priceInBTN;

            setBookingUpdate(prev => ({
                ...prev,
                bookingPriceUSD: priceUSD,
                bookingPriceBTN: priceBTN
            }));
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.response ? error.response.data.error : "Error fetching price",
                icon: "error",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
            });
        }
    };

    // fetch pilots
    useEffect(() => {
        const fetchPilots = async () => {
            try {
                const response = await axios.get("https://helistaging.drukair.com.bt/api/users", { withCredentials: true });
                const allPilots = response.data.data.filter(
                    (user) => user.role.name === "PILOT"
                );
                setPilots(allPilots);
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
        fetchPilots();
    }, [booking]);

    const [bookingUpdate, setBookingUpdate] = useState({
        id: booking._id,
        duration: booking.destination === null
            ? booking.duration
            : booking.destination?.duration || 0,
        assigned_pilot: booking.assigned_pilot ? booking.assigned_pilot : null,
        bookingPriceBTN: booking.bookingPriceBTN,
        bookingPriceUSD: booking.bookingPriceUSD,
        refund_id: booking.refund_id ? booking.refund_id._id : 0,
        payable: booking.payable || false,
        layap: booking.layap || false,
        payment_status: booking.payment_status || "Not paid",
        payment_type: booking.payment_type,

        // UPDATED
        agent_name: booking.agent_name,
        agent_contact: booking.agent_contact,
        agent_cid: booking.agent_cid,
        agent_email: booking.agent_email,
        pickup_point: booking.pickup_point,
        ground_time: booking.ground_time,
        flight_date: booking.flight_date?.includes('/')
            ? booking.flight_date.split('/').reverse().join('-')
            : booking.flight_date,
        departure_time: booking.departure_time,
        permission: booking.permission,
        // booking_type: booking.booking_type, 
        journal_no: booking.journal_no,

        status: booking.status,
        booking_type: booking.booking_type,

        // Routes
        destination: booking.destination ? booking.destination._id : null,
        destination_other: booking.destination_other || "",
        latitude: booking.latitude || "",
        Longitude: booking.Longitude || "",
        service_id: booking.service_id,
        cType: booking.cType,

    });

    useEffect(() => {
        const service =
            typeof bookingUpdate.service_id === 'object'
                ? bookingUpdate.service_id
                : services.find(s => s._id === bookingUpdate.service_id);

        if (service && bookingUpdate.duration > 0) {
            const calculatedBTN = service.priceInBTN * bookingUpdate.duration / 60;
            const calculatedUSD = service.priceInUSD * bookingUpdate.duration / 60;

            setFinalPriceInBtnOthers(calculatedBTN);
            setFinalPriceInUSDOthers(calculatedUSD);
        }
    }, [bookingUpdate.duration, bookingUpdate.service_id, services]);

    const [refunds, setRefunds] = useState([]);
    const [imageError, setImageError] = useState(false);
    // const [refundChosenPlan, setRefundChosenPlan] = useState(parseFloat(booking?.refund_id.plan / 100));
    const [refundChosenPlan, setRefundChosenPlan] = useState(0);

    const [passengerList, setPassengerList] = useState(passengers);
    const [activeTab, setActiveTab] = useState(0);

    // const [imagePreview, setImagePreview] = useState(''); 
    const maxFileSize = 5 * 1024 * 1024; // Max size 5MB


    // Load existing image into state on mount
    useEffect(() => {
        const fetchImages = async () => {
            if ((booking.payment_type === 'Bank Transfer' || booking.payment_type === 'MBoB') && Array.isArray(booking.image)) {
                const fetchedImages = [];

                for (const img of booking.image) {
                    try {
                        const response = await axios.get(`https://helistaging.drukair.com.bt/api/bookings/image/get/${img}`);
                        const pic = response.data.data;

                        if (!fetchedImages.includes(pic)) {
                            fetchedImages.push({
                                id: `${img}-${Date.now()}-${Math.random()}`,
                                preview: pic,
                                isExisting: true
                            });
                        }
                    } catch (error) {
                        Swal.fire({
                            title: "Error!",
                            text: error.response ? error.response.data.error : "Error fetching image",
                            icon: "error",
                            confirmButtonColor: "#1E306D",
                            confirmButtonText: "OK",
                        });
                    }
                }
                setPaymentScreenshots(fetchedImages);
            }
        };

        fetchImages();
    }, [booking.payment_type, booking.image]);


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
        event.target.value = null;
    };

    // Remove any image
    const handleRemoveImage = async (id) => {
        const image = paymentScreenshots.find(img => img.id === id);

        if (!image || !image.preview) {
            console.error("Image not found or missing preview URL.");
            return;
        }

        try {
            // Extract S3 key from image.preview
            const url = new URL(image.preview);
            const imageKey = decodeURIComponent(url.pathname.split('/').pop());

            const response = await axios.delete(
                `https://helistaging.drukair.com.bt/api/bookings/imagedelete/${booking._id}/${imageKey}`
            );

            if (response.data.status === "success") {
                Swal.fire({
                    title: "Success!",
                    text: "Image deleted successfully",
                    icon: "success",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });

                setPaymentScreenshots(prev => {
                    const filtered = prev.filter(img => img.id !== id);
                    if (!image.isExisting && image.preview) {
                        URL.revokeObjectURL(image.preview); // revoke only for newly added ones
                    }
                    return filtered;
                });

            } else {
                Swal.fire({
                    title: "Warning!",
                    text: "Image Deletion Unsuccessful",
                    icon: "warning",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Error deleting image",
                icon: "error",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
            });
        }
    };


    useEffect(() => {
        return () => {
            paymentScreenshots.forEach(img => {
                if (img.preview) URL.revokeObjectURL(img.preview);
            });
        };
    }, []);


    // Fields
    const genderTypes = ['Male', 'Female', 'Others'];
    const permissionTypes = ['Yes', 'No'];
    const medicalIssues = ['Yes', 'No'];


    useEffect(() => {
        if (booking?.refund_id?.plan) {
            setRefundChosenPlan(parseFloat(booking.refund_id.plan) / 100);
        }
    }, [booking]);



    useEffect(() => {
        setBookingUpdate((prevBooking) => ({
            ...prevBooking,
            bookingPriceBTN: priceInBtnOthers,
            bookingPriceUSD: priceInUSDOthers,
        }));
    }, [priceInBtnOthers, priceInUSDOthers]);

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
            const refundPlan = response.data.data.plan;
            setRefundChosenPlan(parseFloat(refundPlan) / 100);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "refund_id") {
            fetchRefundChosen(value);
        }

        setBookingUpdate((prevBooking) => ({
            ...prevBooking,
            [name]: value,
        }));
    };

    if (!isModalOpen || !booking) return null;

    const downloadPassengerCSV = (passengers, booking) => {
        const csvHeader = [
            "Name", "Gender", "Weight", "Luggage Weight", "CID/Passport", "Contact No", "Medical Issues", "Remarks"
        ];

        const csvRows = passengers.map(p => [
            p.name || '', p.gender || '', p.weight || '', p.bagWeight || '',
            p.cid || '', p.contact || '', p.medIssue || '', p.remarks || '',
        ]);

        const headerLines = [
            `Flight Date: ${booking?.flight_date || ""}`,
            `Booking ID: ${booking?.bookingID || ""}`,
            ""
        ];

        const csvContent = [
            ...headerLines,
            csvHeader.join(","),
            ...csvRows.map(row => row.map(field => `"${field}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `passenger_list_${booking?.bookingID || 'booking'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPassengerXLSX = (passengers, booking) => {
        if (!passengers || passengers.length === 0) {
            Swal.fire("No Data", "There are no passengers to download.", "info");
            return;
        }

        const header = [
            ["Flight Date:", booking.flight_date || ""],
            ["Booking ID:", booking.bookingID || ""],
            [], // empty row before table
            [
                "Name", "Gender", "Weight", "Baggage Weight",
                "CID/Passport", "Contact No", "Medical Issues", "Remarks"
            ]
        ];

        const rows = passengers.map(p => [
            p.name || '',
            p.gender || '',
            p.weight || '',
            p.bagWeight || '',
            p.cid ? `'${p.cid}` : '', // fix large number formatting
            p.contact || '',
            p.medIssue || '',
            p.remarks || 'None',

        ]);

        const data = [...header, ...rows];

        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // Optional: set column width
        worksheet["!cols"] = [
            { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
            { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Passengers");

        XLSX.writeFile(workbook, `passenger_list_${booking.bookingID || "booking"}.xlsx`);
    };

    const downloadPassengerPDF = (passengers, booking) => {
        const doc = new jsPDF();

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Passenger List`, 14, 15);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Flight Date: ${booking?.flight_date || ""}`, 14, 25);
        doc.text(`Booking ID: ${booking?.bookingID || ""}`, 14, 32);

        const tableColumn = [
            "Name", "Gender", "Weight", "Baggage Weight",
            "CID/Passport", "Contact No", "Medical Issues", "Remarks"
        ];

        const tableRows = passengers.map(p => [
            p.name || '', p.gender || '', p.weight || '', p.bagWeight || '',
            p.cid || '', p.contact || '', p.medIssue || '', p.remarks || 'None'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 30 },
                4: { cellWidth: 35 },
                7: { cellWidth: 40 }
            }
        });

        doc.save(`passenger_list_${booking?.bookingID || 'booking'}.pdf`);
    };

    const handleDownload = (type) => {
        if (!type) return;

        if (type === "csv") {
            downloadPassengerCSV(passengerList, booking);
        } else if (type === "pdf") {
            downloadPassengerPDF(passengerList, booking);
        } else if (type === "xlsx") {
            downloadPassengerXLSX(passengerList, booking);
        }
    };

    return (
        <div className="booking-modal-overlay">
            <div className="booking-modal-content booking-form-container">
                <span className="service-modal-close-button" onClick={onClose}>
                    &times;
                </span>
                <div className='form-title'>Booking Details</div>

                <form>
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
                                value={bookingUpdate.agent_name}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, agent_name: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Phone Number
                            <input
                                type="number"
                                name="agentPhone"
                                value={bookingUpdate.agent_contact}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, agent_contact: e.target.value })
                                }
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            CID/Passport
                            <input
                                type="text"
                                name="agentCid"
                                value={bookingUpdate.agent_cid}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, agent_cid: e.target.value })
                                }
                            />
                        </label>

                        <label>
                            Email Address
                            <input
                                type="email"
                                name="agentEmail"
                                value={bookingUpdate.agent_email}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, agent_email: e.target.value })
                                }
                            />
                        </label>
                    </div>

                    <div className="booking-form-group checkbox-layap-group">
                        <label>
                            <input
                                type="checkbox"
                                name="layap"
                                checked={bookingUpdate.layap}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, layap: e.target.checked })
                                }
                            />
                            Are all passengers highlanders? (if all passengers are from Laya,Lingzhi,Soe,Merak,Lunana,Geling they will be liable for 50% discount)
                        </label>
                    </div>

                    <p className='booking-break-header'>Flight Logistics</p>
                    <div className="booking-form-group">
                        {/* <label>
                            Destination
                            <input
                                type="text"
                                name="destination"
                                // value={booking.destination === null ? booking.destination_other : booking.destination.sector}
                                // readOnly
                                value={bookingUpdate.destination}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, destination: e.target.value })
                                }
                            />
                        </label> */}
                        <label>
                            Destination
                            <select
                                name="destination"
                                value={bookingUpdate.destination === null ? 'Others' : bookingUpdate.destination}
                                onChange={(e) => {
                                    const selected = e.target.value;
                                    setBookingUpdate({
                                        ...bookingUpdate,
                                        destination: selected,
                                        ...(selected !== "Others" && {
                                            destination_other: "",
                                            latitude: "",
                                            Longitude: ""
                                        })
                                    });
                                    getDuration(selected);
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
                        <label>
                            Pick Up Point
                            <input
                                type="text"
                                name="pickUpPoint"
                                value={bookingUpdate.pickup_point}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, pickup_point: e.target.value })
                                }
                            />
                        </label>
                    </div>

                    {/* Show additional fields if "Others" is selected */}
                    {(bookingUpdate.destination === 'Others' || bookingUpdate.destination === null) && (
                        <>
                            <div className="booking-form-group">
                                <label>
                                    Destination (Other)
                                    <input
                                        type="text"
                                        name="destination_other"
                                        value={bookingUpdate.destination_other || ""}
                                        onChange={(e) =>
                                            setBookingUpdate({ ...bookingUpdate, destination_other: e.target.value })
                                        }
                                        placeholder='Enter Preferred Destination'
                                        required
                                    />
                                </label>
                            </div>

                            <div className="booking-form-group">
                                <label>
                                    Coordinates Latitude (North/South Value) - Optional
                                    <input
                                        type="text"
                                        name="latitude"
                                        placeholder="eg. 40.7128 N"
                                        value={bookingUpdate.latitude || ""}
                                        onChange={(e) =>
                                            setBookingUpdate({ ...bookingUpdate, latitude: e.target.value })
                                        }
                                    />
                                </label>
                                <label>
                                    Coordinates Longitude (East/West Value) - Optional
                                    <input
                                        type="text"
                                        name="Longitude"
                                        placeholder="eg. 74.0060 W"
                                        value={bookingUpdate.Longitude || ""}
                                        onChange={(e) =>
                                            setBookingUpdate({ ...bookingUpdate, Longitude: e.target.value })
                                        }
                                    />
                                </label>
                            </div>
                        </>
                    )}

                    <div className="booking-form-group">
                        <label>
                            Ground Time ("If Required")
                            <input
                                name="groundTime"
                                value={bookingUpdate.ground_time}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, ground_time: e.target.value })
                                }
                            />
                        </label>


                        <label>
                            Date Of Flight
                            <input
                                type="date"
                                name="flightDate"
                                value={bookingUpdate.flight_date}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, flight_date: e.target.value })
                                }
                            />

                        </label>

                    </div>

                    <div className="booking-form-group">
                        <label>
                            Time of Departure
                            <input
                                type="time"
                                name="departureTime"
                                value={bookingUpdate.departure_time}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, departure_time: e.target.value })
                                }
                            />
                        </label>

                        <label>  Permission for Private Helipad
                            <select
                                name="permission"
                                value={
                                    bookingUpdate.permission || ""}
                                onChange={(e) =>
                                    setBookingUpdate({
                                        ...bookingUpdate,
                                        permission: e.target.value === "Yes" ? "true" : "false"
                                    })
                                }
                                required
                            >
                                <option value="" disabled>Select Permission</option>
                                {permissionTypes.map((permission) => (
                                    <option key={permission} value={permission}>{permission}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Passengelist download button */}
                    <div>
                        <label style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>Download Passenger List:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <select
                                value={downloadFormat}
                                onChange={(e) => setDownloadFormat(e.target.value)}
                                style={{ padding: '5px', fontWeight: 'bold' }}
                            >
                                <option value="" disabled>Select format</option>
                                <option value="csv">CSV</option>
                                <option value="pdf">PDF</option>
                                <option value="xlsx">XLSX</option>
                            </select>

                            <button
                                onClick={() => handleDownload(downloadFormat)}
                                className="passenger-btn"
                                disabled={!downloadFormat}
                                style={
                                    {
                                        padding: '0 12px'
                                    }
                                }
                            >
                                Download
                            </button>
                        </div>
                    </div>

                    <div className="whiteSpace"></div>

                    {/* Routes Block */}
                    <>
                        <div className="booking-form-group">
                            <input
                                type="text"
                                placeholder="Enter route name"
                                value={newRouteName}
                                onChange={(e) => setNewRouteName(e.target.value)}
                            />
                            <button type="button" className="passenger-btn" onClick={addRoute}>
                                Add Route
                                <div className="passenger-icon-container">
                                    <IoMdAdd className='passenger-icon' />
                                </div>
                            </button>
                        </div>

                        <div className="passenger-tab-wrapper">
                            {routeList.map((route, index) => (
                                <div
                                    key={route._id}
                                    className={`passenger-tab route-tab ${index === activeRouteIndex ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveRouteIndex(index);
                                        setActivePassengerIndex(0);
                                    }}
                                    onDoubleClick={() => handleRouteDoubleClick(route._id, route.name)}
                                >
                                    <span className="route-name-ellipsis">{route.name}</span>
                                    <button
                                        type="button"
                                        className='passenger-btn route-btn'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeRoute(route._id, index);
                                        }}
                                    >
                                        <IoIosRemoveCircleOutline className='passenger-icon' />
                                    </button>
                                </div>
                            ))}
                        </div>


                        {routeList[activeRouteIndex] && (
                            <div>
                                <div className="passenger-tab-wrapper">
                                    {routeList[activeRouteIndex].passengers.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`passenger-tab ${idx === activePassengerIndex ? 'active' : ''}`}
                                            onClick={() => setActivePassengerIndex(idx)}
                                        >
                                            Passenger {idx + 1}
                                        </div>
                                    ))}
                                </div>

                                {routeList[activeRouteIndex].passengers[activePassengerIndex] && (
                                    <>
                                        {/* Name & Gender */}
                                        <div className="booking-form-group">
                                            <label>
                                                Name
                                                <input
                                                    type="text"
                                                    required
                                                    value={routeList[activeRouteIndex].passengers[activePassengerIndex].name}
                                                    onChange={e =>
                                                        updatePassenger(
                                                            routeList[activeRouteIndex]._id,
                                                            activePassengerIndex,
                                                            'name',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label>
                                                Gender
                                                <select
                                                    required
                                                    value={routeList[activeRouteIndex].passengers[activePassengerIndex].gender || ''}
                                                    onChange={e =>
                                                        updatePassenger(
                                                            routeList[activeRouteIndex]._id,
                                                            activePassengerIndex,
                                                            'gender',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="" disabled>Select gender</option>
                                                    {genderTypes.map(gender => (
                                                        <option key={gender} value={gender}>{gender}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        {/* Weight & Luggage Weight */}
                                        <div className="booking-form-group">
                                            <label>
                                                Weight (Kg)
                                                <input
                                                    type="number"
                                                    required
                                                    value={routeList[activeRouteIndex].passengers[activePassengerIndex].weight}
                                                    onChange={e =>
                                                        updatePassenger(
                                                            routeList[activeRouteIndex]._id,
                                                            activePassengerIndex,
                                                            'weight',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label>
                                                Luggage Weight (Kg)
                                                <input
                                                    type="number"
                                                    value={routeList[activeRouteIndex].passengers[activePassengerIndex].bagWeight || ''}
                                                    onChange={e =>
                                                        updatePassenger(
                                                            routeList[activeRouteIndex]._id,
                                                            activePassengerIndex,
                                                            'bagWeight',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>

                                        {/* Passport/CID & Phone Number */}
                                        <div className="booking-form-group">
                                            <label>
                                                Passport/CID
                                                <input
                                                    type="text"
                                                    required
                                                    value={routeList[activeRouteIndex].passengers[activePassengerIndex].cid}
                                                    onChange={e =>
                                                        updatePassenger(
                                                            routeList[activeRouteIndex]._id,
                                                            activePassengerIndex,
                                                            'cid',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label>
                                                Phone Number
                                                <input
                                                    type="number"
                                                    value={routeList[activeRouteIndex].passengers[activePassengerIndex].contact || ''}
                                                    onChange={e =>
                                                        updatePassenger(
                                                            routeList[activeRouteIndex]._id,
                                                            activePassengerIndex,
                                                            'contact',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>

                                        {/* Medical Issues */}
                                        <div className="booking-form-group">
                                            <label>
                                                Medical Issues
                                                <select
                                                    required
                                                    value={routeList[activeRouteIndex].passengers[activePassengerIndex].medIssue || ''}
                                                    onChange={e =>
                                                        updatePassenger(
                                                            routeList[activeRouteIndex]._id,
                                                            activePassengerIndex,
                                                            'medIssue',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="" disabled>Select Medical Issue</option>
                                                    {medicalIssues.map(medIssue => (
                                                        <option key={medIssue} value={medIssue}>{medIssue}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        {/* Medical Remarks (conditional) */}
                                        {routeList[activeRouteIndex].passengers[activePassengerIndex].medIssue === 'Yes' && (
                                            <div className="booking-form-group">
                                                <label>
                                                    Please provide details about the medical condition
                                                    <textarea
                                                        placeholder="Enter any medical remarks here"
                                                        value={routeList[activeRouteIndex].passengers[activePassengerIndex].remarks || ''}
                                                        onChange={e =>
                                                            updatePassenger(
                                                                routeList[activeRouteIndex]._id,
                                                                activePassengerIndex,
                                                                'remarks',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="medicalRemarksInput"
                                                    ></textarea>
                                                </label>
                                            </div>
                                        )}
                                    </>
                                )}


                                {routeList[activeRouteIndex].passengers.length > 0 && (
                                    <button
                                        type="button"
                                        className='passenger-btn'
                                        onClick={() => removePassengerFromRoute(routeList[activeRouteIndex].passengers[activePassengerIndex]._id)}
                                        style={{ marginBottom: '20px' }}
                                    >
                                        Remove Passenger
                                        <div className="passenger-icon-container">
                                            <IoMdRemove className='passenger-icon' />
                                        </div>
                                    </button>
                                )}

                                {routeList[activeRouteIndex].passengers.length < maxPassengersPerRoute && (

                                    <button
                                        type="button"
                                        className='passenger-btn'
                                        onClick={() => addPassengerToRoute(routeList[activeRouteIndex]._id)}
                                    >
                                        Add More
                                        <div className="passenger-icon-container">
                                            <IoMdAdd className='passenger-icon' />
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </>

                    <div className="whiteSpace"></div>

                    <p className='booking-break-header'>Extra Details</p>
                    <div className="booking-form-group">
                        {/* <label>
                            Assigned Pilot
                            <input
                                type="text"
                                name="assignedPilot"
                                value={booking.assigned_pilot ? booking.assigned_pilot.name : "No Pilots Assigned"}
                                readOnly
                            />
                        </label> */}

                        <label>
                            Assigned Pilot
                            <select
                                name="assigned_pilot"
                                value={bookingUpdate.assigned_pilot || ""}
                                onChange={handleInputChange}
                            >
                                <option hidden value="">
                                    {booking.assigned_pilot ? booking.assigned_pilot.name : "Assign a pilot"}
                                </option>
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
                                value={bookingUpdate.status}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, status: e.target.value })
                                }
                            >
                                <option value="" disabled>Select Booking Status</option>
                                {bookingStatuses.map((status, index) => (
                                    <option key={index} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="booking-form-group">

                        <label>
                            Service Type
                            <select
                                name="service_id"
                                value={bookingUpdate.service_id?._id || bookingUpdate.service_id}
                                onChange={(e) => {
                                    const selected = e.target.value;
                                    setBookingUpdate({
                                        ...bookingUpdate,
                                        service_id: selected
                                    });
                                    getPrice(selected);
                                }}
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
                            Booking Type
                            <select
                                name="booking_type"
                                value={bookingUpdate.booking_type}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, booking_type: e.target.value })
                                }
                            >
                                <option value="" disabled>Select Booking Type</option>
                                {bookingTypes.map((booking_type, index) => (
                                    <option key={index} value={booking_type}>
                                        {booking_type}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Duration (Mins)
                            <input
                                type="number"
                                name="duration"
                                value={bookingUpdate.duration}
                                onChange={(e) => {
                                    setBookingUpdate((prev) => ({
                                        ...prev,
                                        duration: e.target.value,
                                    }));
                                }}
                                disabled={bookingUpdate.destination !== "Others"}
                            />
                        </label>

                        <label>  Currency Type
                            <select
                                name="name"
                                value={bookingUpdate.cType}
                                onChange={(e) =>
                                    setBookingUpdate({
                                        ...bookingUpdate,
                                        cType: e.target.value
                                    })
                                }
                            >
                                <option value="" disabled>Select Currency Type</option>
                                {cTypes.map((cType) => (
                                    <option key={cType} value={cType}>{cType}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Refund (in %)
                            <select
                                name="refund_id"
                                value={bookingUpdate.refund_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option hidden value="">
                                    {booking.refund_id ? booking.refund_id.plan : "Select Refund Plan"}
                                </option>
                                {refunds.map((refund) => (
                                    <option key={refund._id} value={refund._id}>
                                        {refund.plan}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Payment Status
                            <select
                                value={bookingUpdate.payment_status}
                                name='payment_status'
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, payment_status: e.target.value })
                                }
                            >
                                <option value="Paid">Paid</option>
                                <option value="Not paid">Not Paid</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </label>
                    </div>
                    <div className="booking-form-group">
                        <label>
                            Price (in BTN)
                            <input
                                type="number"
                                name="bookingPriceBTN"
                                value={refundChosenPlan === 0
                                    ? Number(finalpriceInBTNOthers).toFixed(2)
                                    : Number(finalpriceInBTNOthers - (finalpriceInBTNOthers * refundChosenPlan)).toFixed(2)}
                                readOnly
                            />
                        </label>
                        <label>
                            Price (in USD)
                            <input
                                type="number"
                                name="bookingPriceUSD"
                                value={refundChosenPlan === 0
                                    ? Number(finalpriceInUSDOthers).toFixed(2)
                                    : Number(finalpriceInUSDOthers - (finalpriceInUSDOthers * refundChosenPlan)).toFixed(2)}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Payable
                            <select
                                value={bookingUpdate.payable}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, payable: e.target.value === "true" })
                                }
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </label>

                        <label>
                            Payment Type
                            <select
                                name="payment_type"
                                value={bookingUpdate.payment_type ? bookingUpdate.payment_type : ""}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Payment Type</option>
                                {paymentTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {(bookingUpdate.payment_type === 'Bank Transfer' || bookingUpdate.payment_type === 'MBoB') && (
                        <div className="booking-form-group">
                            <label>
                                Journal Number
                                <input
                                    type="text"
                                    name="journal_no"
                                    placeholder="Eg. 134567"
                                    value={bookingUpdate.journal_no}
                                    onChange={handleInputChange}
                                    required={bookingUpdate.payment_type === 'MBoB'}
                                />
                            </label>

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={(ref) => (window.__editScreenshotInput = ref)}
                                onChange={handleMultipleFilesChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    )}


                    {(bookingUpdate.payment_type === 'Bank Transfer' || bookingUpdate.payment_type === 'MBoB') && paymentScreenshots.length > 0 && (
                        <div className="screenshot-wrapper">
                            {paymentScreenshots.map((img, index) => (
                                <div key={img.id} className="screenshot-preview-box">
                                    <img src={img.preview ? img.preview : img} alt={`Screenshot ${index + 1}`} className="screenshot-img" />
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => {
                                            Swal.fire({
                                                title: 'Are you sure?',
                                                text: 'Do you really want to delete this image?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#d33',
                                                cancelButtonColor: '#3085d6',
                                                confirmButtonText: 'Yes, delete it!'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    handleRemoveImage(img.id);
                                                }
                                            });
                                        }}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {(bookingUpdate.payment_type === 'Bank Transfer' || bookingUpdate.payment_type === 'MBoB') && (
                        <button
                            type="button"
                            onClick={() => window.__editScreenshotInput && window.__editScreenshotInput.click()}
                            className="passenger-btn"
                            style={{ margin: '1rem 0' }}
                        >
                            Add Screenshot +
                        </button>
                    )}


                    <button
                        type="submit"
                        className="admin-booking-modal-btn admin-schedule-modal-btn"
                        onClick={(e) => {

                            e.preventDefault();
                            if (bookingUpdate.status === 'Confirmed' && bookingUpdate.payment_status === 'Not paid') {
                                Swal.fire({
                                    title: "Information",
                                    text: "The payment for this booking is incomplete. Please make sure it is either Paid or Credit!",
                                    icon: "info",
                                    confirmButtonColor: "#1E306D",
                                    showConfirmButton: true
                                });
                            } else {

                                const images = paymentScreenshots.filter(img => img.file);
                                onUpdate(bookingUpdate, routeList, images);

                            }
                        }}
                    >
                        Update
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminBookingModal;