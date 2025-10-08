import React, { useEffect, useState } from "react";
import './ActiveAlert.css';
import { BiSearch } from "react-icons/bi";

function ActiveAlert() {
    const [searchTerm, setSearchTerm] = useState('');
    const [nodeStatus, setNodeStatus] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    // Fetch the node statuses from backend
    useEffect(() => {
        fetch("http://localhost:3000/api/nodestatus")
            .then(res => res.json())
            .then(data => {
                setNodeStatus(data);
                setFilteredData(data); // default to showing all
            })
            .catch(err => {
                console.error("Error fetching node status:", err);
            });
    }, []);

    // Handle search button click
    const handleSearch = () => {
        if (searchTerm.trim() === "") {
            setFilteredData(nodeStatus);
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            const filtered = nodeStatus.filter(n =>
                n.nodeId?.toLowerCase().includes(lowerSearch)
            );
            setFilteredData(filtered);
        }
    };

    return (
        <div className="activeAlertsContainer">
            <h2>Node Status</h2>
            <p>This section displays real-time node status data from various sensors.</p>

            <div className="searchBar">
                <h3>Search for Nodes:</h3>
                <input
                    type="text"
                    placeholder="Search Node ID..."
                    className="searchInput"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="searchButton" onClick={handleSearch}>
                    <span>Search</span>
                    <BiSearch className="icon" />
                </button>
            </div>

            <div className="activeAlertsTbl">
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Node ID</th>
                            <th>Location</th>
                            <th>Slope Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredData.length === 0 ? (
                        <tr>
                        <td colSpan="4">No results</td>
                        </tr>
                    ) : (
                        filteredData.map((n, index) => (
                        <tr key={index}>
                            <td>{n.status}</td>
                            <td>{n.nodeId}</td>            
                            <td>{n.location}</td>
                            <td>{n.slopeStatus}</td>       
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ActiveAlert;
