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
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const isPathClickable = (path: string) => {
    return !NON_CLICKABLE_PATHS.includes(path.toLowerCase());
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to={"/home"}
              className="text-[#16C47F] hover:text-[#16C47F]/80 transition-colors"
            >
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayValue = capitalizeFirstLetter(value);
          const clickable = isPathClickable(value);

          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator className="text-[#FFD65A]" />
              <BreadcrumbItem>
                {isLast || !clickable ? (
                  <BreadcrumbPage className="text-gray-500">
                    {displayValue}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={to}
                      className="text-[#16C47F] hover:text-[#16C47F]/80 transition-colors"
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
  );
};
