import React from 'react'
import "./Css/Feedback.css"
import Header from '../Components/Header';
import { MdOutlineConnectWithoutContact } from "react-icons/md";
import { Link } from 'react-router-dom';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import FeedbackCircle from "../Assets/Vector.png"

function Feedback() {
    return (
        <>
            <Header />

            <div className="whiteSpace"></div>
            <div className="BookingHeaderWrapper">
                <p className="header-Topic">
                    Connect with Us
                    <MdOutlineConnectWithoutContact className='header-topic-icon' />
                </p>
                <div className="headerBtnsContainer">
                    <Link to="/manageBooking" className='bookNowBtn'>
                        <p>Manage Booking</p>
                        <IoIosArrowDroprightCircle />
                    </Link>
                </div>
            </div>

            <div className="feedback-Wrapper">

                <div className="FeedbackImgWrapper">
                    <img src={FeedbackCircle} alt="" />
                    <p>DrukAir
                        Helicopter</p>
                </div>

                <div className="feedbackContent">
                    <p>Grow your national travel network and distribution channels with DrukAir Helicopter. </p>
                    <p className='fedbackBullets'>Utilize our intuitive agent self-service portal to effortlessly manage bookings and guest information.</p>
                    <p className='fedbackBullets'>Help us improve your experience! Please provide your feedback to help us better understand any issues with the reservation process and make it better for you.</p>
                    <p className='fedbackBullets'>Join DrukAir Helicopter and unlock new opportunities for growth and collaboration in the travel industry.</p>

                    <Link to="https://docs.google.com/forms/d/e/1FAIpQLScYfyw8-sx8RUfLzZ7-xoVjffcuBDPZNr1-4F6Uo9yYbuYGaQ/viewform?usp=sf_link" className='feedbackBtnPage'>
                        Provide Feedback
                    </Link>
                </div>

                <div className="topLeftCircle"></div>
                <div className="bottomLeftCircle"></div>
            </div>
        </>
    )
}

export default Feedback;