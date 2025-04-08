import AlertList from "../components/UserAlertList.tsx"; // Optional: If you want to include alert notifications
import UserAlertList from "../components/UserAlertList.tsx"; // Optional: If you want to include alert notifications

const UserHomePage = () => {
    return (
        <div>
            <section id="flexb" className="min-h-[800px] border-8  bg-[#ffa1b53b] border-2 border-white/20 
                    backdrop-blur-mdflex gap-5 flex-wrap justify-center items-center content-center">
            {(() => {
                const user = JSON.parse(localStorage.getItem("user_data") || '{}');
                return <UserAlertList userId={user.id || ''} />;
            })()}
            </section>

        </div>
    );
}

export default UserHomePage;