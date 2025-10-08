import React from "react";
import './monitoring.css';
import { PiMountainsThin } from "react-icons/pi";


function MonitoringLocations() {
    return (
        <div className="monitoringContainer">
            <h2>Monitoring Locations</h2>
            <p>This section displays real-time monitoring of location from various nodes.</p>

            {/* <div className="locationCards">
                <div className="card">
                    <PiMountainsThin className="icon" />
                    <span className="nodeName">Location 1</span>
                    <div className="sensorInfo">
                        <p>14.6042° N, 121.0887° E</p>
                        <p>Sensors: <span className="value">4</span></p>
                    </div>
                    <div className="badge-container">
                        <div className="risk-badge">
                            Low Risk
                        </div>
                    </div>
                </div>

                <div className="card">
                    <PiMountainsThin className="icon" />
                    <span className="nodeName">Location 2</span>
                    <div className="sensorInfo">
                        <p>14.6125° N, 121.0952° E</p>
                        <p>Sensors: <span className="value">4</span></p>
                    </div>
                    <div className="badge-container">
                        <div className="risk-badge">
                            Low Risk
                        </div>
                    </div>
                </div>

                <div className="card">
                    <PiMountainsThin className="icon" />
                    <span className="nodeName">Location 3</span>
                    <div className="sensorInfo">
                        <p>14.5987° N, 121.0834° E</p>
                        <p>Sensors: <span className="value">4</span></p>
                    </div>
                    <div className="badge-container">
                        <div className="risk-badge">
                            Low Risk
                        </div>
                    </div>
                </div>
            </div> */}

            <div className="unavailabilityMessage">
                        [Currently unavailable]
            </div>
        </div>
    );
}
export default MonitoringLocations;