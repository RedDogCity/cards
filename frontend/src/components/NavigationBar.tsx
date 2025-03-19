import {Link} from "react-router-dom";
import LogOut from './LogOut.tsx';

import Website_Logo from '../assets/images/Website_Logo.png';

function NavigationBar()
{


    var logOut = < ></>
    if(localStorage.getItem('user_data') != null)
    {
        logOut = <input type='submit' id='logOutButton' className='buttons'
            onClick={LogOut} value='Log Out' />
    }

    return(
        <div>
            <div id="header">
                <a id="logo" href="/" title="AniLert">
                <img src={Website_Logo} alt="Web Logo" width="400" height="150"/>
                </a>
            </div>
            
            <nav>
                
                <Link to="/">Home</Link>
                &emsp;
                <Link to="/login">Login</Link>
                &emsp;
                <Link to="/register">Register</Link>
                &emsp;
                {logOut}
            </nav>
        </div>
    );
};

export default NavigationBar;