import React from 'react';
import "./userBookingHeader.css";
import { Link } from 'react-router-dom';
import { MdOutlineFeedback, MdFlightTakeoff } from "react-icons/md";
import { FaHelicopter } from 'react-icons/fa';
function UserBookingHeader({ headerTitle, headerIcon }) {
    return (
        <>
            <div className="whiteSpace"></div>
            <div className="BookingHeaderWrapper">
                <p className="header-Topic">
                    {headerTitle}
                    {headerIcon && React.cloneElement(headerIcon, { className: 'header-topic-icon' })}
                </p>
                <div className="headerBtnsContainer">
                    <Link to="/feedback" className='feedbackBtn'>
                        <p>Feedback</p>
                        <MdOutlineFeedback />
                    </Link>

                    <Link to="/bookingForm" className='bookNowBtn'>
                        <p>Book Now</p>
                        <FaHelicopter  />
                    </Link>
                </div>
            </div>
        </>
    );
}

export default UserBookingHeader;