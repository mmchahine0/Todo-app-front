import { clearCredentials } from "../../../redux/slices/authSlices";
import { clearUserData } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { Link } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NavbarProps {
  customLinks: {
    label: string;
    path: string;
    visibility: "logged-in" | "logged-out" | "all" | "admin";
  }[];
}

const Navbar: React.FC<NavbarProps> = ({ customLinks = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const { role } = useSelector((state: RootState) => state.userdata);
  const isAdmin = role === "ADMIN";

  // Handle closing menu with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Handle clicking outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Focus trap within mobile menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const menuElement = menuRef.current;
    if (!menuElement) return;

    const focusableElements = menuElement.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex="0"]'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    menuElement.addEventListener("keydown", handleTabKey);
    return () => menuElement.removeEventListener("keydown", handleTabKey);
  }, [isMenuOpen]);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav
        className="bg-[#16C47F]/5 border-b border-[#16C47F]/10 px-4 py-2.5"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-xl font-bold text-[#16C47F] hover:text-[#16C47F]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F] rounded-md"
                aria-label="MyApp Home"
              >
                MyApp
              </Link>
            </div>

            {/* Desktop Menu */}
            <div
              className="hidden md:flex items-center space-x-4"
              role="menubar"
              aria-label="Desktop navigation menu"
            >
              {accessToken ? (
                <>
                  {isAdmin ? (
                    <>
                      {adminLinks.map((link, index) => (
                        <Link
                          key={`admin-${index}`}
                          to={link.path}
                          className="text-purple-600 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                          role="menuitem"
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
                          className="text-gray-600 hover:text-[#FF9D23] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#FFD65A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9D23]"
                          role="menuitem"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-[#F93827] hover:text-[#F93827] hover:bg-[#F93827]/10 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F93827]"
                    role="menuitem"
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
                      className="text-gray-600 hover:text-[#16C47F] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#16C47F]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                      role="menuitem"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#16C47F] hover:bg-[#16C47F]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
            >
              {isMenuOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu Panel */}
          <div
            ref={menuRef}
            id="mobile-menu"
            className={`md:hidden py-4 ${isMenuOpen ? "" : "hidden"}`}
            role="menu"
            aria-label="Mobile navigation menu"
          >
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
                          className="text-purple-600 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                          role="menuitem"
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
                          className="text-gray-600 hover:text-[#FF9D23] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#FFD65A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9D23]"
                          role="menuitem"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-[#F93827] hover:text-[#F93827] hover:bg-[#F93827]/10 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F93827]"
                    role="menuitem"
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
                      className="text-gray-600 hover:text-[#16C47F] px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#16C47F]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                      role="menuitem"
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
    </header>
  );
};

export default Navbar;
