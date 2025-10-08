import React, {useEffect, useState} from "react";
import './Login.css';
import '../../App.css';
import video from '../../LoginAssets/videoplayback.mp4';
import logo from '../../LoginAssets/logo5.png';
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";

const Login = () => {
    const [loginUserName, setLoginUserName] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const navigateTo = useNavigate();

    const [loginStatus, setLoginStatus] = useState('');
    const [statusHolder, setStatusHolder] = useState('message');

    const loginUser = (e)=> {
        e.preventDefault(); // Prevent the default form submission behavior
        Axios.post('http://localhost:3000/login', {
            LoginUserName: loginUserName,
            LoginPassword: loginPassword
        }).then((response) => {
            console.log();
            if (response.data.message || loginUserName === '' || loginPassword === '') {
                navigateTo('/'); // Redirect to the login page if login fails
                setLoginStatus("Credentials Don't Match!"); // Set the login status message
            }
            else {
                console.log('User has logged in');
                navigateTo('/dashboard'); // Redirect to the dashboard on successful login
            }
        });
    }

    useEffect(() => {
        if (loginStatus !== ''){
            setStatusHolder('showMessage');
            setTimeout(() => {
                setStatusHolder('message');
            }, 4000); // Hide the message after 4 seconds
        }
    }, [loginStatus]);

    const onSubmit = ()=> {
        setLoginUserName(loginUserName);
        setLoginPassword(loginPassword);
    }

    return (
        <div className="loginPage flex">
            <div className="container flex">
                <div className="videoDiv">
                    <video src={video} autoPlay muted loop></video>

                    <div className="textDiv">
                        <h2 className="title">M.A.R.I.T.E.S. WEB APPLICATION</h2>
                        <p>For Landslide Monitoring and Analysis of Risk Indicators in Terrain and Environmental Safety</p>
                    </div>

                    <div className="footerDiv flex">
                        <span className="text">Don't have an account?</span>
                        <Link to={'/register'}>
                        <button className="btn">Sign Up</button>
                        </Link>
                    </div>
                </div>

                <div className="formDiv flex">
                    <div className="headerDiv">
                        <img src={logo} alt="logo image" />
                        <h3>Welcome Back!</h3>
                    </div>

                    <form action="" className="form grid" onSubmit={onSubmit}>
                        {/* Display login status message */}
                        <span className={statusHolder}>{loginStatus}</span>
                        
                        <div className="inputDiv">
                            <label htmlFor="username">Username</label>
                            <div className="input flex">
                                <FaUserShield className="icon" />
                                <input type="text" placeholder="Enter your username" id="username" onChange={(event) => setLoginUserName(event.target.value)}/>
                            </div>
                        </div>
                        <div className="inputDiv">
                            <label htmlFor="password">Password</label>
                            <div className="input flex">
                                <BsFillShieldLockFill className="icon" />
                                <input type="password" placeholder="Enter your password" id="password" onChange={(event) => setLoginPassword(event.target.value)} />
                            </div>
                        </div>

                        <button type="submit" className="btn flex" onClick={loginUser}>
                            <span>Login</span>
                            <AiOutlineSwapRight className="icon" onClick={loginUser}/>
                        </button>

                        <span className="forgotPassword">
                            Forgot your password? <a href="">Click here</a>
                        </span>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Login;