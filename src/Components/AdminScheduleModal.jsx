import React, { useState, useEffect } from "react";
import "./BookingDetailsModal.css";
import axios from "axios";
import Swal from "sweetalert2";
import { IoMdRemove, IoMdAdd } from "react-icons/io";

// pdf
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function AdminScheduleModal({
  isOpen,
  onClose,
  passengers,
  booking,
  onUpdate,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [pilots, setPilots] = useState([]);
  const bookingStatuses = [
    "Cancelled",
    "Confirmed",
    "Delayed",
    "On-Board",
    "Completed",
  ];

  const paymentTypes = ['Bank Transfer', 'Cash', 'MBoB', 'Credit Card'];
  const [refunds, setRefunds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [passengerList, setPassengerList] = useState();

  // Passenger list downloads
  const [downloadFormat, setDownloadFormat] = useState("");

  // multiple images 
  const [paymentScreenshots, setPaymentScreenshots] = useState([]);
  const maxFileSize = 5 * 1024 * 1024;

  // Fields
  const genderTypes = ['Male', 'Female', 'Others'];
  const medicalIssues = ['Yes', 'No'];
  const permissionTypes = ['Yes', 'No'];

  useEffect(() => {
    if (passengers && Array.isArray(passengers)) {
      setPassengerList(passengers);
    }
  }, [passengers]);

  const addPassenger = () => {
    const newPassenger = {
      name: '',
      gender: '',
      weight: '',
      bagWeight: '',
      cid: '',
      contact: '',
      medIssue: '',
      remarks: '',
      boarding: '',
      disembark: ''
    };
    setPassengerList([...passengerList, newPassenger]);
  };

  const removePassenger = async (index) => {
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
        const passengerToRemove = passengerList[index];

        if (passengerToRemove._id) {
          try {
            const response = await axios.delete(
              `https://helistaging.drukair.com.bt/api/passengers/${passengerToRemove._id}`
            );

            if (response.data.status === "success") {
              Swal.fire({
                title: "Success!",
                text: "Passenger Deleted Successfully",
                icon: "success",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
              });

              const updatedPassengers = passengerList.filter((_, i) => i !== index);
              setPassengerList(updatedPassengers);

              if (index === activeTab && updatedPassengers.length > 0) {
                setActiveTab(Math.max(0, index - 1));
              }
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

            console.error("Passenger deletion error:", error);
          }
        } else {
          const updatedPassengers = passengerList.filter((_, i) => i !== index);
          setPassengerList(updatedPassengers);

          if (index === activeTab && updatedPassengers.length > 0) {
            setActiveTab(Math.max(0, index - 1));
          }
        }
      }
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };


  // Responsive route changes
  const cTypes = ['None', 'BTN', 'USD'];
  const [durationf, setDuration] = useState(0)
  const [routes, setRoutes] = useState([]);
  const [services, setServices] = useState([]);
  const [finalpriceInBTNOthers, setFinalPriceInBtnOthers] = useState(0);
  const [finalpriceInUSDOthers, setFinalPriceInUSDOthers] = useState(0);
  const [refundChosenPlan, setRefundChosenPlan] = useState(0);

  let winterWeight = 450
  let summerWeight = 450

  // responsive route changes
  const getDuration = async (id) => {
    if (id === "Others") {
      setDuration(0)
    } else {
      try {
        const response = await axios.get(`https://helistaging.drukair.com.bt/api/routes/${id}`);
        const durations = parseInt(response.data.data.duration)
        setFormData((prev) => ({
          ...prev,
          duration: durations,
        }));
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

      setFormData(prev => ({
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


  useEffect(() => {
    if (
      services.length > 0 &&
      formData.service_id &&
      formData.duration > 0
    ) {
      const selectedService =
        typeof formData.service_id === 'object'
          ? formData.service_id
          : services.find(s => s._id === formData.service_id);
      console.log(selectedService)
      if (selectedService) {
        const calculatedBTN = (Number(selectedService.priceInBTN) * (Number(formData.duration)) / 60);
        const calculatedUSD = (Number(selectedService.priceInUSD) * (Number(formData.duration)) / 60);

        setFinalPriceInBtnOthers(calculatedBTN);
        setFinalPriceInUSDOthers(calculatedUSD);
      }
    }
  }, [services, formData.service_id, formData.duration]);



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


  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        status: booking.status || bookingStatuses[0],
        refund_id: booking.refund_id?._id || "",
        payment_type: booking.payment_type || paymentTypes[0],
        duration:
          booking.destination === null
            ? booking.duration
            : booking.destination?.duration || 0,

        assigned_pilot: booking.assigned_pilot ? booking.assigned_pilot : null,
        bookingPriceBTN: booking.bookingPriceBTN,
        bookingPriceUSD: booking.bookingPriceUSD,

        // updated 
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
        payment_status: booking.payment_status,

        // Routes
        destination: booking.destination ? booking.destination._id : null,
        destination_other: booking.destination_other || "",
        latitude: booking.latitude || "",
        Longitude: booking.Longitude || "",
        service_id: booking.service_id,
        cType: booking.cType


      });
      // ✅ Initialize refund percentage on first load
      if (booking.refund_id?.plan) {
        setRefundChosenPlan(parseFloat(booking.refund_id.plan) / 100);
      }
    }
  }, [booking]);

  useEffect(() => {
    const fetchImages = async () => {
      if (booking && booking.payment_type === 'Bank Transfer' && Array.isArray(booking.image)) {
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
  }, [booking]);


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


  useEffect(() => {
    const fetchBooking = async () => {
      if (booking) {
        try {
          const date = booking.flight_date;
          const response = await axios.get(
            'https://helistaging.drukair.com.bt/api/bookings'
          );
          const bookings = response.data.data;
          const filteredBookings = bookings.filter(
            (b) => new Date(b.flight_date).toLocaleDateString("en-GB") === date
          );
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
  }, [booking]);

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
  }, [bookings, booking]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "refund_id") {
      fetchRefundChosen(value);
    }

    setFormData((prevBooking) => ({
      ...prevBooking,
      [name]: value,
    }));
  };

  if (!isOpen || !booking) return null;

  // Download functions
  const downloadPassengerCSV = (passengers, booking) => {
    const csvHeader = [
      "Name", "Gender", "Weight", "Baggage Weight", "CID/Passport", "Contact No", "Medical Issues", "Boarding", "Disembarking", "Remarks"
    ];

    const csvRows = passengers.map(p => [
      p.name || '', p.gender || '', p.weight || '', p.bagWeight || '',
      p.cid || '', p.contact || '', p.medIssue || '', p.boarding || '', p.disembark || '', p.remarks || ''
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
        "CID/Passport", "Contact No", "Medical Issues", "Boarding", "Disembarking", "Remarks"
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
      p.boarding || '',
      p.disembark || '',
      p.remarks || 'None'
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
      "CID/Passport", "Contact No", "Medical Issues", "Boarding", "Disembarking", "Remarks"
    ];

    const tableRows = passengers.map(p => [
      p.name || '', p.gender || '', p.weight || '', p.bagWeight || '',
      p.cid || '', p.contact || '', p.medIssue || '', p.boarding || '', p.disembark || '', p.remarks || 'None'
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
        <div className="form-title">Booking Details</div>

        <form>
          <p className="booking-break-header">Client/Agent Details</p>

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
                value={formData.agent_name}
                onChange={(e) =>
                  setFormData({ ...formData, agent_name: e.target.value })
                }
              />
            </label>
            <label>
              Phone Number
              <input
                type="number"
                name="agentPhone"
                value={formData.agent_contact}
                onChange={(e) =>
                  setFormData({ ...formData, agent_contact: e.target.value })
                }
                required
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              CID
              <input
                type="text"
                name="agentCid"
                value={formData.agent_cid}
                onChange={(e) =>
                  setFormData({ ...formData, agent_cid: e.target.value })
                }
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="agentEmail"
                value={formData.agent_email}
                onChange={(e) =>
                  setFormData({ ...formData, agent_email: e.target.value })
                }
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
              Are all passengers highlanders? (if all passengers are from Laya,Lunana,Gasa,Merak,Sakteng they will be liable for 50% discount)
            </label>
          </div>

          <p className="booking-break-header">Flight Logistics</p>
          <div className="booking-form-group">
            {/* <label>
              Destination
              <input
                type="text"
                name="destination"
                value={
                  booking.destination === null
                    ? booking.destination_other
                    : booking.destination.sector
                }
                readOnly
              />
            </label> */}
            <label>
              Destination
              <select
                name="destination"
                value={formData.destination === null ? 'Others' : formData.destination}
                onChange={(e) => {
                  const selected = e.target.value;
                  setFormData({
                    ...formData,
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
                value={formData.pickup_point}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_point: e.target.value })
                }
              />
            </label>
          </div>

          {/* Show additional fields if "Others" is selected */}
          {(formData.destination === 'Others' || formData.destination === null) && (

            <>
              <div className="booking-form-group">
                <label>
                  Destination (Other)
                  <input
                    type="text"
                    name="destination_other"
                    value={formData.destination_other || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, destination_other: e.target.value })
                    }
                    placeholder='Enter Preferred Destination'
                    required
                  />
                </label>
              </div>

              <div className="booking-form-group">
                <label>
                  Coordinates Latitude (North/South Value)
                  <input
                    type="text"
                    name="latitude"
                    placeholder="eg. 40.7128 N"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Coordinates Longitude (East/West Value) 1
                  <input
                    type="text"
                    name="Longitude"
                    placeholder="eg. 74.0060 W"
                    value={formData.Longitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Longitude: e.target.value })
                    }
                    required
                  />
                </label>
              </div>
            </>
          )}

          {/* {booking.destination === null ?
            <div className="booking-form-group">
              <label>
                Coordinates Latitude (North/South Value)
                <input
                  type="text"
                  name="latitude"
                  placeholder="eg. 40.7128 N"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                />
              </label>

              <label>
                Coordinates Longitude (East/West Value)
                <input
                  type="text"
                  name="longitude"
                  placeholder="eg. 74.0060 W"
                  value={formData.Longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                />
              </label>
            </div> : null
          } */}

          <div className="booking-form-group">
            {/* <label>
              Ground Time ("If Required")
              <input name="groundTime"
                value={formData.ground_time}
                onChange={(e) =>
                  setFormData({ ...formData, ground_time: e.target.value })
                }
              />
            </label> */}


            <label>
              Ground Time ("If Required")
              <input
                name="groundTime"
                value={formData.ground_time}
                onChange={(e) =>
                  setFormData({ ...formData, ground_time: e.target.value })
                }
              />
            </label>

            {/* <label>
              Date Of Flight
              <input name="flightDate" value={booking.flight_date} readOnly />
            </label> */}

            {/* Coversion of date format as it doesnt display if the format is wrong */}

            <label>
              Date Of Flight
              <input
                type="date"
                name="flightDate"
                value={
                  formData.flight_date
                    ? formData.flight_date.split('/').reverse().join('-')
                    : ''
                }
                onChange={(e) =>
                  setFormData({ ...formData, flight_date: e.target.value.split('-').reverse().join('/') })
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
                value={formData.departure_time}
                onChange={(e) =>
                  setFormData({ ...formData, departure_time: e.target.value })
                }
              />

            </label>

            <label>
              Permission for Private Helipad
              <select
                name="permission"
                value={
                  formData.permission === true || formData.permission === "true"
                    ? "Yes"
                    : formData.permission === false || formData.permission === "false"
                      ? "No"
                      : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
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

          <div>
            <div className="passenger-tab-wrapper">
              {passengerList && passengerList.map((passenger, index) => (
                <div
                  key={index}
                  className={`passenger-tab ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  Passenger {index + 1}
                </div>
              ))}
            </div>

            {passengerList && passengerList[activeTab] && (
              <>
                <div className="booking-form-group">
                  <label>
                    Name
                    <input
                      type="text"
                      name="name"
                      required
                      value={passengerList[activeTab]?.name || ''
                      }
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].name = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    />
                  </label>

                  <label> Gender
                    <select
                      name="gender"
                      value={passengerList[activeTab]?.gender || ''}
                      required
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].gender = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    >
                      <option value="" disabled>Select gender</option>
                      {genderTypes.map((gender) => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Weight (Kg)
                    <input
                      type="number"
                      name="weight"
                      value={passengerList[activeTab]?.weight || ''}
                      required
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].weight = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    />
                  </label>

                  <label>
                    Baggage Weight (Kg)
                    <input
                      type="number"
                      name="luggageWeight"
                      value={passengerList[activeTab]?.bagWeight || ''}
                      required
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].bagWeight = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    />
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Passport/CID
                    <input
                      type="text"
                      name="cidPassport"
                      value={passengerList[activeTab]?.cid || ''}
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].cid = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      type="number"
                      name="phoneNumber"
                      value={passengerList[activeTab]?.contact || ''}
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].contact = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    />
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Boarding Location
                    <input
                      type="text"
                      name="boarding"
                      value={passengerList[activeTab]?.boarding || ''}
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].boarding = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    />
                  </label>
                  <label>
                    Disembarking Location
                    <input
                      type="text"
                      name="disembarking"
                      value={passengerList[activeTab]?.disembark || ''}
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].disembark = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    />
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Medical Issue
                    <select
                      name="medicalIssue"
                      value={passengerList[activeTab]?.medIssue || ''}
                      required
                      onChange={(e) => {
                        const updatedPassengers = [...passengerList];
                        updatedPassengers[activeTab].medIssue = e.target.value;
                        setPassengerList(updatedPassengers);
                      }}
                    >
                      <option value="" disabled>Select Medical Issue</option>
                      {medicalIssues.map((medIssue) => (
                        <option key={medIssue} value={medIssue}>{medIssue}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {passengerList[activeTab]?.medIssue === 'Yes' && (
                  <div className="booking-form-group">
                    <label>
                      Please provide details about the medical condition
                      <textarea
                        name="remarks"
                        placeholder="Enter any medical remarks here"
                        value={passengerList[activeTab]?.remarks || ''}
                        onChange={(e) => {
                          const updatedPassengers = [...passengerList];
                          updatedPassengers[activeTab].remarks = e.target.value;
                          setPassengerList(updatedPassengers);
                        }}
                        className="medicalRemarksInput"
                      ></textarea>
                    </label>
                  </div>
                )}
              </>
            )}

            {passengerList.length > 1 && (
              <button
                type="button"
                className='passenger-btn'
                onClick={() => removePassenger(activeTab)}
                style={{ marginBottom: '20px' }}
              >
                Remove Passenger
                <div className="passenger-icon-container" >
                  <IoMdRemove className='passenger-icon' />
                </div>
              </button>
            )}

            {passengerList.length < 6 && (
              <button type="button" className='passenger-btn' onClick={addPassenger}>
                Add More
                <div className="passenger-icon-container">
                  <IoMdAdd className='passenger-icon' />
                </div>
              </button>
            )}
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
                type="button"
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
          <p className="booking-break-header">Extra Details</p>
          <div className="booking-form-group">
            <label>
              Assigned Pilot
              <select
                name="assigned_pilot"
                value={formData.assigned_pilot || ""}
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
              {booking.status !== "Declined" ? (
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select status</option>
                  {bookingStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="status"
                  value={booking.status}
                  readOnly
                />
              )}
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Service Type
              <select
                name="service_id"
                value={formData.service_id?._id || formData.service_id}
                onChange={(e) => {
                  const selected = e.target.value;
                  setFormData({
                    ...formData,
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
              Payable
              <input
                type="text"
                name="payable"
                value={booking.payable === true ? "Yes" : "No"}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Refund(in %)
              <select
                name="refund_id"
                value={formData.refund_id || ""}
                onChange={handleInputChange}
                required
              // readOnly
              >
                <option value="">Select refund policy</option>
                {refunds.map((refund) => (
                  <option key={refund._id} value={refund._id}>
                    {refund.plan}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Duration (Mins)
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }));
                }}
                disabled={formData.destination !== "Others"}
              />
            </label>
          </div>
          <div className="booking-form-group">
            <label>
              Payment Status
              <select
                value={formData.payment_status}
                name='payment_status'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_status: e.target.value
                  })
                }
              >
                <option value="Paid">Paid</option>
                <option value="Not paid">Not Paid</option>
                <option value="Credit">Credit</option>
              </select>

            </label>
            <label>  Currency Type
              <select
                name="name"
                value={formData.cType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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

          {/* <div className="booking-form-group">
            <label>
              Price (in BTN)
              <input
                type="Number"
                name="bookingPriceBTN"
                value={Number(booking.refund_id ? (booking.bookingPriceBTN - (booking.bookingPriceBTN * (booking.refund_id.plan / 100))) : booking.bookingPriceBTN).toFixed(2)}
                readOnly
              />
            </label>
            <label>
              Price(in USD)
              <input
                type="Number"
                name="bookingPriceUSD"
                value={Number(booking.refund_id ? ((booking.bookingPriceUSD - (booking.bookingPriceUSD * (booking.refund_id.plan / 100)))) : (booking.bookingPriceUSD)).toFixed(2)}
                readOnly
              />
            </label>
          </div> */}

          <div className="booking-form-group">
            <label>
              Price (in BTN)
              <input
                type="number"
                name="bookingPriceBTN"
                value={
                  refundChosenPlan === 0
                    ? Number(finalpriceInBTNOthers).toFixed(2)
                    : Number(finalpriceInBTNOthers - (finalpriceInBTNOthers * refundChosenPlan)).toFixed(2)
                }
                readOnly
              />
            </label>
            <label>
              Price (in USD)
              <input
                type="number"
                name="bookingPriceUSD"
                value={
                  refundChosenPlan === 0
                    ? Number(finalpriceInUSDOthers).toFixed(2)
                    : Number(finalpriceInUSDOthers - (finalpriceInUSDOthers * refundChosenPlan)).toFixed(2)
                }
                readOnly
              />
            </label>
          </div>


          <div className="booking-form-group">
            <label>
              Booking Type
              <input
                type="text"
                name="bookingType"
                value={booking.booking_type}
                readOnly
              />
            </label>

            <label>
              Payment Type
              <select
                name="payment_type"
                value={formData.payment_type ? formData.payment_type : ""}
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

          {(formData.payment_type === 'Bank Transfer' || formData.payment_type === 'MBoB') && (
            <div className="booking-form-group">
              <label>
                Journal Number
                <input
                  type="text"
                  name="journal_no"
                  placeholder="Eg. 134567"
                  value={formData.journal_no}
                  onChange={handleInputChange}
                  required={formData.payment_type === 'MBoB'}
                />
              </label>

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                ref={(ref) => (window.__editScreenshotInput = ref)}
                onChange={handleMultipleFilesChange}
                style={{ display: 'none' }}
                required
              />
            </div>
          )}
          {(formData.payment_type === 'Bank Transfer' || formData.payment_type === 'MBoB') && paymentScreenshots.length > 0 && (
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

          {(formData.payment_type === 'Bank Transfer' || formData.payment_type === 'MBoB') && (
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
              const images = paymentScreenshots.filter(img => img.file);
              onUpdate(formData, passengerList, images);
            }}
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminScheduleModal;