import React, { useState, useEffect } from 'react'
import './../Css/admin.css'
import AdminHeader from '../../Components/adminheader';
import {
  BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill,
  BsFillPieChartFill, BsFillFileTextFill, BsFillCalendarFill, BsFillFlagFill
} from 'react-icons/bs';
import ServiceRevenueComponent from '../../Components/ServiceRevenue';
import ServiceHoursComponent from '../../Components/FlightHourGraph';
import Swal from 'sweetalert2';
import axios from 'axios';

function GmDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [gmCount, setGmCount] = useState(0);
  const [pilotCount, setPilotCount] = useState(0);
  const [cStaffCount, setCStaffCount] = useState(0);
  const [bookingCount, setBookingsCount] = useState(0)
  const [routesCount, setRoutesCount] = useState(0)
  const [revenueUSD, setRevenueUSD] = useState(0)
  const [revenueBTN, setRevenueBTN] = useState(0)
  const [isClicked, setIsClicked] = useState(false);

  const handleCardClick = () => {
    setIsClicked(!isClicked);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/users");
        const users = response.data.data;

        const userRoleCount = users.filter(user => user.role.name === "USER").length;
        const adminRoleCount = users.filter(user => user.role.name === "ADMIN").length;
        const gmCount = users.filter(user => user.role.name === "GENERAL MANAGER").length;
        const pilotCount = users.filter(user => user.role.name === "PILOT").length;
        const cStaffCount = users.filter(user => user.role.name === "CHECKIN STAFF").length;

        setUserCount(userRoleCount);
        setAdminCount(adminRoleCount);
        setGmCount(gmCount)
        setPilotCount(pilotCount)
        setCStaffCount(cStaffCount)
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
  }, []);

  function formatRevenue(value) {
    if (value >= 1e33) {
      return (value / 1e33).toFixed(1) + 'D';
    } else if (value >= 1e30) {
      return (value / 1e30).toFixed(1) + 'N';
    } else if (value >= 1e27) {
      return (value / 1e27).toFixed(1) + 'O';
    } else if (value >= 1e24) {
      return (value / 1e24).toFixed(1) + 'Sp';
    } else if (value >= 1e21) {
      return (value / 1e21).toFixed(1) + 'S';
    } else if (value >= 1e18) {
      return (value / 1e18).toFixed(1) + 'Qi';
    } else if (value >= 1e15) {
      return (value / 1e15).toFixed(1) + 'Q';
    } else if (value >= 1e12) {
      return (value / 1e12).toFixed(1) + 'T';
    } else if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toString();
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/bookings/");
        const paidBookings = response.data.data.filter(
          booking => booking.payment_status === "Paid"
        );
        const bookings = paidBookings.length;
        const mainBookings = paidBookings


        let revenueUSD = 0;
        let revenueBTN = 0;

        for (const booking of mainBookings) {
          const servicePrice = parseInt(booking.price, 10);

          if (isNaN(servicePrice)) {
            Swal.fire({
              title: "Invalid Data!",
              text: `Invalid price for booking: ${JSON.stringify(booking)}`,
              icon: "error",
              confirmButtonColor: "#1E306D",
              confirmButtonText: "OK",
            });
            continue;
          }

          if (booking.cType === "USD") {
            if (booking.refund_id?.plan) {
              const refundAmount = booking.refund_id.plan / 100;
              const refundAmounts = servicePrice * refundAmount
              revenueUSD += servicePrice - refundAmounts;
            } else {
              revenueUSD += servicePrice;
            }
          } else {
            if (booking.refund_id?.plan) {
              const refundAmount = booking.refund_id.plan / 100;
              const refundAmounts = servicePrice * refundAmount
              revenueBTN += servicePrice - refundAmounts;
            } else {
              revenueBTN += servicePrice;
            }
          }
        }


        setBookingsCount(bookings);

        let formattedRevenue = formatRevenue(revenueUSD);
        setRevenueUSD(formattedRevenue);

        let formattedRevenueBTN = formatRevenue(revenueBTN);
        setRevenueBTN(formattedRevenueBTN);

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
  }, [bookingCount]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/routes/");
        const routes = response.data.data.length;
        setRoutesCount(routes)
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
  }, [routesCount]);



  return (
    <main className='admin-container'>
      <div className='admin-title'>
        <AdminHeader title="Dashboard" />
      </div>

      <div className='admin-cards'>

        <div className='admin-card'>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{userCount}</p>
              <p>Users</p>
            </div>
            <BsFillArchiveFill className='inner-card_icon' />
          </div>
        </div>

        <div className='admin-card'>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{cStaffCount}</p>
              <p>Checkin Staffs</p>
            </div>
            <BsFillGrid3X3GapFill className='inner-card_icon' />
          </div>
        </div>

        <div className='admin-card'>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{adminCount}</p>
              <p>Admins</p>
            </div>
            <BsPeopleFill className='inner-card_icon' />
          </div>
        </div>

        <div className='admin-card'>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{gmCount}</p>
              <p>General Managers</p>
            </div>
            <BsFillBellFill className='inner-card_icon' />
          </div>
        </div>

        <div className='admin-card'>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{pilotCount}</p>
              <p>Pilots</p>
            </div>
            <BsFillPieChartFill className='inner-card_icon' />
          </div>
        </div>

        <div className='admin-card'>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{bookingCount}</p>
              <p>Booking</p>
            </div>
            <BsFillFileTextFill className='inner-card_icon' />
          </div>
        </div>

        <div className='admin-card'>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{routesCount}</p>
              <p>Routes</p>
            </div>
            <BsFillCalendarFill className='inner-card_icon' />
          </div>
        </div>

        <div className='admin-card admin-card-rev' onClick={handleCardClick}>
          <div className='card-inner'>
            <div className="innercard-number">
              <p>{isClicked ? revenueUSD : revenueBTN}</p>
              <p>{isClicked ? "Revenue(USD)" : "Revenue(Nu)"}</p>
            </div>
            <BsFillFlagFill className='inner-card_icon' />
          </div>
        </div>
      </div>
      {/* <FinancialTable/> */}
      <ServiceRevenueComponent />
      <ServiceHoursComponent />

    </main>
  )
}

export default GmDashboard;