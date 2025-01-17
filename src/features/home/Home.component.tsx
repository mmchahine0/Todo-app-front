import { RootState } from "@/redux/persist/persist";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearCredentials } from "../../redux/slices/authSlices";
import { clearUserData } from "../../redux/slices/userSlice";

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
    </div>
  );
};

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const handleSignOut = () => {
    dispatch(clearCredentials());
    dispatch(clearUserData());
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">MyApp</div>
        <div className="space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white">
            Home
          </Link>
          {accessToken ? (
            <>
              <Link
                to="/dashboard/todo"
                className="text-gray-300 hover:text-white"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white">
                Sign In
              </Link>
              <Link to="/signup" className="text-gray-300 hover:text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gray-100 py-20 min-h-screen flex items-center">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to MyApp</h1>
        <p className="text-lg text-gray-700 mb-8">
          Your one-stop solution for all your needs.
        </p>
        <Link
          to="/signup"
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
};

export default Home;
