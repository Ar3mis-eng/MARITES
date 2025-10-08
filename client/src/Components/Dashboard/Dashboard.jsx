import React, { useState } from "react";
import Sidebar from "./Components/Sidebar Section/Sidebar";
import RealTimeSensorData from "./Components/Body Section/Sensor Data/SensorData";
import ActiveAlerts from "./Components/Body Section/Active Alerts/ActiveAlert";
import MonitoringLocations from "./Components/Body Section/Monitoring Section/monitoring";
import RiskAnalysis from "./Components/Body Section/Risk Analysis/Analysis";
import Body from "./Components/Body Section/body";

const Dashboard = () => {
    const [selected, setSelected] = useState("");

    let BodyComponent;
    switch (selected) {
        case "sensor":
            BodyComponent = <RealTimeSensorData />;
            break;
        case "alerts":
            BodyComponent = <ActiveAlerts />;
            break;
        case "locations":
            BodyComponent = <MonitoringLocations />;
            break;
        case "risk":
            BodyComponent = <RiskAnalysis />;
            break;
        default:
            BodyComponent = <Body />;
            break;
    }

    return (
        <div className="dashboard flex">
            <div className="dashboardContainer">
                <Sidebar onSelect={setSelected} />
                {BodyComponent}
            </div>
        </div>
    );
}
export default Dashboard;