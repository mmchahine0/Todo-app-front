import { clearCredentials } from "../../../redux/slices/authSlices";
import { clearUserData } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { Link } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar: React.FC<{
  customLinks: {
    label: string;
    path: string;
    visibility: "logged-in" | "logged-out" | "all" | "admin";
  }[];
}> = ({ customLinks = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const { role } = useSelector((state: RootState) => state.userdata);
  const isAdmin = role === "ADMIN";

  const handleSignOut = () => {
    queryClient.clear();
    dispatch(clearCredentials());
    dispatch(clearUserData());
    navigate("/auth/login");
    setIsMenuOpen(false);
  };

  const links = Array.isArray(customLinks) ? customLinks : [];

  const loggedInLinks = links.filter(
    (link) => link.visibility === "all" || link.visibility === "logged-in"
  );
  const loggedOutLinks = links.filter(
    (link) => link.visibility === "all" || link.visibility === "logged-out"
  );
  const adminLinks = links.filter((link) => link.visibility === "admin");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-[#16C47F]/5 border-b border-[#16C47F]/10 px-4 py-2.5">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-xl font-bold text-[#16C47F] hover:text-[#16C47F]/90 transition-colors"
            >
              MyApp
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {accessToken ? (
              <>
                {isAdmin ? (
                  <>
                    {adminLinks.map((link, index) => (
                      <Link
                        key={`admin-${index}`}
                        to={link.path}
                        className="text-purple-600 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-purple-100"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    {loggedInLinks.map((link, index) => (
                      <Link
                        key={index}
                        to={link.path}
                        className="text-gray-600 hover:text-[#FF9D23] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#FFD65A]/10"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-[#F93827] hover:text-[#F93827] hover:bg-[#F93827]/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                    className="text-gray-600 hover:text-[#16C47F] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#16C47F]/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#16C47F] hover:bg-[#16C47F]/10 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-2">
              {accessToken ? (
                <>
                  {isAdmin ? (
                    <>
                      {adminLinks.map((link, index) => (
                        <Link
                          key={`admin-mobile-${index}`}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="text-purple-600 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-purple-100"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <>
                      {loggedInLinks.map((link, index) => (
                        <Link
                          key={`mobile-${index}`}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="text-gray-600 hover:text-[#FF9D23] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#FFD65A]/10"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-[#F93827] hover:text-[#F93827] hover:bg-[#F93827]/10 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {loggedOutLinks.map((link, index) => (
                    <Link
                      key={`mobile-${index}`}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-600 hover:text-[#16C47F] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#16C47F]/10"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
