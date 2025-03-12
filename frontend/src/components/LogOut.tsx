function LogOut()
{
    if(localStorage.getItem('user_data') != null)
    {
        localStorage.removeItem('user_data');
    }

    window.location.href = '/';
}

export default LogOut;