import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';

const LoginPage = () =>
{
    return(
      <div>
        <section id="flexb" className="min-h-[800px] border-8  bg-[#ffa1b585] border-2 border-white/20 
                    backdrop-blur-md gap-5 flex-wrap justify-center items-center content-center px-30 py-6 rounded-[20px]">
        <PageTitle />
        <Login />
        </section>
      </div>
    );
};

export default LoginPage;