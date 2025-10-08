import React, {useState} from "react";
import './Register.css';
import '../../App.css';
import video from '../../LoginAssets/videoplayback.mp4';
import logo from '../../LoginAssets/logo5.png';
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";
import { MdMarkEmailRead } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";

const Register = () => {
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const navigateTo = useNavigate();

    const createUser = (e)=> {
        e.preventDefault(); // Prevent the default form submission behavior
        Axios.post('http://localhost:3000/register', {
            Email: email,
            UserName: userName,
            Password: password
        }).then(() => {
            console.log('user has been created');
            navigateTo('/'); // Redirect to the login page after successful registration
            setEmail('');
            setUserName('');
            setPassword('');
        });
    }
    
    return (
        <div className="registerPage flex">
            <div className="container flex">
                <div className="videoDiv">
                    <video src={video} autoPlay muted loop></video>

                    <div className="textDiv">
                        <h2 className="title">M.A.R.I.T.E.S. SYSTEM WEB APPLICATION</h2>
                        <p>For Landslide Monitoring and Analysis of Risk Indicators in Terrain and Environmental Safety</p>
                    </div>

                    <div className="footerDiv flex">
                        <span className="text">Already have an account?</span>
                        <Link to={'/'}>
                        <button className="btn">Login</button>
                        </Link>
                    </div>
                </div>

                <div className="formDiv flex">
                    <div className="headerDiv">
                        <img src={logo} alt="logo image" />
                        <h3>Registration Form</h3>
                    </div>

                    <form action="" className="form grid">

                        <div className="inputDiv">
                            <label htmlFor="email">Email</label>
                            <div className="input flex">
                                <MdMarkEmailRead className="icon" />
                                <input type="email" placeholder="Enter your email" id="email" onChange={(event) => setEmail(event.target.value)}/>
                            </div>
                        </div>

                        <div className="inputDiv">
                            <label htmlFor="username">Username</label>
                            <div className="input flex">
                                <FaUserShield className="icon" />
                                <input type="text" placeholder="Enter your username" id="username" onChange={(event) => setUserName(event.target.value)}/>
                            </div>
                        </div>
                        <div className="inputDiv">
                            <label htmlFor="password">Password</label>
                            <div className="input flex">
                                <BsFillShieldLockFill className="icon" />
                                <input type="password" placeholder="Enter your password" id="password" onChange={(event) => setPassword(event.target.value)}/>
                            </div>
                        </div>

                        <button type="submit" className="btn flex" onClick={createUser}>
                            <span>Register</span>
                            <AiOutlineSwapRight className="icon" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Register;