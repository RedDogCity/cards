import {Link} from "react-router-dom";

function NavigationBar()
{
    return(
        <div>
            <nav>
                <Link to="/">Home</Link>
                &emsp;
                <Link to="/login">Login</Link>
                &emsp;
                <Link to="/register">Register</Link>
            </nav>
        </div>
    );
};

export default NavigationBar;