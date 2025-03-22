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

    var obj = { login: loginUsername, password: loginPassword };
    var js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/login'),
        { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

      var res = JSON.parse(await response.text());

      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      }
      else {
        var user = { id: res.id, name: res.name, emailAddress: res.emailAddress }
        localStorage.setItem('user_data', JSON.stringify(user));

        setMessage('');

        window.location.href = '/';
      }
    }
    catch (error: any) {
      alert(error.toString());
      return;
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
      
      <span id="inner-title">PLEASE LOG IN</span><br />
      <span id="loginResult">{message}</span><br />
      <div className="input-box">
        <input type="text" id="loginName" placeholder="Username"
          onChange={handleSetLoginName} /><br />
      </div>
      <div className="input-box">
        <input type="password" id="loginPassword" placeholder="Password"
          onChange={handleSetPassword} /><br />
      </div>
      <div className="input-box">
        <input type="submit" id="loginButton" className="buttons" value="Do It"
          onClick={doLogin} />
      </div>

    </div>
  );
};

export default Login;