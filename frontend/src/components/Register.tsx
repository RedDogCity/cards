function Register()
{
    function doRegister(event:any) : void
    {
        event.preventDefault();

        alert('saveIt');
    }

    return(
        <div id="registerDiv">
            <span id="inner-title">PLEASE REGISTER</span><br />
            <input type="text" id="registerName" placeholder="Name" /><br />
            <input type="text" id="registerEmail" placeholder="Email Address" /><br />
            <input type="text" id="registerLogin" placeholder="Login" /><br />
            <input type="text" id="registerPassword" placeholder="Password" /><br />
            <input type="submit" id="registerButton" className="buttons" value="Register"
                onClick={doRegister} />
            <span id="registerResult"></span>
        </div>
    );
};

export default Register;