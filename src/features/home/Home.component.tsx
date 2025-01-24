import { RootState } from "@/redux/persist/persist";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearCredentials } from "../../redux/slices/authSlices";
import { clearUserData } from "../../redux/slices/userSlice";
import { getContent } from "../admin/adminHomeEditLayout/AdminLayout.services";

const Home: React.FC = () => {
  const { data } = useQuery({
    queryKey: ["content"],
    queryFn: () => getContent(""),
  });
  console.log(data)
  return (
    <div>
      <Navbar customLinks={data?.data?.navbar || []} />
      <HeroSection content={data?.data?.hero} />
      <Footer content={data?.data?.footer || { links: [] }} />
    </div>
  );
};

const Navbar: React.FC<{ customLinks: { label: string; path: string;visibility: 'logged-in' | 'logged-out' | 'all' }[] }> = ({
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

  const loggedInLinks = customLinks.filter((link) => link.visibility === 'all' || link.visibility === 'logged-in');
  const loggedOutLinks = customLinks.filter((link) => link.visibility === 'all' || link.visibility === 'logged-out');

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">MyApp</div>
        <div className="space-x-4">
          {accessToken ? (
            <>
              {loggedInLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="text-gray-300 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {loggedOutLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="text-gray-300 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
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
          {content?.title ?? " "}
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          {content?.subtitle ?? " "}
        </p>
        <Link
          to={content?.buttonLink ?? " "}
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600"
        >
          {content?.buttonText ?? " "}
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
          {content?.companyName ?? " "}
        </h3>
        <p className="mb-4">
          {content?.description ?? " "}
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
