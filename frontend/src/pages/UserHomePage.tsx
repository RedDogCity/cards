import AlertList from "../components/UserAlertList.tsx"; // Optional: If you want to include alert notifications
import AnimeSearch from "../components/Animesearch.tsx";

const UserHomePage = () => 
    {
    return (
        <div>
         <section id="flexb" className="min-h-[800px] border-8 border-black flex gap-5 flex-wrap justify-center items-center content-center">
            <AnimeSearch />
        </section>


        </div>

    );
}

export default UserHomePage;