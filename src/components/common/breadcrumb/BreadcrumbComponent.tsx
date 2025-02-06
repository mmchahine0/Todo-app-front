import { useLocation, Link } from "react-router-dom";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const NON_CLICKABLE_PATHS = ["dashboard", "admin"];

export const BreadcrumbComponent = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Enhanced text formatting for better accessibility
  const formatPathName = (path: string) => {
    // Split by hyphens and underscores, then capitalize each word
    return path
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isPathClickable = (path: string) => {
    return !NON_CLICKABLE_PATHS.includes(path.toLowerCase());
  };

  // Generate aria label for current page location
  const generateAriaLabel = () => {
    if (pathnames.length === 0) return "Home page";
    const currentPage = formatPathName(pathnames[pathnames.length - 1]);
    return `Current page: ${currentPage}`;
  };

  // Generate full breadcrumb path for screen readers
  const generateFullPath = () => {
    if (pathnames.length === 0) return "Home";
    return `Home ${pathnames.map((path) => formatPathName(path)).join(" ")}`;
  };

  return (
    <nav aria-label="Breadcrumb navigation">
      {/* Hidden description for screen readers */}
      <span className="sr-only" role="status">
        You are here: {generateFullPath()}
      </span>

      <Breadcrumb aria-label={generateAriaLabel()}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to={"/home"}
                className="text-[#16C47F] hover:text-[#16C47F]/80 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 
                         focus-visible:ring-[#16C47F] rounded-sm px-1"
                aria-label="Return to home page"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const displayValue = formatPathName(value);
            const clickable = isPathClickable(value);

            // Generate descriptive aria-label for each link
            const generateItemAriaLabel = () => {
              if (isLast) return `Current page: ${displayValue}`;
              return `Navigate to ${displayValue}`;
            };

            return (
              <React.Fragment key={to}>
                <BreadcrumbSeparator
                  className="text-[#FFD65A]"
                  aria-hidden="true"
                >
                  /
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  {isLast || !clickable ? (
                    <BreadcrumbPage
                      className="text-gray-500"
                      aria-current="page"
                    >
                      {displayValue}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={to}
                        className="text-[#16C47F] hover:text-[#16C47F]/80 transition-colors
                                 focus-visible:outline-none focus-visible:ring-2 
                                 focus-visible:ring-[#16C47F] rounded-sm px-1"
                        aria-label={generateItemAriaLabel()}
                      >
                        {displayValue}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};
