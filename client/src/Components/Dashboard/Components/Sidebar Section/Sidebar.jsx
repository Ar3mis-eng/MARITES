import React from "react";
import './Sidebar.css';
import logo from '../../Assets/logo1.ico';
import { TbActivityHeartbeat } from "react-icons/tb";
import { GoAlert } from "react-icons/go";
import { CiLocationOn } from "react-icons/ci";
import { VscGraph } from "react-icons/vsc";
import { IoIosSettings } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import { RiQuestionLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

function Sidebar({ onSelect }) {
    const navigateTo = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        // Perform logout logic here
        navigateTo('/');
        console.log("User has logged out");
    };

    return (
        <div className="sidebar grid">
            <div className="logoDiv flex">
                <img src={logo} alt="logo" />
                <h2>MARITES APP</h2>
            </div>

            <div className="menuDiv">
                <h3 className="divTitle">
                    QUICK MENU
                </h3>
                <ul className="menuLists grid">
                    <li className="listItem">
                        <a href="#" className="menuLink flex" onClick={() => onSelect("sensor")}>
                            <TbActivityHeartbeat className="icon" />
                            <span className="smallText">
                                Real-Time Sensor Data
                            </span>
                        </a>
                    </li>
                    <li className="listItem">
                        <a href="#" className="menuLink flex" onClick={() => onSelect("alerts")}>
                            <GoAlert className="icon" />
                            <span className="smallText">
                                Node Status
                            </span>
                        </a>
                    </li>
                    <li className="listItem">
                        <a href="#" className="menuLink flex" onClick={() => onSelect("locations")}>
                            <CiLocationOn className="icon" />
                            <span className="smallText">
                                Monitoring Locations
                            </span>
                        </a>
                    </li>
                    <li className="listItem">
                        <a href="#" className="menuLink flex" onClick={() => onSelect("risk")}>
                            <VscGraph className="icon" />
                            <span className="smallText">
                                Risk Analysis
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
            
            <div className="settingsDiv">
                <h3 className="divTitle">
                    SETTINGS
                </h3>
                <ul className="menuLists grid">
                    <li className="listItem">
                        <a href="#" className="menuLink flex">
                            <IoIosSettings className="icon" />
                            <span className="smallText">
                                System Settings
                            </span>
                        </a>
                    </li>
                    <li className="listItem">
                        <a href="" className="menuLink flex">
                            <CiLogout className="icon" onClick={handleLogout}/>
                            <span className="smallText" onClick={handleLogout}>
                                Logout
                            </span>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="sideBarCard">
                <RiQuestionLine className="icon" />
                <div className="cardContent">
                    <div className="circle1"></div>
                    <div className="circle2"></div>

                    <h3>Help Center</h3>
                    <p>Having trouble accessing the system? Contact us for more questions.
                    </p>
                    <button className="btn">Go to help center</button>
                </div>
            </div>
        </div>
    );
}
export default Sidebar;