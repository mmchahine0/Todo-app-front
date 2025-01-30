import { clearCredentials } from "../../redux/slices/authSlices";
import { clearUserData } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { Link } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";

const Navbar: React.FC<{
  customLinks: {
    label: string;
    path: string;
    visibility: "logged-in" | "logged-out" | "all";
  }[];
}> = ({ customLinks = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const handleSignOut = () => {
    queryClient.clear();
    dispatch(clearCredentials());
    dispatch(clearUserData());
    navigate("/login");
  };

  const loggedInLinks = customLinks.filter(
    (link) => link.visibility === "all" || link.visibility === "logged-in"
  );
  const loggedOutLinks = customLinks.filter(
    (link) => link.visibility === "all" || link.visibility === "logged-out"
  );

  return (
    <nav className="bg-[#16C47F]/5 border-b border-[#16C47F]/10 px-4 py-2.5 sticky top-0 z-50 backdrop-blur-sm">
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

          <div className="hidden md:flex items-center space-x-4">
            {accessToken ? (
              <>
                {loggedInLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="text-gray-600 hover:text-[#FF9D23] px-3 py-2 rounded-md text-sm font-medium transition-colors
                             hover:bg-[#FFD65A]/10"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="text-[#F93827] hover:text-[#F93827] hover:bg-[#F93827]/10 
                           px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                    className="text-gray-600 hover:text-[#16C47F] px-3 py-2 rounded-md text-sm font-medium transition-colors
                             hover:bg-[#16C47F]/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
