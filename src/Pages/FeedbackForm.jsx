import React, { useState } from 'react'
import "./Css/FeedbackForm.css"
import Header from '../Components/Header';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { Link } from 'react-router-dom';
import { MdOutlineConnectWithoutContact } from "react-icons/md";
import Swal from 'sweetalert2'

function FeedbackForm() {
    const genderTypes = ['Male', 'Female', 'Others'];
    const serviceTypes = ['Emergency', 'Cargo', 'Charter', 'Tourist'];
    const sources = ['Family/Friends/Colleagues', 'Social Media', 'Website', 'Agent'];
    const FlightTiming = ['Yes', 'No']
    const [scaleValue, setScaleValue] = useState(5);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = getTodayDate();

    const initialFormData = {
        date: today,
        agentName: '',
        age: '',
        nationality: '',
        gender: '',
        selectedServiceType: '',
        selectedSource: '',
        selectedFlightTime: '',
        selectedChopperFees: '',
        selectedInfo: '',
        selectedEfficiency: '',
        selectedPilotRating: '',
        selectedImportance: '',
        scaleValue: 5,
        improvement: ''
    };

    const [feedbackFormData, setFeedbackFormData] = useState(initialFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedbackFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleScaleChange = (e) => {
        const value = parseInt(e.target.value);
        setScaleValue(value);
        setFeedbackFormData(prevState => ({
            ...prevState,
            scaleValue: value
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "",
            text: "Are you sure you want to submit the feedback?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1E306D",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Submit Feedback"

        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "",
                    text: "Feedback Submitted Succesfully",
                    icon: "success"
                });
                setFeedbackFormData(initialFormData);
            }
        });
    };

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

            <div className="feedbackFormWrapper">
                <div className="booking-form-container feedback-form-container">
                    <h2>Customer Feedback Form/ཞབས་ཏོག་བསམ་ལན་འབྲི་ཤོག།</h2>
                    <p className='feedback-ins'>Please fill out the feedback form to help us promote high quality service with utmost customer
                        satisfaction to our service users. </p>
                    <p className='feedback-ins-dzo'>ཞབས་ཏོག་སྤྱོད་མི་ཚུ་ལུ་ཡིད་ཚིམ་ཚུགས་པའི་སྤུས་ཚད་ཅན་གྱི་ཞབས་ཏོག་ཕུལ་ཚུགསཔ་སྦེ་བཟོ་ནིའི་དོན་ལུ་ཞབས་
                        ཏོག་བསམ་ལན་འབྲི་ཤོག་འདི་བཀང་གནང་།</p>
                    <form onSubmit={handleSubmit}>
                        <div className="booking-form-group">
                            <label>
                                <div className='dzoLabel'>
                                    Date / <span className='dzo-span'>སྤྱི་ཚེས།</span>
                                </div>
                                <input
                                    type="date"
                                    name="date"
                                    value={feedbackFormData.date}
                                    readOnly
                                />
                            </label>

                            <label>
                                <div className='dzoLabel'>
                                    Name of agency /  <span className='dzo-span'>ལས་སྡེའི་མིང་།</span>
                                </div>
                                <input
                                    type="text"
                                    name="agentName"
                                    placeholder='Eg. Angel Institute'
                                    value={feedbackFormData.agentName}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                <div className='dzoLabel'>
                                    Age / <span className='dzo-span'>སྐྱེས་ལོ།</span>
                                </div>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder='Eg. 30'
                                    value={feedbackFormData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                <div className='dzoLabel'>
                                    Nationality /  <span className='dzo-span'>མི་ཁུངས།</span>
                                </div>
                                <input
                                    type="text"
                                    name="nationality"
                                    placeholder='Eg. Bhutanese'
                                    value={feedbackFormData.nationality}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                <div className='dzoLabel'>
                                    Gender / <span className='dzo-span'>ཕོ། མོ།</span>
                                </div>
                                <select
                                    name="gender"
                                    value={feedbackFormData.gender}
                                    onChange={handleChange}
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

                            <label>
                                <div className='dzoLabel'>
                                    Type of service availed /  <span className='dzo-span'>ཞབས་ཏོག་གི་དབྱེ་ཁག།</span>
                                </div>
                                <select
                                    name="selectedServiceType"
                                    value={feedbackFormData.selectedServiceType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Service Type</option>
                                    {serviceTypes.map((serviceType, index) => (
                                        <option key={index} value={serviceType}>
                                            {serviceType}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                <div className='dzoLabel'>
                                    How did you hear about us? / <span className='dzo-span'>ང་བཅས་ཀྱི་ཞབས་ཏོག་གི་སྐོར་ལས་ག་ཏེ་ལས་གོ་ཡི </span>
                                </div>
                                <select
                                    name="selectedSource"
                                    value={feedbackFormData.selectedSource}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Source</option>
                                    {sources.map((source, index) => (
                                        <option key={index} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <div className='dzoLabel'>
                                    Did your flight leave on time? /  <span className='dzo-span'>གནམ་གྲུ་དུས་ཚོད་ཁར་འཕུར་འགྲུལ་འབད་ཡི་ག ?</span>
                                </div>
                                <select
                                    name="selectedFlightTime"
                                    value={feedbackFormData.selectedFlightTime}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select An Option</option>
                                    {FlightTiming.map((ftime, index) => (
                                        <option key={index} value={ftime}>
                                            {ftime}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                2) How did you find our chopper fees?
                                <span className='dzo-span'>༢༽ གནམ་གྲུའི་གླ་འཐུས་ག་དེ་སྦེ་འདུག། ?</span>
                                <div className='helipadPermission feedback-radios'>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedChopperFees"
                                            value="Cheap"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedChopperFees === "Cheap"}
                                            required
                                        />
                                        Cheap / ཁེ་ཏོག་ཏོ་འདུག།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedChopperFees"
                                            value="Reasonable"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedChopperFees === "Reasonable"}
                                            required
                                        />
                                        Reasonable /  རན་ཏོག་ཏོ་འདུག།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedChopperFees"
                                            value="Expensive"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedChopperFees === "Expensive"}
                                            required
                                        />
                                        Expensive / གོང་མཐོ་བས།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedChopperFees"
                                            value="Very expensive"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedChopperFees === "Very expensive"}
                                            required
                                        />
                                        Very expensive / གནམ་མེད་ས་མེད་མཐོ་བས།
                                    </label>
                                </div>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                3) Do you think your queries and problems received adequate information and support from our Customer Services Team?
                                <span className='dzo-span'>༣༽ ང་བཅས་རའི་ཞབས་ཏོག་སྡེ་ཚན་ལས་ ཁྱོད་རའི་དྲི་བ་
                                    དངདཀའ་ངལ་ཚུ་གུར་ ངོས་ལེན་དང་རྒྱབ་སྐྱོར་ ལེགས་ཤོམ་སྦེ་
                                    ཐོབ་ཚུགས་ཅི་ག ?</span>
                                <div className='helipadPermission feedback-radios'>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedInfo"
                                            value="Excellent"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedInfo === "Excellent"}
                                            required
                                        />
                                        Excellent / ངལ་རངས་ཏོག་ཏོ་སྦེ་ཐོབ་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedInfo"
                                            value="Good"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedInfo === "Good"}
                                            required
                                        />
                                        Good / ལེགས་ཤོམ་སྦེ་ཐོབ་ཚུགས་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedInfo"
                                            value="Satisfactory"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedInfo === "Satisfactory"}
                                            required
                                        />
                                        Satisfactory / ཀྲིག་ཀྲི་ཅིག་ཐོབ་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedInfo"
                                            value="Poor"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedInfo === "Poor"}
                                            required
                                        />
                                        Poor / ཧ་ལམ་ཅིག་ར་ཨིན་མས།
                                    </label>
                                </div>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                4) How efficient and friendly was our Ground Crew?
                                <span className='dzo-span'>༤༽ ང་བཅས་ཀྱི་གནམ་གཡོགཔ་ཚུ་ འཇོན་དྲགས་དང་དགའ་ཏོག་ ཏོ་འདུག་ག ?</span>
                                <div className='helipadPermission feedback-radios'>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedEfficiency"
                                            value="Excellent"
                                            checked={feedbackFormData.selectedEfficiency === "Excellent"}
                                            onChange={handleChange}
                                            required
                                        />
                                        Excellent / ངལ་རངས་ཏོག་ཏོ་སྦེ་ཐོབ་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedEfficiency"
                                            value="Good"
                                            checked={feedbackFormData.selectedEfficiency === "Good"}
                                            onChange={handleChange}
                                            required
                                        />
                                        Good / ལེགས་ཤོམ་སྦེ་ཐོབ་ཚུགས་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedEfficiency"
                                            value="Satisfactory"
                                            checked={feedbackFormData.selectedEfficiency === "Satisfactory"}
                                            onChange={handleChange}
                                            required
                                        />
                                        Satisfactory / ཀྲིག་ཀྲི་ཅིག་ཐོབ་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedEfficiency"
                                            checked={feedbackFormData.selectedEfficiency === "Poor"}
                                            value="Poor"
                                            onChange={handleChange}
                                            required
                                        />
                                        Poor / ཧ་ལམ་ཅིག་ར་ཨིན་མས།
                                    </label>
                                </div>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                5) How customer friendly was our Pilot?
                                <span className='dzo-span'>༥༽ གནམ་གྲུའི་དེད་གཡོགཔ་ དགའ་ཏོག་ཏོ་འདུག་ག ?</span>
                                <div className='helipadPermission feedback-radios'>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedPilotRating"
                                            value="Excellent"
                                            checked={feedbackFormData.selectedPilotRating === "Excellent"}
                                            onChange={handleChange}
                                            required
                                        />
                                        Excellent / ངལ་རངས་ཏོག་ཏོ་སྦེ་ཐོབ་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedPilotRating"
                                            value="Good"
                                            checked={feedbackFormData.selectedPilotRating === "Good"}
                                            onChange={handleChange}
                                            required
                                        />
                                        Good / ལེགས་ཤོམ་སྦེ་ཐོབ་ཚུགས་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedPilotRating"
                                            value="Satisfactory"
                                            checked={feedbackFormData.selectedPilotRating === "Satisfactory"}
                                            onChange={handleChange}
                                            required
                                        />
                                        Satisfactory / ཀྲིག་ཀྲི་ཅིག་ཐོབ་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedPilotRating"
                                            value="Poor"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedPilotRating === "Poor"}
                                            required
                                        />
                                        Poor / ཧ་ལམ་ཅིག་ར་ཨིན་མས།
                                    </label>
                                </div>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                6) Do you think the helicopter services play an important role for passenger transport in Bhutan?
                                <span className='dzo-span'>༦༽ འབྲུག་རྒྱལ་ཁབ་ནང་ འགྲུལ་པ་སྐྱེལ་འདྲེན་
                                    འགྲེན་འབད་ནིའི་དོན་ལུ་ ཐད་འཕུར་གནམ་གྲུའི་ཞབས་ཏོག་
                                    དགོཔ་ཁག་ཆེཝ་སྦེ་མཐོངམ་མས་ག?</span>
                                <div className='helipadPermission feedback-radios'>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedImportance"
                                            value="Yes"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedImportance === "Yes"}
                                            required
                                        />
                                        Yes / ཁག་ཆེ་བས།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedImportance"
                                            value="No"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedImportance === "No"}
                                            required
                                        />
                                        No / ལེགས་ཤོམ་སྦེ་ཐོབ་ཚུགས་ཅི།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedImportance"
                                            value="Can’t Say"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedImportance === "Can’t Say"}
                                            required
                                        />
                                        Can’t Say / ཁག་མི་ཆེ་བས།
                                    </label>
                                    <label className='radio-label'>
                                        <input
                                            className='feedback-radio-input'
                                            type="radio"
                                            name="selectedImportance"
                                            value="Not at all"
                                            onChange={handleChange}
                                            checked={feedbackFormData.selectedImportance === "Not at all"}
                                            required
                                        />
                                        Not at all / དགོཔ་ར་མིན་འདུག།
                                    </label>
                                </div>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                7) On a scale from 0 to 10, how likely would you be to recommend our company to a friend?
                                <span className='dzo-span'>༧༽ ཁྱོད་ཀྱིས་ང་བཅས་ཀྱི་ཚོང་སྡེའི་སྐོར་ལས་ ཁྱོད་རའི་ཆ་རོགས་ལུ་ངོ་སྦྱོར་བྱིན་དགོ་པ་ཅིན་ ཚད་གཞི་ ༠ ལས་ ༡༠
                                    ཚུན་ ག་དེམ་ཅིག་བྱིན་ནི་སྨོ?</span>
                                <div className="scaleBox">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={feedbackFormData.scaleValue}
                                        onChange={handleScaleChange}
                                        name="scaleValue"
                                        required
                                        className='scaleInput'
                                    />
                                    <div className="value-display">{feedbackFormData.scaleValue}</div>
                                </div>
                            </label>
                        </div>

                        <div className="booking-form-group">
                            <label>
                                8) How would you like us to improve our service? Kindly provide your feedback.
                                <span className='dzo-span'>༨ ༽ ང་བཅས་ཀྱིས་ ཞབས་ཏོག་ག་དེ་སྦེ་ཡར་དྲག་གཏང་
                                    དགོཔ་འདུག་ག་གི་སྐོར་ལས་ ཁྱོད་རའི་བསམ་འཆར་ཅིག་བཀོད་
                                    དེ་བཀའ་དྲིན་བསྐྱང་གནང་།</span>

                                <textarea
                                    id="improvement"
                                    name="improvement"
                                    onChange={handleChange}
                                    required
                                    value={feedbackFormData.improvement}
                                    className='improvement'
                                    rows="5"
                                    placeholder="Write what more we can do for you..."
                                />
                            </label>
                        </div>

                        <button className='FeedbackFormBtn'>Submit</button>
                    </form>
                </div>

            </div >
        </>
    )
}
export default FeedbackForm;