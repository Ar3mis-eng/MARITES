import React from "react";
import './Analysis.css';

function Analysis() {
    return (
        <div className="analysisContainer">
            <h2>Risk Analysis</h2>
            <p>This section displays risk analysis data from various sensors.</p>

            <div className="unavailabilityMessage">
                [Currently unavailable]
            </div>
        </div>
    );
}
export default Analysis;