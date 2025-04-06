import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NavigationBar from './components/NavigationBar.tsx';
import HomePage from './pages/HomePage.tsx';
import UserHomePage from './pages/UserHomePage.tsx'; // Import the new page

function App() {
  return (
    <div
      className="m-0 min-w-[640px] min-h-[120vh]" // Increased size
    >
      <div
        className="flex items-center justify-center min-h-[120vh] 
                   bg-[url('/src/assets/images/background.jpg')] 
                   bg-no-repeat bg-center bg-fixed bg-cover"
      >

          <BrowserRouter>
            <NavigationBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/user-home" element={<UserHomePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
  );
}

export default App;