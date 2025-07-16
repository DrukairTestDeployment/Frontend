import React, { useState, useEffect } from "react";
import "./Css/Bookingform.css";
import Progress from "../Components/Progress";
import Header from "../Components/Header";
import { Link } from "react-router-dom";
import {
  MdOutlineNavigateNext,
  MdOutlineSupportAgent,
  MdOutlinePayment,
} from "react-icons/md";
import { GiRocketFlight } from "react-icons/gi";
import { TiGroupOutline } from "react-icons/ti";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import Swal from "sweetalert2";
import { LuBookMarked } from "react-icons/lu";
import Footer from "../Components/Footer";
import { MdOutlineFeedback } from "react-icons/md";
import {
  IoIosArrowDroprightCircle,
  IoIosRemoveCircleOutline,
} from "react-icons/io";
import axios from "axios";
import HelicopterLoader from "../Components/HelicopterLoader";
import RMA from "../Assets/RMA_logo.png";
import CreditDebit from "../Assets/creditDebit.png";
import LocalPayment from "../Assets/LocalPayment.png";
import InternationalPayement from "../Assets/internationalPayment.jpg";
import Cookies from "js-cookie";

const message = [
  "Client/Agent Personal Information",
  "Flight Logistics",
  "Passenger Information & Safety",
];
const genderTypes = ["Male", "Female", "Others"];

let carryingCapacity = 0;
let priceInBTN = "";
let priceInUSD = "";
let duration = 1;
let flightMonth = 0;
let winterWeight = 450;
let summerWeight = 450;
let layap = false;
let destinationType = "";
let sid = "";

export function Personal({ formData, setFormData, agentErrors }) {
  const id = Cookies.get("token");
  const [user, setUser] = useState();

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `https://helistaging.drukair.com.bt/api/users/${id}`
          );
          if (response.data.data.role.name === "USER") {
            setUser(response.data.data);
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Error fetching data",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      };

      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        agentName: user.name || "",
        agentPhone: user.contactNo || "",
        agentEmail: user.email || "",
      }));
    }
  }, [user, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));

    layap = checked;
  };

  return (
    <div className="booking-form-container">
      <h2>{message[0]}</h2>
      <form>
        <div className="booking-form-group">
          <label>
            Name Of The Client/Agent
            <input
              type="text"
              name="agentName"
              placeholder="Enter Agent Name"
              value={user ? user.name : formData.agentName}
              onChange={handleChange}
            />
            {agentErrors.agentName && (
              <span className="error">{agentErrors.agentName}</span>
            )}
          </label>
          <label>
            Phone Number
            <input
              type="number"
              name="agentPhone"
              placeholder="#########"
              value={user ? user.contactNo : formData.agentPhone}
              onChange={handleChange}
            />
            {agentErrors.agentPhone && (
              <span className="error">{agentErrors.agentPhone}</span>
            )}
          </label>
        </div>

        <div className="booking-form-group">
          <label>
            CID/Passport
            <input
              type="text"
              name="agentCid"
              placeholder="Citizenship Identity Number"
              value={formData.agentCid}
              onChange={handleChange}
            />
            {agentErrors.agentCid && (
              <span className="error">{agentErrors.agentCid}</span>
            )}
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="agentEmail"
              placeholder="email@gmail.com"
              value={user ? user.email : formData.agentEmail}
              onChange={handleChange}
            />
            {agentErrors.agentEmail && (
              <span className="error">{agentErrors.agentEmail}</span>
            )}
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
      </form>
    </div>
  );
}

export function FlightDetails({
  secondFormData,
  setSecondFormData,
  flightErrors,
  today,
}) {
  const [routes, setRoutes] = useState([]);
  const [services, setServices] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSecondFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "flightDate") {
      const date = new Date(value);
      const month = date.getMonth() + 1;
      flightMonth = month;
    }

    if (name === "selectedDestination") {
      destinationType = value;
    }
  };

  const getPrice = async (id) => {
    try {
      const response = await axios.get(
        `https://helistaging.drukair.com.bt/api/services/${id}`
      );
      const priceUSD = response.data.data.priceInUSD;
      const priceBTN = response.data.data.priceInBTN;
      priceInUSD = Number(priceUSD * duration).toFixed(2);
      priceInBTN = Number(priceBTN * duration).toFixed(2);
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

  const getDuration = async (id) => {
    if (id === "Others") {
    } else {
      try {
        const response = await axios.get(
          `https://helistaging.drukair.com.bt/api/routes/${id}`
        );
        duration = parseInt(response.data.data.duration) / 60;
        winterWeight = parseFloat(response.data.data.winterWeight);
        summerWeight = parseFloat(response.data.data.summerWeight);
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

  return (
    <div className="booking-form-container">
      <h2>{message[1]}</h2>
      <form action="">
        <div className="booking-form-group">
          <label>
            Destination
            <select
              id="destination"
              name="selectedDestination"
              value={secondFormData.selectedDestination}
              onChange={(e) => {
                handleChange(e);
                getDuration(e.target.value);
              }}
            >
              <option value="" disabled>
                Select an Option
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
            {flightErrors.destination && (
              <span className="error">{flightErrors.destination}</span>
            )}
          </label>

          {secondFormData.selectedDestination === "Others" && (
            <label>
              Destination (Other)
              <input
                type="text"
                name="otherDestination"
                placeholder="Enter Preferred destination"
                value={secondFormData.otherDestination}
                onChange={handleChange}
              />
              {flightErrors.otherDestination && (
                <span className="error">{flightErrors.otherDestination}</span>
              )}
            </label>
          )}
        </div>

        {secondFormData.selectedDestination === "Others" && (
          <div className="booking-form-group">
            <label>
              Coodinates Latitude(North/South Value) - Optional
              <input
                type="text"
                name="latitude"
                placeholder="eg. 40.7128 N"
                value={secondFormData.latitude}
                onChange={handleChange}
              />
              {secondFormData.selectedDestination && (
                <span className="error">{flightErrors.latitude}</span>
              )}
            </label>
            <label>
              Coodinates Longitude(East/West Value) - Optional
              <input
                type="text"
                name="longitude"
                placeholder="eg. 74.0060 W"
                value={secondFormData.longitude}
                onChange={handleChange}
              />
              {secondFormData.selectedDestination && (
                <span className="error">{flightErrors.longitude}</span>
              )}
            </label>
          </div>
        )}

        <div className="booking-form-group">
          <label>
            Pick Up Point
            <input
              type="text"
              name="pickUpPoint"
              placeholder="Enter Pick Up Point"
              value={secondFormData.pickUpPoint}
              onChange={handleChange}
            />
            {flightErrors.pickUpPoint && (
              <span className="error">{flightErrors.pickUpPoint}</span>
            )}
          </label>

          <label>
            Ground Time (In Mins)
            <input
              type="number"
              name="groundTime"
              value={secondFormData.groundTime}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="booking-form-group">
          <label>
            Date Of Flight
            <input
              type="date"
              name="flightDate"
              value={secondFormData.flightDate}
              onChange={handleChange}
              min={today}
            />
            {flightErrors.flightDate && (
              <span className="error">{flightErrors.flightDate}</span>
            )}
          </label>
          <label>
            Time Of Departure
            <input
              type="time"
              name="departureTime"
              value={secondFormData.departureTime}
              onChange={handleChange}
            />
            {/* {flightErrors.departureTime && <span className="error">{flightErrors.departureTime}</span>} */}
          </label>
        </div>

        <div className="booking-form-group">
          <label>
            Service Type
            <select
              id="serviceType"
              name="selectedServiceType"
              value={secondFormData.selectedServiceType}
              onChange={(e) => {
                handleChange(e);
                getPrice(e.target.value);
              }}
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
            {flightErrors.serviceType && (
              <span className="error">{flightErrors.serviceType}</span>
            )}
          </label>
          <label>
            Permission to land if the helipad is privately owned?
            <div className="helipadPermission">
              <label className="radio-label">
                <input
                  type="radio"
                  name="selectedHelipadPermission"
                  value="Yes"
                  checked={secondFormData.selectedHelipadPermission === "Yes"}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="selectedHelipadPermission"
                  value="No"
                  checked={secondFormData.selectedHelipadPermission === "No"}
                  onChange={handleChange}
                />
                No
              </label>
            </div>
            {flightErrors.helipadPermission && (
              <span className="error">{flightErrors.helipadPermission}</span>
            )}
          </label>
        </div>
      </form>
    </div>
  );
}

export function PassengerDetails({
  thirdFormData,
  setThirdFormData,
  passengerErrors,
  passengers,
  setPassengers,
  setPassengerErrors,
  routeList,
  setRouteList,
  getRouteWeight,
}) {
  const [totalWeight, setTotalWeight] = useState(0);
  const summerMonths = [3, 4, 5, 6, 7, 8];
  const calculateTotalWeight = () => {
    const weight = routeList.reduce((sum, route) => {
      return (
        sum +
        route.passengers.reduce(
          (innerSum, p) =>
            innerSum + (Number(p.weight) || 0) + (Number(p.bagWeight) || 0),
          0
        )
      );
    }, 0);
    setTotalWeight(weight);
  };

  useEffect(() => {
    calculateTotalWeight();
  }, [routeList]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    setThirdFormData((prevData) => {
      const updatedPassengers = [...prevData.passengers];
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        [name]: value,
      };
      return {
        ...prevData,
        passengers: updatedPassengers,
      };
    });
  };

  const addPassenger = () => {
    setPassengers([...passengers, { id: Date.now() }]);
    setThirdFormData((prevData) => ({
      ...prevData,
      passengers: [...prevData.passengers, {}],
    }));
  };

  const removePassenger = (id, index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((passenger) => passenger.id !== id));
      setThirdFormData((prevData) => ({
        ...prevData,
        passengers: prevData.passengers.filter((_, i) => i !== index),
      }));
    }
  };

  const [newRouteName, setNewRouteName] = useState("");
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const maxPassengersPerRoute = 6;

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
          boarding: "",
          disembark: "",
          gender: "",
        },
      ],
    };
    setRouteList([...routeList, newRoute]);
    setNewRouteName("");
    setActiveRouteIndex(routeList.length);
    setActivePassengerIndex(0);
  };

  const removeRoute = (id, index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this route?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = routeList.filter((route) => route.id !== id);
        setRouteList(updated);
        if (activeRouteIndex >= updated.length) {
          setActiveRouteIndex(Math.max(0, updated.length - 1));
        }
      }
    });
  };

  const updateRouteName = (id, newName) => {
    setRouteList(
      routeList.map((route) =>
        route.id === id ? { ...route, name: newName } : route
      )
    );
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
              boarding: "",
              disembark: "",
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
    setRouteList(
      routeList.map((route) => {
        if (route.id === routeId) {
          const updatedPassengers = [...route.passengers];
          updatedPassengers[index][field] = value;
          return { ...route, passengers: updatedPassengers };
        }
        return route;
      })
    );
  };

  const removePassengerFromRoute = (routeId, index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this passenger?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setRouteList(
          routeList.map((route) => {
            if (route.id === routeId) {
              const updated = [...route.passengers];
              updated.splice(index, 1);
              return { ...route, passengers: updated };
            }
            return route;
          })
        );
        if (index === activePassengerIndex) {
          setActivePassengerIndex(Math.max(0, index - 1));
        }
      }
    });
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
  const medicalIssues = ["Yes", "No"];
  const isSummer = summerMonths.includes(flightMonth);
  carryingCapacity = isSummer ? summerWeight : winterWeight;
  return (
    <div className="booking-form-container">
      <div className="booking-form-topic-price">
        <h2>{message[2]}</h2>

        {destinationType !== "Others" ? (
          <h2 className="price">
            {layap
              ? `$${(Number(priceInUSD || 0) / 2).toFixed(2)} / Nu.${(
                  Number(priceInBTN || 0) / 2
                ).toFixed(2)}`
              : `$.${Number(priceInUSD || 0).toFixed(2)} / Nu.${Number(
                  priceInBTN || 0
                ).toFixed(2)}`}
          </h2>
        ) : null}
      </div>
      <form action="">
        <p className="passenger-weight">
          *The carrying capacity per route should not exceed {carryingCapacity}
          kg. Current weight for{" "}
          <strong>
            {routeList[activeRouteIndex]?.name ||
              `Route ${activeRouteIndex + 1}`}
          </strong>
          :{` ${getRouteWeight(routeList[activeRouteIndex])}`}kg.
        </p>

        <div className="whiteSpace"></div>
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
                  handleRouteDoubleClick(route.id, route.name)
                }
              >
                <span className="route-name-ellipsis">{route.name}</span>
                <button
                  type="button"
                  className="passenger-btn route-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRoute(route.id, index);
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

              {routeList[activeRouteIndex].passengers[activePassengerIndex] && (
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
                            routeList[activeRouteIndex].id,
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
                            routeList[activeRouteIndex].id,
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
                            routeList[activeRouteIndex].id,
                            activePassengerIndex,
                            "contact",
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>

                  {/* Boarding & Disembarking Location */}
                  <div className="booking-form-group">
                    <label>
                      Boarding Location
                      <input
                        type="text"
                        placeholder="Enter your boarding location"
                        value={
                          routeList[activeRouteIndex].passengers[
                            activePassengerIndex
                          ].boarding || ""
                        }
                        onChange={(e) =>
                          updatePassenger(
                            routeList[activeRouteIndex].id,
                            activePassengerIndex,
                            "boarding",
                            e.target.value
                          )
                        }
                      />
                    </label>
                    <label>
                      Disembarking Location
                      <input
                        type="text"
                        placeholder="Enter your drop off location"
                        value={
                          routeList[activeRouteIndex].passengers[
                            activePassengerIndex
                          ].disembark || ""
                        }
                        onChange={(e) =>
                          updatePassenger(
                            routeList[activeRouteIndex].id,
                            activePassengerIndex,
                            "disembark",
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
                        value={
                          routeList[activeRouteIndex].passengers[
                            activePassengerIndex
                          ].medIssue || ""
                        }
                        onChange={(e) =>
                          updatePassenger(
                            routeList[activeRouteIndex].id,
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
                  {routeList[activeRouteIndex].passengers[activePassengerIndex]
                    .medIssue === "Yes" && (
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
                              routeList[activeRouteIndex].id,
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

              {routeList[activeRouteIndex].passengers.length > 1 && (
                <button
                  type="button"
                  className="passenger-btn"
                  onClick={() =>
                    removePassengerFromRoute(
                      routeList[activeRouteIndex].id,
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
      </form>
    </div>
  );
}

export function PaymentDetails() {
  const [txnTime, setTxnTime] = useState("");
  const [orderNo, setOrderNum] = useState("");
  const [commision, setCommision] = useState(0);

  useEffect(() => {
    const fetchCommision = async () => {
      try {
        const response = await axios.get(
          `https://helistaging.drukair.com.bt/api/commision/`
        );
        const commision = response.data.data[0].commisionValue;
        setCommision(parseFloat(commision) / 100);
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

  const pad = (number) => {
    return number < 10 ? "0" + number : number;
  };

  const generateTxnTime = () => {
    const now = new Date();
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  };

  function generateOrderNo(minLength = 14) {
    let orderNo = "";
    while (orderNo.length < minLength) {
      orderNo += Math.floor(Math.random() * 10);
    }
    const extraDigits = Math.floor(Math.random() * 5);
    for (let i = 0; i < extraDigits; i++) {
      orderNo += Math.floor(Math.random() * 10);
    }
    return orderNo;
  }

  const finalPost = () => {
    document.getElementById("bfsPaymentForm").submit();
  };

  const handlePayment = async () => {
    const bfs_benfTxnTime = generateTxnTime();
    const bfs_orderNo = generateOrderNo();
    setTxnTime(bfs_benfTxnTime);
    setOrderNum(bfs_orderNo);
    const formData = {
      bfs_benfBankCode: "01",
      bfs_benfId: "BE10000132",
      bfs_orderNo,
      bfs_msgType: "AR",
      bfs_paymentDesc: "Sampleproductdescription",
      bfs_remitterEmail: "pwangchuk@rbhsl.bt",
      bfs_txnAmount: priceInBTN.toString(),
      bfs_txnCurrency: "BTN",
      bfs_version: "5.0",
      bfs_benfTxnTime,
    };
    try {
      const response = await axios.post(
        "https://helistaging.drukair.com.bt/api/bookings/signchecksum",
        formData
      );
      document.getElementById("bfs_checkSum").value = response.data.f_signature;
      finalPost();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Error making payment",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <div className="payment-container">
        <form
          id="bfsPaymentForm"
          method="post"
          action="https://uatbfssecure.rma.org.bt/BFSSecure/makePayment"
        >
          <input type="hidden" name="bfs_msgType" value="AR" />
          <input type="hidden" name="bfs_benfTxnTime" value={txnTime} />
          <input type="hidden" name="bfs_orderNo" value={orderNo} />
          <input type="hidden" name="bfs_benfId" value="BE10000132" />
          <input type="hidden" name="bfs_benfBankCode" value="01" />
          <input type="hidden" name="bfs_txnCurrency" value="BTN" />
          <input type="hidden" name="bfs_txnAmount" value={priceInBTN} />
          <input
            type="hidden"
            name="bfs_remitterEmail"
            value="pwangchuk@rbhsl.bt"
          />
          <input type="hidden" name="bfs_checkSum" id="bfs_checkSum" />
          <input
            type="hidden"
            name="bfs_paymentDesc"
            value="Sampleproductdescription"
          />
          <input type="hidden" name="bfs_version" value="5.0" />
        </form>

        <div className="payment-text-container">
          <p>Please select your preferred method of payment</p>
          <p>
            {priceInBTN} BTN / {priceInUSD + priceInUSD * commision} USD
          </p>
        </div>
        <div className="payment-card-container">
          <Link
            className="payment-card"
            onClick={(e) => {
              e.preventDefault();
              handlePayment();
            }}
          >
            <div className="payment-card-content">
              <img src={RMA} alt="" className="card-first-img-payment" />
              <p className="payment-topic">
                Payment with Royal Monetary Authority
              </p>
              <p className="payment-des">
                Simply proceed to your ticket payment, all you need is a bank
                account number in Bhutan
              </p>
              <img
                src={LocalPayment}
                alt=""
                className="card-first-second-payment"
              />
            </div>
          </Link>

          <Link
            to={`/paymentInternational?price=${
              priceInUSD + priceInUSD * commision
            }&id=${sid}`}
            className="payment-card"
          >
            <div className="payment-card-content">
              <img
                src={CreditDebit}
                alt="Credit/Debit Icon"
                className="card-first-img-payment"
              />
              <p className="payment-topic">Credit/Debit Card</p>
              <p className="payment-des">
                Your booking will be validated and confirmed automatically. You
                will receive your electronic ticket(s) by email.
              </p>
              <img
                src={InternationalPayement}
                alt="International Payment Icon"
                className="card-first-second-payment"
              />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

function BookingForm() {
  const [step, setSteps] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);

  // Route
  const [routeList, setRouteList] = useState([
    {
      id: Date.now(),
      name: "Route 1",
      passengers: [
        {
          name: "",
          weight: "",
          bagWeight: "",
          cid: "",
          contact: "",
          medIssue: "",
          remarks: "",
          boarding: "",
          disembark: "",
          gender: "",
        },
      ],
    },
  ]);

  const [formData, setFormData] = useState({
    agentName: "",
    agentPhone: "",
    agentCid: "",
    agentEmail: "",
    layap: false,
  });

  const [secondFormData, setSecondFormData] = useState({
    selectedDestination: "",
    otherDestination: null,
    pickUpPoint: "",
    groundTime: "",
    flightDate: "",
    departureTime: "",
    latitude: "",
    longitude: "",
    selectedServiceType: "",
    selectedHelipadPermission: "",
  });

  const [thirdFormData, setThirdFormData] = useState({
    passengers: [{}],
  });

  const [passengers, setPassengers] = useState([{ id: Date.now() }]);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getTodayDate();

  const getRouteWeight = (route) => {
    return route.passengers.reduce(
      (sum, p) => sum + Number(p.weight || 0) + Number(p.bagWeight || 0),
      0
    );
  };

  const validateLegWeights = () => {
    for (let i = 0; i < routeList.length; i++) {
      const route = routeList[i];
      let routeWeight = 0;

      for (const p of route.passengers) {
        routeWeight += Number(p.weight || 0) + Number(p.bagWeight || 0);
      }

      if (routeWeight > carryingCapacity) {
        const routeName = route.name || `Route ${i + 1}`;
        Swal.fire({
          icon: "error",
          title: "Weight Limit Exceeded",
          text: `Route "${routeName}" exceeds the carrying capacity of ${carryingCapacity}Kg with a total weight of ${routeWeight}Kg.`,
        });
        return false;
      }
    }

    return true;
  };

  // Error states
  const [agentErrors, setAgentErrors] = useState({});
  const [flightErrors, setFlightErrors] = useState({});
  const [passengerErrors, setPassengerErrors] = useState([{}]);

  function ValidateAgent() {
    const errors = {};

    if (!formData.agentName.trim()) errors.agentName = "Agent name is required";
    if (!formData.agentPhone.trim())
      errors.agentPhone = "Phone number is required";
    if (!formData.agentCid.trim()) errors.agentCid = "CID is required";
    if (!formData.agentEmail.trim()) errors.agentEmail = "Email is required";

    if (!/\S+@\S+\.\S+/.test(formData.agentEmail)) {
      errors.agentEmail = "Invalid email format";
    }

    setAgentErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const validateFlight = () => {
    const flightErrors = {};

    if (
      !secondFormData.selectedDestination ||
      !secondFormData.selectedDestination.trim()
    ) {
      flightErrors.destination = "Destination is required.";
    }

    if (secondFormData.selectedDestination === "Others") {
      if (
        !secondFormData.otherDestination ||
        !secondFormData.otherDestination.trim()
      ) {
        flightErrors.otherDestination = "Other destination is required.";
      }
      // if (!secondFormData.latitude || !secondFormData.latitude.trim()) {
      //     flightErrors.latitude = "Latitude is required.";
      // }
      // if (!secondFormData.longitude || !secondFormData.longitude.trim()) {
      //     flightErrors.longitude = "Longitude is required.";
      // }
    }

    if (!secondFormData.pickUpPoint || !secondFormData.pickUpPoint.trim()) {
      flightErrors.pickUpPoint = "Pick Up Point is required";
    }
    if (!secondFormData.flightDate || !secondFormData.flightDate.trim()) {
      flightErrors.flightDate = "Flight date is required.";
    }
    // if (!secondFormData.departureTime || !secondFormData.departureTime.trim()) {
    //     flightErrors.departureTime = "Departure time is required.";
    // }
    if (
      !secondFormData.selectedHelipadPermission ||
      !secondFormData.selectedHelipadPermission.trim()
    ) {
      flightErrors.helipadPermission = "Helipad permission is required.";
    }

    setFlightErrors(flightErrors);
    return Object.keys(flightErrors).length === 0;
  };

  //   const validatePassengers = () => {
  //     let totalWeight = 0;

  //     for (const route of routeList) {
  //       for (const p of route.passengers) {
  //         totalWeight += Number(p.weight || 0) + Number(p.bagWeight || 0);
  //       }
  //     }

  //     if (totalWeight > carryingCapacity) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Weight Limit Exceeded",
  //         text: `Total weight ${totalWeight}Kg exceeds the carrying capacity ${carryingCapacity}Kg.`,
  //       });
  //       return false;
  //     }

  //     return true;
  //   };

  function generateBookingId() {
    const prefix = "DHRS";
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const datePart = `${year}${minutes}${seconds}`.slice(0, 6);
    return prefix + datePart;
  }

  if (loading) {
    return <HelicopterLoader />;
  }

  const postPassenger = async (bookingId) => {
    for (const route of routeList) {
      for (const p of route.passengers) {
        try {
          await axios.post("https://helistaging.drukair.com.bt/api/passengers", {
            name: p.name,
            weight: p.weight,
            cid: p.cid,
            bagWeight: p.bagWeight,
            gender: p.gender,
            medIssue: p.medIssue,
            contact: p.contact,
            remarks: p.remarks,
            boarding: p.boarding,
            disembark: p.disembark,
            booking_id: bookingId,
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || "Error saving passenger",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      }
    }
  };

  function handlePrev() {
    if (step > 1) setSteps((step) => step - 1);
  }

  function handleNext() {
    if (step === 1) {
      if (ValidateAgent()) {
        setSteps((prevStep) => prevStep + 1);
      }
    } else if (step === 2) {
      if (validateFlight()) {
        setSteps((prevStep) => prevStep + 1);
      }
    } else if (step === 3) {
      if (validateLegWeights()) {
        Swal.fire({
          title: "Are you sure you want to make a reservation?",
          text: "Once your reservation request is submitted, it will be reviewed for confirmation. You will receive a notification once your reservation is confirmed. After confirmation, you can proceed to complete the payment process.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#1E306D",
          confirmButtonText: "Yes, Reserve!",
        }).then((result) => {
          if (result.isConfirmed) {
            saveBooking();
          }
        });
      }
    } else if (step === 4) {
      // book();
      return;
    }
  }

  const saveBooking = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`https://helistaging.drukair.com.bt/api/bookings`, {
        bookingID: generateBookingId(),
        layap: formData.layap,
        booking_type: "Online",
        agent_name: formData.agentName,
        agent_email: formData.agentEmail,
        agent_cid: formData.agentCid,
        agent_contact: formData.agentPhone,
        flight_date: secondFormData.flightDate,
        departure_time: secondFormData.departureTime,
        ground_time: secondFormData.groundTime,
        pickup_point: secondFormData.pickUpPoint,
        latitude: secondFormData.latitude,
        Longitude: secondFormData.longitude,
        price: 0,
        bookingPriceUSD:
          secondFormData.selectedDestination === "Others" ||
          secondFormData.selectedDestination === null
            ? 0
            : Number(priceInUSD).toFixed(2),
        bookingPriceBTN:
          secondFormData.selectedDestination === "Others" ||
          secondFormData.selectedDestination === null
            ? 0
            : Number(priceInBTN).toFixed(2),
        status: "Booked",
        payment_status: "Not paid",
        permission: secondFormData.selectedHelipadPermission,
        destination_other: secondFormData.otherDestination,
        destination: secondFormData.selectedDestination,
        service_id: secondFormData.selectedServiceType,
      });

      if (response.data.status === "success") {
        await postPassenger(response.data.data._id);
        Swal.fire({
          title: "Success!",
          text: "Reservation placed successfully!",
          icon: "success",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "custom-confirm-button",
            denyButton: "custom-deny-button",
          },
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response
          ? error.response.data.error
          : "Error Making Reservation",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSteps = () => {
    switch (step) {
      case 1:
        return (
          <Personal
            formData={formData}
            setFormData={setFormData}
            agentErrors={agentErrors}
          />
        );
      case 2:
        return (
          <FlightDetails
            secondFormData={secondFormData}
            setSecondFormData={setSecondFormData}
            flightErrors={flightErrors}
            today={today}
          />
        );
      case 3:
        return (
          <PassengerDetails
            thirdFormData={thirdFormData}
            setThirdFormData={setThirdFormData}
            passengerErrors={passengerErrors}
            passengers={passengers}
            setPassengers={setPassengers}
            // setPassengerErrors={setPassengerErrors}
            routeList={routeList}
            setRouteList={setRouteList}
            getRouteWeight={getRouteWeight}
          />
        );
      case 4:
        return <PaymentDetails />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="whiteSpace"></div>
      <div className="BookingHeaderWrapper">
        <p className="header-Topic">
          Make Your Booking
          <LuBookMarked className="header-topic-icon" />
        </p>

        <div className="headerBtnsContainer">
          <div className="headerBtnsContainer">
            <Link to="/feedback" className="feedbackBtn">
              <p>Feedback</p>
              <MdOutlineFeedback />
            </Link>

            <div className="headerBtnsContainer">
              <Link to="/manageBooking" className="bookNowBtn">
                <p>Manage Booking</p>
                <IoIosArrowDroprightCircle />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="booking-container">
        <div className="booking-progressContainer">
          <Progress
            totalSteps={totalSteps}
            step={step}
            className="booking-progress active"
          />

          <div className="step-container">
            <div className={`${step >= 1 ? "circle active" : "circle"}`}>
              <MdOutlineSupportAgent />
            </div>
          </div>

          <div className="step-container">
            <div className={`${step >= 2 ? "circle active" : "circle"}`}>
              <GiRocketFlight />
            </div>
          </div>

          <div className="step-container">
            <div className={`${step >= 3 ? "circle active" : "circle"}`}>
              <TiGroupOutline />
            </div>
          </div>

          <div className="step-container">
            <div className={`${step >= 4 ? "circle active" : "circle"}`}>
              <MdOutlinePayment />
            </div>
          </div>
        </div>

        {renderSteps()}

        <div className="booking-btns">
          <button
            className={`${step <= 1 ? "disabled" : "booking-btn"}`}
            onClick={handlePrev}
          >
            <div className="booking-icon-container">
              <MdOutlineNavigateNext className="booking-icon-prev booking-icon" />
            </div>
            <p className="btn-text">Previous</p>
          </button>

          {step !== totalSteps ? (
            <button className="booking-btn" onClick={handleNext}>
              <p className="btn-text">{"Next"}</p>
              <div className="booking-icon-container">
                <MdOutlineNavigateNext className="booking-icon" />
              </div>
            </button>
          ) : (
            <button
              className="booking-btn"
              onClick={() => {
                Swal.fire({
                  title: "Redirecting to Payment...",
                  text: "Please proceed to payment.",
                  icon: "info",
                  confirmButtonText: "OK",
                }).then(() => {
                  setSteps(4);
                });
              }}
            >
              <p className="btn-text">Proceed to Payment</p>
              <div className="booking-icon-container">
                <MdOutlineNavigateNext className="booking-icon" />
              </div>
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BookingForm;
