import React, { useState } from 'react';

function Login() {
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
  const [loginUsername, setLoginUsername] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();

    if (!loginUsername || !loginPassword) {
      setMessage('Please enter both username and password.');
      return;
    }

    var obj = { login: loginUsername, password: loginPassword };
    var js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });
    
      if (!response.ok) {
        setMessage('Login failed. Please try again.');
        return;
      }
    
      const res = JSON.parse(await response.text());
    
      if (res.error || res.id <= 0) {
        setMessage(res.error || 'User/Password combination incorrect or email not verified.');
      } else {
        const user = { id: res.id, name: res.name, emailAddress: res.emailAddress };
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        window.location.href = '/user-home'; // Redirect to user home page after successful login
      }
    } catch (error:any) {
      alert('An error occurred: ' + error.toString());
    }
  }

  function handleSetLoginName(e: any): void {
    setLoginUsername(e.target.value);
  }

  function handleSetPassword(e: any): void {
    setLoginPassword(e.target.value);
  }




  return (

    <div id="loginDiv">
      <span id="inner-title" className="text-[1.2em] font-['Space Grotesk'] leading-[2.1]" >PLEASE LOG IN</span><br />
      <span id="loginResult">{message}</span><br />
      <div className="input-box">
        <input type="text" id="loginName" placeholder="Username"
          onChange={handleSetLoginName} /><br />
        <i className='bx bxs-log-in-circle' ></i>
      </div>
      <div className="input-box">
        <input type="password" id="loginPassword" placeholder="Password"
          onChange={handleSetPassword} /><br />
        <i className='bx bxs-lock-alt' ></i>
      </div>
      <div className="input-box">
        <input type="submit" id="loginButton"
          className="rounded-full border border-transparent px-[0.9em] py-[0.4em] 
       text-[1em] font-black bg-red-600 cursor-pointer 
       transition-colors duration-200 hover:border-[#646cff] focus:outline focus:outline-4 
       focus:outline-blue-400"
          value="Do It"
          onClick={doLogin} />
      </div>

    </div>


  );
};

export default Login;