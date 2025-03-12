import {Link} from "react-router-dom";
import LogOut from './LogOut.tsx';

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