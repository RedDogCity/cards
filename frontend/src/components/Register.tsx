import React, { useState } from 'react';

function Register() {
    const app_name = '194.195.211.99';
    function buildPath(route: string): string {
        if (import.meta.env.NODE_ENV != 'development') {
            return 'http://' + app_name + ':5000/' + route;
        }
        else {
            return 'http://localhost:5000/' + route;
        }
    }

    const [message, setMessage] = useState('');
    const [registerUsername, setRegisterUsername] = React.useState('');
    const [registerPassword, setRegisterPassword] = React.useState('');
    const [registerName, setRegisterName] = React.useState('');
    const [registerEmailAddress, setRegisterEmailAddress] = React.useState('');

    async function doRegister(event: any): Promise<void> {
        event.preventDefault();

        var obj = {
            login: registerUsername, password: registerPassword,
            name: registerName, emailAddress: registerEmailAddress
        };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/register'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if (res.error != '') {
                setMessage(res.error);
            }
            else {
                setMessage('');

                window.location.href = '/login';
            }
        }
        catch (error: any) {
            alert(error.toString());
            return;
        }
    }

    function handleSetRegisterUsername(e: any): void {
        setRegisterUsername(e.target.value);
    }

    function handleSetRegisterPassword(e: any): void {
        setRegisterPassword(e.target.value);
    }

    function handleSetRegisterName(e: any): void {
        setRegisterName(e.target.value);
    }

    function handleSetRegisterEmailAddress(e: any): void {
        setRegisterEmailAddress(e.target.value);
    }

    return (
        <div id="registerDiv">
            <span id="inner-title">PLEASE REGISTER</span><br />
            <span id="registerResult">{message}</span><br />
            <div className="input-box">
                <input type="text" id="registerName" placeholder="Name"
                    onChange={handleSetRegisterName} /><br />
                    <i className='bx bxs-spreadsheet'></i>
            </div>
            <div className="input-box">
                <input type="text" id="registerEmail" placeholder="Email Address"
                    onChange={handleSetRegisterEmailAddress} /><br />
                    <i className='bx bxs-envelope'></i>
            </div>
            <div className="input-box">
                <input type="text" id="registerLogin" placeholder="Login"
                    onChange={handleSetRegisterUsername} /><br />
                    <i className='bx bxs-log-in-circle' ></i>
            </div>
            <div className="input-box">
                <input type="text" id="registerPassword" placeholder="Password"
                    onChange={handleSetRegisterPassword} /><br />
                    <i className='bx bxs-lock-alt' ></i>
            </div>
            <div className="input-box">
                <input type="submit" id="registerButton" className="buttons" value="Register"
                    onClick={doRegister} />
            </div>

        </div>
    );
};

export default Register;