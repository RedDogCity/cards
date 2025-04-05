import React, { useState } from 'react';

function Register() {
    const app_name = '194.195.211.99';
    function buildPath(route: string): string {
        if (import.meta.env.NODE_ENV !== 'development') {
            return 'http://' + app_name + ':5000/' + route;
        } else {
            return 'http://localhost:5000/' + route;
        }
    }

    const [message, setMessage] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmailAddress, setRegisterEmailAddress] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    async function sendVerificationCode(): Promise<void> {
        if (!registerEmailAddress) {
            setMessage('Please enter your email address.');
            return;
        }

        try {
            const response = await fetch(buildPath('api/sendVerificationCode'), {
                method: 'POST',
                body: JSON.stringify({ email: registerEmailAddress }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setMessage('Verification code sent to your email.');
                setIsCodeSent(true);
            } else {
                const res = await response.json();
                setMessage(res.error || 'Failed to send verification code.');
            }
        } catch (error: any) {
            alert(error.toString());
        }
    }

    async function verifyCode(): Promise<void> {
        if (!verificationCode) {
            setMessage('Please enter the verification code.');
            return;
        }

        try {
            const response = await fetch(buildPath('api/verifyCode'), {
                method: 'POST',
                body: JSON.stringify({ email: registerEmailAddress, code: verificationCode }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setMessage('Email verified successfully.');
                setIsEmailVerified(true);
            } else {
                const res = await response.json();
                setMessage(res.error || 'Failed to verify code.');
            }
        } catch (error: any) {
            alert(error.toString());
        }
    }

    async function doRegister(event: any): Promise<void> {
        event.preventDefault();

        if (!isEmailVerified) {
            setMessage('Please verify your email before registering.');
            return;
        }

        const obj = {
            login: registerUsername,
            password: registerPassword,
            name: registerName,
            emailAddress: registerEmailAddress
        };

        try {
            const response = await fetch(buildPath('api/register'), {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();

            if (res.error !== '') {
                setMessage(res.error);
            } else {
                setMessage('');
                window.location.href = '/login';
            }
        } catch (error: any) {
            alert(error.toString());
        }
    }

    return (
        <div id="registerDiv">
            <span id="inner-title">PLEASE REGISTER</span><br />
            <span id="registerResult">{message}</span><br />
            <div className="input-box">
                <input type="text" id="registerName" placeholder="Name" onChange={e => setRegisterName(e.target.value)} /><br />
            </div>
            <div className="input-box">
                <input type="text" id="registerEmail" placeholder="Email Address" onChange={e => setRegisterEmailAddress(e.target.value)} /><br />
                {!isCodeSent && <button onClick={sendVerificationCode}>Send Verification Code</button>}
            </div>
            {isCodeSent && !isEmailVerified && (
                <div className="input-box">
                    <input type="text" id="verificationCode" placeholder="Enter Verification Code" onChange={e => setVerificationCode(e.target.value)} /><br />
                    <button onClick={verifyCode}>Verify Code</button>
                </div>
            )}
            <div className="input-box">
                <input type="text" id="registerLogin" placeholder="Login" onChange={e => setRegisterUsername(e.target.value)} /><br />
            </div>
            <div className="input-box">
                <input type="text" id="registerPassword" placeholder="Password" onChange={e => setRegisterPassword(e.target.value)} /><br />
            </div>
            <div className="input-box">
                <input type="submit" id="registerButton" className="buttons" value="Register" onClick={doRegister} />
            </div>
        </div>
    );
}

export default Register;