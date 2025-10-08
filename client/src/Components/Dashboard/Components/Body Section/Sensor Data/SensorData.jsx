import React, { useState } from "react";
import './SensorData.css';
import { GiAerialSignal } from "react-icons/gi";
import Graph from "../Graph/graph";

function SensorData() {

    const [selectedNode, setSelectedNode] = useState(null);

    const handleCardClick = (node) => {
        setSelectedNode(node);
    };

    return (
        <div className="sensorDataContainer">
            <h2>Real-Time Sensor Data</h2>
            <p>This section displays real-time data from various sensors.</p>

            <div className="sensorCards">
                <div className="card" onClick={() => handleCardClick(1)}>
                    <GiAerialSignal className="icon" />
                    <span className="nodeName">Node 1</span>
                    <div className="sensorInfo">
                        <p>Accelerometer: <span className="status active">Active</span></p>
                        {/* <p>Inclinometer: <span className="status inactive">Inactive</span></p>
                        <p>Ground Motion: <span className="value">0.02g</span></p> */}
                    </div>
                </div>

                <div className="card" onClick={() => handleCardClick(2)}>
                    <GiAerialSignal className="icon" />
                    <span className="nodeName">Node 2</span>
                    <div className="sensorInfo">
                        <p>Accelerometer: <span className="status active">Active</span></p>
                        {/* <p>Inclinometer: <span className="status active">Active</span></p>
                        <p>Ground Motion: <span className="value">0.03g</span></p> */}
                    </div>
                </div>

                {/* <div className="card" onClick={() => handleCardClick(3)}>
                    <GiAerialSignal className="icon" />
                    <span className="nodeName">Node 3</span>
                    <div className="sensorInfo">
                        <p>Accelerometer: <span className="status inactive">Active</span></p>
                        <p>Inclinometer: <span className="status active">Active</span></p>
                        <p>Ground Motion: <span className="value">0.01g</span></p>
                    </div>
                </div> */}
            </div>

            {selectedNode && (
                <div className="fade-in-graph">
                    <h3>Node {selectedNode}</h3>
                    {<Graph node={selectedNode}/>}
                </div>
            )}
        </div>
    );
}
export default SensorData;