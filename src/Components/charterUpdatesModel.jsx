import React, { useState, useEffect } from 'react';
import './../Pages/Css/serviceModel.css';

function CharterUpdatesModal({ isOpen, onClose, charter, onUpdate }) {
    const [charterData, setCharterData] = useState(charter || {});

    useEffect(() => {
        if (charter) {
            setCharterData({
                ...charter,
                description: charter.description || ''
            });
        }
    }, [charter]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCharterData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(charterData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="service-modal-overlay">
            <div className="service-modal-content">
              <span className="service-modal-close-button" onClick={onClose}>
                &times;
              </span>
              <div className='form-title'>Charter Updates Form</div>

                <form className="service-admin-form"  onSubmit={handleSubmit}>
                    <div className="popup-title ">Details</div>
                    <div className="service-form-columns">
                        <div className="service-form-column-left">
                            
                            <div className="service-form-group">
                                <label>Charter</label>
                                <input
                                type="text"
                                name="CharterName"
                                value={charterData.charterName || ''}
                                onChange={handleInputChange}
                                required
                            />  
                            </div>
                        </div>

                    </div>
                    <div className="service-form-group service-description-full">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={charterData.description}
                        onChange={handleInputChange}
                        required
                    />
                    </div>
                    <button type="submit" className="admin-submit-button">
                        Update Service
                    </button>
                </form>
            </div>
        </div>
    
    );
}

export default CharterUpdatesModal;
