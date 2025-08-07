import React, { useState, useEffect } from "react";
import "./BookingDetailsModal.css";
import { IoMdAdd, IoMdRemove, IoIosRemoveCircleOutline } from "react-icons/io";
import Swal from "sweetalert2";
import axios from "axios";
import HelicopterLoader from "./HelicopterLoader";

function AdminAddBookingModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const genderTypes = ["Male", "Female", "Others"];
  const bookingStatuses = ["Booked", "Confirmed"];
  const paymentTypes = [
    "Online",
    "Bank Transfer",
    "Cash",
    "MBoB",
    "Credit Card",
  ];
  const bookingTypes = ["Walk-In", "Online", "Phone Call", "Agency", "Email"];
  const cTypes = ["BTN", "USD"];
  const [pilots, setPilots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [services, setServices] = useState([]);

  const [errors, setErrors] = useState({});
  const [totalWeight, setTotalWeight] = useState(0);
  const [passengers, setPassengers] = useState([{ id: Date.now() }]);
  const [imagePreview, setImagePreview] = useState("");
  const maxFileSize = 5 * 1024 * 1024; // Max size 5MB

  const [weightLimits, setWeightLimits] = useState({
    summer: 450,
    winter: 450,
  });

  const getSeasonFromDate = (dateStr) => {
    if (!dateStr) return "summer";
    const month = new Date(dateStr).getMonth() + 1;
    return month >= 3 && month <= 8 ? "summer" : "winter";
  };

  const [priceInBTN, setPriceInBtn] = useState("");
  const [priceInUSD, setPriceInUSD] = useState("");
  const [durationf, setDuration] = useState(0);

  const [durationAdmin, setDurationAdmin] = useState(0);
  const [refunds, setRefunds] = useState([]);
  const [refundChosenPlan, setRefundChosenPlan] = useState(0);

  let finalpriceInBTNOthers = Number(priceInBTN * durationAdmin).toFixed(2);
  let finalpriceInUSDOthers = Number(priceInUSD * durationAdmin).toFixed(2);
  let finalpriceInBTN = Number(priceInBTN * durationf).toFixed(2);
  let finalpriceInUSD = Number(priceInUSD * durationf).toFixed(2);

  // Route
  const [routeList, setRouteList] = useState([]);

  const [newRouteName, setNewRouteName] = useState("");
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const maxPassengersPerRoute = 6;
  const medicalIssues = ["Yes", "No"];

  const addRoute = () => {
    if (!newRouteName.trim()) return;
    const newRoute = {
      id: Date.now(),
      name: newRouteName.trim(),
      passengers: [
        {
          name: "",
          weight: "",
          bagWeight: "",
          cid: "",
          contact: "",
          medIssue: "",
          remarks: "",
          gender: "",
        },
      ],
    };
    setRouteList([...routeList, newRoute]);
    setNewRouteName("");
    setActiveRouteIndex(routeList.length);
    setActivePassengerIndex(0);
  };

  const removeRoute = (id) => {
    if (id) {
      // Remove from state only
      const updated = routeList.filter((route) => route.id !== id);
      setRouteList(updated);
      setActiveRouteIndex(Math.max(0, updated.length - 1));
      return;
    }
  };

  const updateRouteName = (id, newName) => {
    if (id) {
        // Just update local state
      setRouteList((prevRoutes) =>
        prevRoutes.map((route) =>
          route.id === id ? { ...route, name: newName } : route
        )
      );
      return  
    }
  };

  const addPassengerToRoute = (routeId) => {
    setRouteList(
      routeList.map((route, idx) => {
        if (
          route.id === routeId &&
          route.passengers.length < maxPassengersPerRoute
        ) {
          const newPassengers = [
            ...route.passengers,
            {
              name: "",
              weight: "",
              bagWeight: "",
              cid: "",
              contact: "",
              medIssue: "",
              remarks: "",
              gender: "",
            },
          ];
          if (idx === activeRouteIndex) {
            setActivePassengerIndex(newPassengers.length - 1);
          }
          return { ...route, passengers: newPassengers };
        }
        return route;
      })
    );
  };

  const updatePassenger = (routeId, index, field, value) => {
    setRouteList((prevRoutes) =>
      prevRoutes.map((route) => {
        // Support both saved and unsaved route IDs
        const matchId = route._id || route.id;
        if (matchId === routeId) {
          const updatedPassengers = [...route.passengers];

          // Guard against undefined passenger index
          if (!updatedPassengers[index]) {
            updatedPassengers[index] = {
              name: "",
              weight: "",
              bagWeight: "",
              cid: "",
              contact: "",
              medIssue: "",
              remarks: "",
              gender: "",
            };
          }

          updatedPassengers[index][field] = value;

          // Calculate total weight
          const totalWeight = updatedPassengers.reduce(
            (sum, p) =>
              sum + (parseFloat(p.weight || 0) + parseFloat(p.bagWeight || 0)),
            0
          );

          const season = getSeasonFromDate(formData.flight_date);
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
    if (passengerId) {
      setRouteList((prev) =>
        prev.map((route, i) =>
          i === activeRouteIndex
            ? {
                ...route,
                passengers: route.passengers.filter(
                  (_, idx) => idx !== activePassengerIndex
                ),
              }
            : route
        )
      );
      setActivePassengerIndex(0);
      return;
    }
  };

  const handleRouteDoubleClick = (id, currentName) => {
    Swal.fire({
      title: "Edit Route Name",
      input: "text",
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: (newName) => {
        if (!newName.trim()) {
          Swal.showValidationMessage("Name cannot be empty");
        }
        return newName.trim();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        updateRouteName(id, result.value);
      }
    });
  };
  const [carryingCapacity, setCarryingCapacity] = useState(450);

  // Multiple image input
  const [paymentScreenshots, setPaymentScreenshots] = useState([]);

  const handleMultipleFilesChange = (event) => {
    const files = Array.from(event.target.files);

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= maxFileSize
    );

    const newImages = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setPaymentScreenshots((prev) => [...prev, ...newImages]);

    event.target.value = null;
  };

  // console.log(paymentScreenshots)

  const handleRemoveImage = (id) => {
    setPaymentScreenshots((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // Revoke URLs to avoid memory leaks
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  useEffect(() => {
    return () => {
      paymentScreenshots.forEach((img) => URL.revokeObjectURL(img.preview));
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
    cType: "",
    price: 0,
    bookingPriceUSD: 0,
    bookingPriceBTN: 0,
    payment_status: "",
    journal_no: "",
    duration: "",
    refund_id: "",
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };
  const [passengerData, setPassengerData] = useState({
    passengers: [{}],
  });

  useEffect(() => {
    const fetchBooking = async () => {
      if (formData.flight_date) {
        try {
          const date = new Date(formData.flight_date).toLocaleDateString(
            "en-GB"
          );
          const response = await axios.get(
            `https://helistaging.drukair.com.bt/api/bookings`
          );
          const bookings = response.data.data;
          const filteredBookings = bookings.filter(
            (booking) =>
              new Date(booking.flight_date).toLocaleDateString("en-GB") === date
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
  }, [formData.flight_date]);

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
      const response = await axios.get(
        `https://helistaging.drukair.com.bt/api/refund/${rId}`
      );
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
    const fetchPilot = async () => {
      try {
        const response = await axios.get("https://helistaging.drukair.com.bt/api/users", {
          withCredentials: true,
        });
        const pilots = response.data.data;
        const filteredPilots = pilots.filter(
          (user) => user.role.name === "PILOT"
        );

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
        const response = await axios.get("https://helistaging.drukair.com.bt/api/services");
        setServices(
          Array.isArray(response.data.data) ? response.data.data : []
        );
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
      setDuration(0);
      setCarryingCapacity(450); // fallback default
    } else {
      try {
        const response = await axios.get(
          `https://helistaging.drukair.com.bt/api/routes/${id}`
        );
        const data = response.data.data;
        const durationInHours = parseInt(data.duration) / 60;
        setDuration(durationInHours);
        formData.duration = data.duration;

        const winter = parseFloat(data.winterWeight);
        const summer = parseFloat(data.summerWeight);

        const selectedDate = new Date(formData.flight_date);
        const isSummer = [3, 4, 5, 6, 7, 8].includes(
          selectedDate.getMonth() + 1
        ); // months are 0-based

        setCarryingCapacity(isSummer ? summer : winter);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.response
            ? error.response.data.error
            : "Error saving the booking",
          icon: "error",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const getPrice = async (id) => {
    try {
      const response = await axios.get(
        `https://helistaging.drukair.com.bt/api/services/${id}`
      );
      const priceUSD = response.data.data.priceInUSD;
      const priceBTN = response.data.data.priceInBTN;
      setPriceInUSD(priceUSD);
      setPriceInBtn(priceBTN);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response
          ? error.response.data.error
          : "Error saving the booking",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  // const validateForm = () => {
  //     const newErrors = {};

  //     if (totalWeight > carryingCapacity) {
  //         newErrors.totalWeight = `Total weight exceeds carrying capacity of ${carryingCapacity}kg`;
  //     }

  //     passengerData.passengers.forEach((passenger, index) => {

  //         if (passenger.luggageWeight && (passenger.luggageWeight < 0)) {
  //             newErrors[`passengers[${index}].luggageWeight`] = 'Luggage weight must be a non-negative number';
  //         }

  //         if (totalWeight > carryingCapacity) {
  //             Swal.fire({
  //                 icon: 'error',
  //                 title: 'Weight Limit Exceeded',
  //                 text: `Total weight (${totalWeight}kg) exceeds the carrying capacity of ${carryingCapacity}kg`,
  //             });
  //             return false;
  //         }
  //     });

  //     setErrors(newErrors);
  //     return Object.keys(newErrors).length === 0;
  // };

  const validateForm = () => {
    let errorRoute = null;

    for (let i = 0; i < routeList.length; i++) {
      const route = routeList[i];
      let routeWeight = 0;

      for (const p of route.passengers) {
        routeWeight += Number(p.weight || 0) + Number(p.bagWeight || 0);
      }

      if (routeWeight > carryingCapacity) {
        errorRoute = route.name || `Route ${i + 1}`;
        Swal.fire({
          icon: "error",
          title: "Weight Limit Exceeded",
          text: `Route "${errorRoute}" exceeds carrying capacity of ${carryingCapacity}Kg with total weight ${routeWeight}Kg.`,
        });
        return false;
      }
    }

    return true;
  };

  const handleChange = (e, passengerIndex) => {
    const { name, value } = e.target;
    if (passengerIndex !== undefined) {
      setPassengerData((prevData) => ({
        ...prevData,
        passengers: prevData.passengers.map((passenger, index) =>
          index === passengerIndex ? { ...passenger, [name]: value } : passenger
        ),
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    if (name === "refund_id") {
      fetchRefundChosen(value);
    }
  };

  function generateBookingId() {
    const prefix = "DHRS";
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return prefix + randomDigits;
  }

  // const handleFileChange = (event) => {
  //     const file = event.target.files[0];

  //     if (file) {
  //         if (!file.type.startsWith('image/')) {
  //             alert("Please upload a valid image file.");
  //             return;
  //         }

  //         if (file.size > maxFileSize) {
  //             alert("File size should not exceed 5MB.");
  //             return;
  //         }

  //         setFormData((prevData) => ({
  //             ...prevData,
  //             paymentScreenShot: file,
  //         }));

  //         const previewUrl = URL.createObjectURL(file);
  //         setImagePreview(previewUrl);
  //     }
  // };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    calculateTotalWeight();
  }, [passengerData.passengers]);

  const calculateTotalWeight = () => {
    const weight = passengerData.passengers.reduce((sum, passenger) => {
      return (
        sum +
        (Number(passenger.weight) || 0) +
        (Number(passenger.luggageWeight) || 0)
      );
    }, 0);
    setTotalWeight(weight);
  };

  const postRoute = async (route, id) => {
    // for (const passenger of passengers) {
    try {
      const response = await axios.post("https://helistaging.drukair.com.bt/api/leg", {
        name: route.name,
        booking_id: id,
      });
      if (response.data.status === "success") {
        for (const passenger of route.passengers) {
          postPassenger(passenger, response.data.data._id, id);
        }
      } else {
        throw new Error(response.data.message || "Failed to update booking");
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
  };

  const postPassenger = async (passenger, rid, id) => {
    try {
      await axios.post("https://helistaging.drukair.com.bt/api/passengers", {
        name: passenger.name,
        weight: passenger.weight,
        cid: passenger.cid,
        bagWeight: passenger.bagWeight,
        gender: passenger.gender,
        medIssue: passenger.medIssue,
        contact: passenger.contact,
        booking_id: id,
        leg_id: rid,
        remarks: passenger.remarks,
      });
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      Swal.fire({
        title: "",
        text: "Are you sure you want to book?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#1E306D",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, book!",
      }).then(async (result) => {
        if (
          result.isConfirmed &&
          formData.payment_type !== "Bank Transfer" &&
          formData.payment_type !== "MBoB"
        ) {
          setLoading(true);
          try {
            const priceCheck =
              formData.payment_type === "Cash" ? "BTN" : formData.cType;
            const response = await axios.post(
              `https://helistaging.drukair.com.bt/api/bookings`,
              {
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
                bookingPriceUSD:
                  formData.destination === null ||
                  formData.destination === "Others"
                    ? finalpriceInUSDOthers
                    : finalpriceInUSD,
                bookingPriceBTN:
                  formData.destination === null ||
                  formData.destination === "Others"
                    ? finalpriceInBTNOthers
                    : finalpriceInBTN,
                price:
                  priceCheck === "BTN" &&
                  (formData.destination === null ||
                    formData.destination === "Others")
                    ? finalpriceInBTNOthers
                    : priceCheck === "BTN" &&
                      (formData.destination !== null ||
                        formData.destination !== "Others")
                    ? finalpriceInBTN
                    : priceCheck === "USD" &&
                      (formData.destination === null ||
                        formData.destination === "Others")
                    ? finalpriceInUSDOthers
                    : priceCheck === "USD" &&
                      (formData.destination !== null ||
                        formData.destination !== "Others")
                    ? finalpriceInUSD
                    : "0",
                payment_status: formData.payment_status,
                duration:
                  formData.destination === null ||
                  formData.destination === "Others"
                    ? formData.duration
                    : durationf * 60,
                refund_id: formData.refund_id,
              }
            );

            if (response.data.status === "success") {
              for (const route of routeList) {
                postRoute(route, response.data.data._id);
              }
              Swal.fire({
                title: "Success!",
                text: "Reservation Made Successfully!, A confirmation mail will be sent to your email address",
                icon: "success",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
              });
              // postPassenger(response.data.data._id);
              onClose();
              // window.location.reload()
            }
          } catch (error) {
            Swal.fire({
              title: "Error!",
              text: error.response
                ? error.response.data
                : "Error making the reservation",
              icon: "error",
              confirmButtonColor: "#1E306D",
              confirmButtonText: "OK",
            });
          } finally {
            setLoading(false);
          }
        } else if (
          result.isConfirmed &&
          (formData.payment_type === "Bank Transfer" ||
            formData.payment_type === "MBoB")
        ) {
          if (paymentScreenshots.length === 0) {
            Swal.fire({
              icon: "error",
              title: "Screenshot Required",
              text: "Please upload at least one payment screenshot.",
            });
            return;
          }
          setLoading(true);
          try {
            formData.bookingID = generateBookingId();
            formData.payment_status = "Paid";
            const fFormData = new FormData();
            fFormData.append("bookingID", formData.bookingID);
            fFormData.append("agent_name", formData.agent_name);
            fFormData.append("agent_contact", formData.agent_contact);
            fFormData.append("agent_cid", formData.agent_cid);
            fFormData.append("agent_email", formData.agent_email);
            fFormData.append("layap", formData.layap);
            fFormData.append("destination", formData.destination);
            fFormData.append("destination_other", formData.destination_other);
            fFormData.append("latitude", formData.latitude);
            fFormData.append("Longitude", formData.longitude);
            fFormData.append("pickup_point", formData.pickup_point);
            fFormData.append("ground_time", formData.ground_time);
            fFormData.append("flight_date", formData.flight_date);
            fFormData.append("departure_time", formData.departure_time);
            fFormData.append("service_id", formData.service_id);
            fFormData.append("permission", formData.permission);
            fFormData.append("assigned_pilot", formData.assigned_pilot || null);
            fFormData.append("status", formData.bookingStatus);
            fFormData.append("payment_type", formData.payment_type);
            fFormData.append("booking_type", formData.booking_type);
            fFormData.append(
              "payment_status",
              formData.payment_status || "Not paid"
            );
            fFormData.append("cType", "BTN");
            fFormData.append(
              "bookingPriceUSD",
              formData.destination === null || formData.destination === "Others"
                ? finalpriceInUSDOthers
                : finalpriceInUSD
            );
            fFormData.append(
              "bookingPriceBTN",
              formData.destination === null || formData.destination === "Others"
                ? finalpriceInBTNOthers
                : finalpriceInBTN
            );
            fFormData.append(
              "price",
              formData.destination === null || formData.destination === "Others"
                ? finalpriceInBTNOthers
                : finalpriceInBTN
            );
            fFormData.append("journal_no", formData.journal_no || "");
            paymentScreenshots.forEach((img) => {
              fFormData.append("image", img.file); // `images` must match multer.array('images', 10)
            });

            fFormData.append(
              "duration",
              formData.destination === null || formData.destination === "Others"
                ? formData.duration
                : durationf * 60
            );
            fFormData.append("refund_id", formData.refund_id);
            const response = await axios.post(
              `https://helistaging.drukair.com.bt/api/bookings/image/`,
              fFormData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            if (response.data.status === "success") {
              for (const route of routeList) {
                await postRoute(route, response.data.data._id);
              }
              Swal.fire({
                title: "Success!",
                text: "Reservation Made Successfully!, A confirmation mail will be sent to your email address",
                icon: "success",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
              });

              // postPassenger(response.data.data._id);
              onClose();
              // window.location.reload()
            }
          } catch (error) {
            Swal.fire({
              title: "Error!",
              text: error.response
                ? error.response.data.error
                : "Error making the reservation",
              icon: "error",
              confirmButtonColor: "#1E306D",
              confirmButtonText: "OK",
            });
          } finally {
            setLoading(false);
          }
        }
      });
    } else {
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay">
      {loading ? (
        <HelicopterLoader />
      ) : (
        <div className="booking-modal-content booking-form-container admin-booking-add-form-container">
          <span className="service-modal-close-button" onClick={onClose}>
            &times;
          </span>
          <div className="form-title">Booking Details</div>

          <form onSubmit={handleSubmit}>
            <p className="booking-break-header">Client/Agent Details</p>
            <div className="booking-form-group">
              <label>
                Name of the client/agent
                <input
                  type="text"
                  name="agent_name"
                  placeholder="Enter Agent Name"
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
                  placeholder="#########"
                  value={formData.agent_contact}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="booking-form-group">
              <label>
                CID/Passport
                <input
                  type="text"
                  name="agent_cid"
                  placeholder="Enter CID/Passport"
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
                  placeholder="Email@gmail.com"
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
                Are all passengers highlanders? (if all passengers are from
                Laya,Lingzhi,Soe,Merak,Lunana,Geling they will be liable for 50%
                discount)
              </label>
            </div>

            <p className="booking-break-header">Flight Logistics</p>
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
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="Others">Others</option>
                  {routes
                    .filter((route) => route.status === "Enabled")
                    .map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.sector}
                      </option>
                    ))}
                </select>
              </label>

              {formData.destination === "Others" && (
                <label>
                  Destination (Other)
                  <input
                    type="text"
                    name="destination_other"
                    value={formData.destination_other}
                    onChange={handleChange}
                    placeholder="Enter Preferred Destination"
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
                    placeholder="eg. 40.7128 N"
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
                    placeholder="eg. 74.0060 W"
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
                  placeholder="Enter Pick Up Point"
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
                    getPrice(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>
                    Select Service Type
                  </option>
                  {services
                    .filter((service) => service.status === "Enabled")
                    .map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Permission to land if the helipad is privately owned?
                <div className="helipadPermission">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="permission"
                      checked={formData.permission === "Yes"}
                      onChange={() =>
                        handleChange({
                          target: { name: "permission", value: "Yes" },
                        })
                      }
                      required
                    />
                    Yes
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="permission"
                      checked={formData.permission === "No"}
                      onChange={() =>
                        handleChange({
                          target: { name: "permission", value: "No" },
                        })
                      }
                      required
                    />
                    No
                  </label>
                </div>
              </label>
            </div>

            <p className="passsenger-weight">
              *The total carrying capacity should not exceed {carryingCapacity}
              kg. Current total weight: {totalWeight}kg
            </p>

            <>
              <div className="booking-form-group">
                <input
                  type="text"
                  placeholder="Enter route name"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                />
                <button
                  type="button"
                  className="passenger-btn"
                  onClick={addRoute}
                >
                  Add Route
                  <div className="passenger-icon-container">
                    <IoMdAdd className="passenger-icon" />
                  </div>
                </button>
              </div>

              <div className="passenger-tab-wrapper">
                {routeList.map((route, index) => (
                  <div
                    key={route.id}
                    className={`passenger-tab route-tab ${
                      index === activeRouteIndex ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveRouteIndex(index);
                      setActivePassengerIndex(0);
                    }}
                    onDoubleClick={() =>
                      handleRouteDoubleClick(route._id || route.id, route.name)
                    }
                  >
                    <span className="route-name-ellipsis">{route.name}</span>
                    <button
                      type="button"
                      className="passenger-btn route-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoute(route._id || route.id, index);
                      }}
                    >
                      <IoIosRemoveCircleOutline className="passenger-icon" />
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
                        className={`passenger-tab ${
                          idx === activePassengerIndex ? "active" : ""
                        }`}
                        onClick={() => setActivePassengerIndex(idx)}
                      >
                        Passenger {idx + 1}
                      </div>
                    ))}
                  </div>

                  {routeList[activeRouteIndex].passengers[
                    activePassengerIndex
                  ] && (
                    <>
                      {/* Name & Gender */}
                      <div className="booking-form-group">
                        <label>
                          Name
                          <input
                            type="text"
                            placeholder="Enter passenger name"
                            value={
                              routeList[activeRouteIndex].passengers[
                                activePassengerIndex
                              ].name
                            }
                            onChange={(e) =>
                              updatePassenger(
                                routeList[activeRouteIndex]._id ||
                                  routeList[activeRouteIndex].id,
                                activePassengerIndex,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </label>
                        <label>
                          Gender
                          <select
                            value={
                              routeList[activeRouteIndex].passengers[
                                activePassengerIndex
                              ].gender || ""
                            }
                            onChange={(e) =>
                              updatePassenger(
                                routeList[activeRouteIndex]._id ||
                                  routeList[activeRouteIndex].id,
                                activePassengerIndex,
                                "gender",
                                e.target.value
                              )
                            }
                          >
                            <option value="" disabled>
                              Select gender
                            </option>
                            {genderTypes.map((gender) => (
                              <option key={gender} value={gender}>
                                {gender}
                              </option>
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
                            placeholder="Enter Passenger Weight"
                            value={
                              routeList[activeRouteIndex].passengers[
                                activePassengerIndex
                              ].weight
                            }
                            onChange={(e) =>
                              updatePassenger(
                                routeList[activeRouteIndex]._id ||
                                  routeList[activeRouteIndex].id,
                                activePassengerIndex,
                                "weight",
                                e.target.value
                              )
                            }
                          />
                        </label>
                        <label>
                          Luggage Weight (Kg)
                          <input
                            type="number"
                            placeholder="Enter Luggage Weight"
                            value={
                              routeList[activeRouteIndex].passengers[
                                activePassengerIndex
                              ].bagWeight || ""
                            }
                            onChange={(e) =>
                              updatePassenger(
                                routeList[activeRouteIndex]._id || routeList[activeRouteIndex].id,
                                activePassengerIndex,
                                "bagWeight",
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
                            placeholder="Enter Passenger Passport/CID"
                            value={
                              routeList[activeRouteIndex].passengers[
                                activePassengerIndex
                              ].cid
                            }
                            onChange={(e) =>
                              updatePassenger(
                                routeList[activeRouteIndex]._id || routeList[activeRouteIndex].id,
                                activePassengerIndex,
                                "cid",
                                e.target.value
                              )
                            }
                          />
                        </label>
                        <label>
                          Phone Number
                          <input
                            type="number"
                            placeholder="Enter Passenger Phone Number"
                            value={
                              routeList[activeRouteIndex].passengers[
                                activePassengerIndex
                              ].contact || ""
                            }
                            onChange={(e) =>
                              updatePassenger(
                                routeList[activeRouteIndex]._id || routeList[activeRouteIndex].id,
                                activePassengerIndex,
                                "contact",
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
                            value={
                              routeList[activeRouteIndex].passengers[
                                activePassengerIndex
                              ].medIssue || ""
                            }
                            onChange={(e) =>
                              updatePassenger(
                                routeList[activeRouteIndex]._id || routeList[activeRouteIndex].id,
                                activePassengerIndex,
                                "medIssue",
                                e.target.value
                              )
                            }
                          >
                            <option value="" disabled>
                              Select Medical Issue
                            </option>
                            {medicalIssues.map((medIssue) => (
                              <option key={medIssue} value={medIssue}>
                                {medIssue}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {/* Medical Remarks (conditional) */}
                      {routeList[activeRouteIndex].passengers[
                        activePassengerIndex
                      ].medIssue === "Yes" && (
                        <div className="booking-form-group">
                          <label>
                            Please provide details about the medical condition
                            <textarea
                              placeholder="Enter any medical remarks here"
                              value={
                                routeList[activeRouteIndex].passengers[
                                  activePassengerIndex
                                ].remarks || ""
                              }
                              onChange={(e) =>
                                updatePassenger(
                                  routeList[activeRouteIndex]._id || routeList[activeRouteIndex].id,
                                  activePassengerIndex,
                                  "remarks",
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
                      className="passenger-btn"
                      onClick={() =>
                        removePassengerFromRoute(
                          routeList[activeRouteIndex]._id || routeList[activeRouteIndex].id,
                          activePassengerIndex
                        )
                      }
                      style={{ marginBottom: "20px" }}
                    >
                      Remove Passenger
                      <div className="passenger-icon-container">
                        <IoMdRemove className="passenger-icon" />
                      </div>
                    </button>
                  )}

                  {routeList[activeRouteIndex].passengers.length <
                    maxPassengersPerRoute && (
                    <button
                      type="button"
                      className="passenger-btn"
                      onClick={() =>
                        addPassengerToRoute(routeList[activeRouteIndex].id)
                      }
                    >
                      Add More
                      <div className="passenger-icon-container">
                        <IoMdAdd className="passenger-icon" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </>

            <div className="whiteSpace"></div>

            <p className="booking-break-header">Extra Details</p>
            <div className="booking-form-group">
              <label>
                Assigned Pilot
                <select
                  name="assigned_pilot"
                  value={formData.assigned_pilot || ""}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Pilot
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
                  value={formData.bookingStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Booking Status
                  </option>
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
                    {formData.refund_id
                      ? formData.refund_id.plan
                      : "Select Refund Plan"}
                  </option>
                  {refunds.map((refund) => (
                    <option key={refund._id} value={refund._id}>
                      {refund.plan}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Currency Type
                <select
                  name="cType"
                  value={formData.cType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Currency Type
                  </option>
                  {cTypes.map((permission) => (
                    <option key={permission} value={permission}>
                      {permission}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {durationf === 0 ? (
              <>
                <div className="booking-form-group">
                  <label>
                    Duration(in mins)
                    <input
                      type="number"
                      name="duration"
                      placeholder="000"
                      value={formData.duration}
                      onChange={(e) => {
                        handleChange(e);
                        setDurationAdmin(e.target.value / 60);
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
                      <option value="Credit">Credit</option>
                    </select>
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Price (in BTN)
                    <input
                      type="Number"
                      name="bookingPriceBTN"
                      value={
                        refundChosenPlan === 0
                          ? Number(finalpriceInBTNOthers).toFixed(2)
                          : Number(
                              finalpriceInBTNOthers -
                                finalpriceInBTNOthers * refundChosenPlan
                            ).toFixed(2)
                      }
                      readOnly
                    />
                  </label>
                  <label>
                    Price(in USD)
                    <input
                      type="Number"
                      name="bookingPriceUSD"
                      value={
                        refundChosenPlan === 0
                          ? Number(finalpriceInUSDOthers).toFixed(2)
                          : Number(
                              finalpriceInUSDOthers -
                                finalpriceInUSDOthers * refundChosenPlan
                            ).toFixed(2)
                      }
                      readOnly
                    />
                  </label>
                </div>
              </>
            ) : (
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
                      <option value="Credit">Credit</option>
                    </select>
                  </label>
                </div>

                <div className="booking-form-group">
                  <label>
                    Price (in BTN)
                    <input
                      type="Number"
                      name="bookingPriceBTN"
                      value={
                        refundChosenPlan === 0
                          ? Number(finalpriceInBTN).toFixed(2)
                          : Number(
                              finalpriceInBTN -
                                finalpriceInBTN * refundChosenPlan
                            ).toFixed(2)
                      }
                      readOnly
                    />
                  </label>
                  <label>
                    Price(in USD)
                    <input
                      type="Number"
                      name="bookingPriceUSD"
                      value={
                        refundChosenPlan === 0
                          ? Number(finalpriceInUSD).toFixed(2)
                          : Number(
                              finalpriceInUSD -
                                finalpriceInUSD * refundChosenPlan
                            ).toFixed(2)
                      }
                      readOnly
                    />
                  </label>
                </div>
              </>
            )}

            <div className="booking-form-group">
              <label>
                Payment Type
                <select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Payment Type
                  </option>
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
                  <option value="" disabled>
                    Select Booking Type
                  </option>
                  {bookingTypes.map((bookingType, index) => (
                    <option key={index} value={bookingType}>
                      {bookingType}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {(formData.payment_type === "Bank Transfer" ||
              formData.payment_type === "MBoB") && (
              <div className="booking-form-group">
                <label>
                  Journal Number
                  <input
                    type="text"
                    name="journal_no"
                    placeholder="Eg. 134567"
                    value={formData.journal_no}
                    onChange={handleChange}
                    required={formData.payment_type == "MBoB"}
                  />
                </label>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={(ref) => (window.__screenshotInput = ref)}
                  onChange={handleMultipleFilesChange}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {(formData.payment_type === "Bank Transfer" ||
              formData.payment_type === "MBoB") &&
              paymentScreenshots.length > 0 && (
                <div className="screenshot-wrapper">
                  {paymentScreenshots.map((img, index) => (
                    <div key={img.id} className="screenshot-preview-box">
                      <img
                        src={img.preview}
                        alt={`Screenshot ${index + 1}`}
                        className="screenshot-img"
                      />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveImage(img.id)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              )}

            {(formData.payment_type === "Bank Transfer" ||
              formData.payment_type === "MBoB") && (
              <button
                type="button"
                onClick={() =>
                  window.__screenshotInput && window.__screenshotInput.click()
                }
                className="passenger-btn"
                style={{ margin: "1rem 0" }}
                required
              >
                Add Screenshot +
              </button>
            )}

            <button type="submit" className="booking-add-btn">
              Add Booking
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminAddBookingModal;
