
import React, { useState } from 'react';

// function LoggedInName() {
//     var user = {}
//     function doLogout(event: any): void {
//         event.preventDefault();
//         alert('doLogout');
//     };
//     return (
//         <div id="loggedInDiv">
//             <span id="userName">Logged In As John Doe </span><br />
//             <button type="button" id="logoutButton" className="buttons"
//                 onClick={doLogout}> Log Out </button>
//         </div>
//     );
// };

// Different from original code posted!!!!!!!!!!!!!!!!!!


function LoggedInName() {
  // Retrieve and parse user data from localStorage
  const userData = localStorage.getItem("user_data");
  const ud = userData ? JSON.parse(userData) : null;

  if (!ud) {
    return null; // If no user data, don't render anything
  }

  const { id, firstName, lastName } = ud;

  const doLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    localStorage.removeItem("user_data");
    window.location.href = "/";
  };

  return (
    <div id="loggedInDiv">
      <span id="userName">Logged In As {firstName} {lastName}</span>
      <br />
      <button type="button" id="logoutButton" className="buttons" onClick={doLogout}>
        Log Out
      </button>
    </div>
  );
}

export default LoggedInName;