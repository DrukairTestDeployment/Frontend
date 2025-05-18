import React, { useState, useEffect } from 'react';
import { GiHelicopter } from "react-icons/gi";
import './HelicopterLoader.css';
import LoaderImg from '../Assets/translogo.png';


const HelicopterLoader = ({ image }) => {
    const [angle, setAngle] = useState(0);
    const [containerSize, setContainerSize] = useState({ width: 160, radius: 80 });

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            if (width <= 480) {
                setContainerSize({ width: 100, radius: 50 });
            } else if (width <= 768) {
                setContainerSize({ width: 130, radius: 65 });
            } else {
                setContainerSize({ width: 160, radius: 80 });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setAngle((prevAngle) => (prevAngle + 2) % 360);
        }, 30);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loaderMain">
            <div className="loaderWrapper">
                <div className="helicopter-description">
                    <div className="LoaderImgContainer">
                        <img src={LoaderImg} alt="Loader" />
                    </div>
                </div>
                <div 
                    className="helicopter-loader"
                    style={{ 
                        width: `${containerSize.width}px`,
                        height: `${containerSize.width}px`
                    }}
                >
                    {Array.from({ length: 6 }).map((_, index) => {
                        const helicopterAngle = angle + (360 / 6) * index;
                        const helicopterSize = containerSize.width * 0.1875; 
                        const helicopterStyle = {
                            left: `${Math.cos((helicopterAngle * Math.PI) / 180) * containerSize.radius + containerSize.radius - helicopterSize / 2}px`,
                            top: `${Math.sin((helicopterAngle * Math.PI) / 180) * containerSize.radius + containerSize.radius - helicopterSize / 2}px`,
                            transform: `rotate(${helicopterAngle + 90}deg)`,
                            fontSize: `${helicopterSize}px`
                        };

                        return <GiHelicopter key={index} className="helicopter" style={helicopterStyle} />;
                    })}
                </div>
            </div>
            <div className="loaderDes">
                <p>Loading your flight details...</p>
            </div>
        </div>
    );
};

export default HelicopterLoader;