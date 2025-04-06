import AlertList from "../components/AlertList.tsx"; // Optional: If you want to include alert notifications
import AnimeSearch from "../components/Animesearch.tsx";

const UserHomePage = () => 
    {
    return (
        <div>
         <section id="flexb" className="min-h-[800px] border-8 border-black flex gap-5 flex-wrap justify-center items-center content-center">
            <AnimeSearch />
        </section>


        </div>

        // <section id="flexb" className="min-h-[800px] border-8 border-black flex gap-5 flex-wrap justify-center items-center content-center">
            
        //     <div className="box">1</div>
        //     <div className="box">2</div>
        //     <div className="box">3</div>
        //     <div className="box">4</div>
        //     <div className="box">5</div>
        //     <div className="box">6</div>
        //     <div className="box">7</div>
        //     <div className="box">8</div>
        //     <div className="box">9</div>
        // </section>
    );
}

export default UserHomePage;