import PageTitle from '../components/PageTitle.tsx';
import Register from '../components/Register.tsx';

const RegisterPage = () =>
{
    return(
        <div>
            <section id="flexb" className="min-h-[800px] border-8  bg-[#ffa1b585] border-2 border-white/20 
                    backdrop-blur-md gap-5 flex-wrap justify-center items-center content-center px-8 py-6 rounded-[20px]">
            <PageTitle />
            <Register />
            </section>
        </div>
    );
};

export default RegisterPage;