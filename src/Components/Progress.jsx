import React from 'react';
import "./progress.css";

function Progress({ totalSteps, step }) {
    const progress = ((step - 1) / (totalSteps - 1)) * 100;
    return (
        <div className="booking-progress">
            <div
                style={{
                    width: `${progress}%`,
                }}
            >
            </div>
        </div>
    );
}

export default Progress;
