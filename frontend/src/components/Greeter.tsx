import React from 'react';

function Greeter() {
    let name = 'Guest';
    if (localStorage.getItem('user_data') != null) {
        let _ud: any = localStorage.getItem('user_data');
        let ud = JSON.parse(_ud);
        name = ud.name;
    }

    return (
        
            <div id='greeter-text'>
                <h1 className = "text-[3.2em] font-['Space Grotesk'] leading-[2.1]"> Welcome To AniLert!: {name}</h1>
            </div>
        

    );
};

export default Greeter;