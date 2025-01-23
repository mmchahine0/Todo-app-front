import { RootState } from "@/redux/persist/persist";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearCredentials } from "../../redux/slices/authSlices";
import { clearUserData } from "../../redux/slices/userSlice";
import { getContent } from "../../features/admin/adminEditLayout/AdminLayout.services";

const Home: React.FC = () => {
  const { data } = useQuery({
    queryKey: ["content"],
    queryFn: () => getContent(""),
  });

  return (
    <div>
      <Navbar customLinks={data?.data?.navbar || []} />
      <HeroSection content={data?.data?.hero} />
      <Footer content={data?.data?.footer || { links: [] }} />
    </div>
  );
};

const Navbar: React.FC<{ customLinks: { label: string; path: string }[] }> = ({
  customLinks = [],
}) => {
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
          {Array.isArray(customLinks) &&
            customLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="text-gray-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
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

const HeroSection: React.FC<{
  content?: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
}> = ({ content }) => {
  return (
    <section className="bg-gray-100 py-20 min-h-screen flex items-center">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          {content?.title ?? "Welcome to MyApp"}
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          {content?.subtitle ?? "Your one-stop solution for all your needs."}
        </p>
        <Link
          to={content?.buttonLink ?? "/signup"}
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600"
        >
          {content?.buttonText ?? "Get Started"}
        </Link>
      </div>
    </section>
  );
};

const Footer: React.FC<{
  content: {
    companyName?: string;
    description?: string;
    links: { label: string; path: string }[];
  };
}> = ({ content }) => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto text-center">
        <h3 className="text-xl font-bold mb-2">
          {content?.companyName ?? "MyApp"}
        </h3>
        <p className="mb-4">
          {content?.description ?? "© 2024 All rights reserved."}
        </p>
        <div className="space-x-4">
          {content?.links?.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="text-gray-300 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Home;
