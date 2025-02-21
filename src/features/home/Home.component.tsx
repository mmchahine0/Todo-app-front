import React, { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getContent } from "../admin/adminHomeEditLayout/AdminLayout.services";
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { SiteContent } from "../admin/adminHomeEditLayout/AdminLayout.types";
import { Helmet } from "react-helmet-async";
import home from "../../assets/home.png";
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";

interface StructuredDataProps {
  data: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

const iconMap = {
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
} as const;

const SkipToMain = () => (
  <Link
    to="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 bg-[#16C47F] text-white p-4 z-50 rounded-lg"
  >
    Skip to main content
  </Link>
);

const Home: React.FC = () => {
  const { data: contentResponse, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => getContent(""),
    select: (response) =>
      ({
        hero: response.data.hero,
        features: response.data.features,
        statistics: response.data.statistics,
        cta: response.data.cta,
      } as Partial<SiteContent>),
  });

  if (
    isLoading ||
    !contentResponse ||
    !contentResponse.features ||
    !contentResponse.statistics
  ) {
    return <LoadingSpinner size="lg" label="Loading Home..." />;
  }

  const { hero, features, statistics, cta } = contentResponse;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: hero?.title || "Todo App",
    description: hero?.subtitle || "A modern task management application",
    url: window.location.origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${window.location.origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Todo App",
      logo: {
        "@type": "ImageObject",
        url: `${window.location.origin}/logo.png`,
      },
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "Todo App",
      applicationCategory: "TaskManagement",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>{hero?.title || "Todo App"}</title>
        <meta
          name="description"
          content={hero?.subtitle || "A modern task management application"}
        />
        <meta property="og:title" content={hero?.title || "Todo App"} />
        <meta
          property="og:description"
          content={hero?.subtitle || "A modern task management application"}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta
          property="og:image"
          content={`${window.location.origin}/og-image.jpg`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta
          name="keywords"
          content="todo app, task management, productivity, organization"
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <StructuredData data={structuredData} />
      <SkipToMain />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-col min-h-screen bg-[#FAFAFA]"
      >
        {/* Hero Section */}
        {hero && (
          <section
            aria-labelledby="hero-title"
            className="relative flex items-center min-h-[400px] md:min-h-[600px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#16C47F]/40 via-[#FFD65A]/40 to-[#FF9D23]/40" />
            <img
              src={home}
              alt="Hero section background showing our application interface"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
              loading="eager"
              fetchpriority="high"
              width="1920"
              height="1080"
              decoding="async"
            />
            <div className="relative container mx-auto px-4 py-12 md:py-20 text-center">
              <h1
                id="hero-title"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in text-black"
              >
                {hero.title}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-black/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                {hero.subtitle}
              </p>
              <Link
                to={hero.buttonLink}
                className="inline-flex items-center gap-2 bg-[#FFD65A] text-gray-800 px-6 py-3 md:px-8 md:py-4 
                         rounded-lg text-base md:text-lg font-medium hover:bg-[#FFD65A]/90 transition-all 
                         duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none 
                         focus:ring-2 focus:ring-[#FFD65A]/50 focus:ring-offset-2"
                aria-label={`${hero.buttonText} - Learn more about our services`}
              >
                {hero.buttonText}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        <Suspense
          fallback={<LoadingSpinner size="md" label="Loading content..." />}
        >
          {/* Features Section */}
          {features?.items?.length > 0 && (
            <section
              aria-labelledby="features-title"
              className="py-12 md:py-20 bg-white"
            >
              <div className="container mx-auto px-4">
                <h2
                  id="features-title"
                  className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800"
                >
                  {features.title}
                </h2>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
                  role="list"
                >
                  {features.items.map((feature, index) => {
                    const IconComponent =
                      iconMap[feature.icon as keyof typeof iconMap] ||
                      CheckCircle;
                    return (
                      <div
                        key={index}
                        role="listitem"
                        className="p-6 md:p-8 rounded-xl transition-all duration-200 hover:scale-105 bg-white/50 
                                 hover:bg-white/80 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-[#16C47F]"
                        style={{ borderLeft: "4px solid #16C47F" }}
                        tabIndex={0}
                      >
                        <IconComponent
                          className="w-8 h-8 md:w-10 md:h-10 mb-4 text-[#16C47F]"
                          aria-hidden="true"
                        />
                        <h3 className="text-lg md:text-xl font-semibold mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base">
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Statistics Section */}
          {statistics?.items?.length > 0 && (
            <section
              aria-labelledby="statistics-title"
              className="py-12 md:py-16 bg-[#FFD65A]/10"
            >
              <div className="container mx-auto px-4">
                <h2 id="statistics-title" className="sr-only">
                  Key Statistics
                </h2>
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
                  role="list"
                >
                  {statistics.items.map((stat, index) => (
                    <div
                      key={index}
                      className="text-center p-4"
                      role="listitem"
                      tabIndex={0}
                    >
                      <h3
                        className="text-3xl md:text-4xl font-bold mb-2"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Call to Action Section */}
          {cta && (
            <section
              aria-labelledby="cta-title"
              className="py-12 md:py-16 bg-gradient-to-r from-[#FF9D23] to-[#F93827]"
            >
              <div className="container mx-auto px-4 text-center">
                <h2
                  id="cta-title"
                  className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6"
                >
                  {cta.title}
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                  {cta.subtitle}
                </p>
                <Link
                  to={cta.buttonLink}
                  className="inline-flex items-center gap-2 bg-[#FFD65A] text-gray-800 px-6 py-3 md:px-8 md:py-4 
                         rounded-lg text-base md:text-lg font-medium hover:bg-[#FFD65A]/90 transition-all 
                         duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 
                         focus:ring-[#FFD65A]/50 focus:ring-offset-2"
                  aria-label={`${cta.buttonText} - Get started now`}
                >
                  {cta.buttonText}
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </div>
            </section>
          )}
        </Suspense>
      </main>
    </>
  );
};

export default Home;
