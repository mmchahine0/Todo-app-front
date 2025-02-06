import { Link } from "react-router-dom";

interface FooterProps {
  content: {
    companyName?: string;
    description?: string;
    links: { label: string; path: string }[];
  };
}

const Footer: React.FC<FooterProps> = ({ content }) => {
  const currentYear = new Date().getFullYear();
  const companyName = content?.companyName ?? "Company Name";
  const description =
    content?.description ?? "Building better solutions for tomorrow";

  return (
    <footer
      className="bg-[#16C47F]/5 border-t border-[#16C47F]/10"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6 sm:flex-row sm:justify-between sm:space-y-0">
          {/* Company Information */}
          <div
            className="flex flex-col items-center sm:items-start space-y-2"
            aria-labelledby="company-info"
          >
            <h2
              id="company-info"
              className="text-lg font-semibold text-[#16C47F]"
            >
              {companyName}
            </h2>
            <p
              className="text-sm text-gray-600 text-center sm:text-left max-w-md"
              aria-label="Company description"
            >
              {description}
            </p>
          </div>

          {/* Footer Navigation */}
          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-2"
            aria-label="Footer navigation"
          >
            <ul
              className="flex flex-wrap justify-center gap-x-6 gap-y-2"
              role="list"
            >
              {content?.links?.map((link, index) => (
                <li key={index} role="listitem">
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-[#FF9D23] transition-colors duration-150 ease-in-out
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9D23] 
                             rounded-sm px-2 py-1"
                    aria-label={`${link.label} - Footer link`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright Notice */}
        <div
          className="mt-8 pt-6 border-t border-[#16C47F]/10"
          role="presentation"
        >
          <p
            className="text-center text-sm text-gray-500"
            aria-label={`Copyright ${currentYear} ${companyName}`}
          >
            <span aria-hidden="true">©</span> {currentYear} {companyName}. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
