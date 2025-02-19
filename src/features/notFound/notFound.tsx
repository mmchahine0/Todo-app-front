import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const NotFound: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Todo App</title>
        <meta
          name="description"
          content="The page you're looking for cannot be found."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <div className="space-y-4">
            <p className="text-gray-500">Here are some helpful links:</p>
            <nav className="space-x-4">
              <Link to="/" className="text-[#16C47F] hover:underline">
                Home
              </Link>
              <Link to="/dashboard" className="text-[#16C47F] hover:underline">
                Dashboard
              </Link>
              <Link to="/contact" className="text-[#16C47F] hover:underline">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
