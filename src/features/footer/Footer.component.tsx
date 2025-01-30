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

  return (
    <footer className="bg-[#16C47F]/5 border-t border-[#16C47F]/10">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6 sm:flex-row sm:justify-between sm:space-y-0">
          {/* Company info */}
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <h3 className="text-lg font-semibold text-[#16C47F]">
              {content?.companyName ?? "Company Name"}
            </h3>
            <p className="text-sm text-gray-600 text-center sm:text-left max-w-md">
              {content?.description ?? "Building better solutions for tomorrow"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {content?.links?.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="text-sm text-gray-600 hover:text-[#FF9D23] transition-colors duration-150 ease-in-out"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-[#16C47F]/10">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} {content?.companyName ?? "Company Name"}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
