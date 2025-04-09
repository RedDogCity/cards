import { Link } from "react-router-dom";
import LogOut from './LogOut.tsx';

import Website_Logo from '../assets/images/Website_Logo.png';


function NavigationBar() {

    const isLoggedIn = localStorage.getItem('user_data') != null;


    var logOut = < ></>
    if (isLoggedIn) {
        logOut = <input type='submit' id='logOutButton' className="font-bold hover:text-[#0a554f]"
            onClick={LogOut} value='Log Out' /> // what i need to fix
    }

    return (

        <div>
            <nav className="fixed top-0 left-0 w-full  mx-auto p-8 text-center 
                    bg-[#00ffff3b] border-2 border-white/20 
                    backdrop-blur-md font-['Space Grotesk']
                    py-[30px] font-bold flex items-center justify-between px-6 py-6 z-50">
                <div id="header" className="justify-right flex items-center">
                    <div id="logo" className="flex items-center p-0 m-0"> {/* Removed padding and margin */}
                        <img src={Website_Logo}
                            alt="Web Logo"
                            className="h-30 w-auto m-0" /> {/* Removed margin */}
                    </div>


                </div>
                <div id="nav-links" className="flex justify-center space-x-10  text-white text-xl"> {/* Centered links */}
                    {!isLoggedIn && (
                        <>
                            <Link to="/">Home</Link>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                    {isLoggedIn && (
                        <>
                            <Link to="/user-home">Search</Link>
                            <Link to="/alert-list">AlertList</Link>
                            <Link to="/popular-anime">Popular Anime</Link>
                            {logOut}
                        </>
                    )}
                </div>

            </nav>
        </div>


    );
};

export default NavigationBar;