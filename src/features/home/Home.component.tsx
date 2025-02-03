import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getContent } from "../admin/adminHomeEditLayout/AdminLayout.services";
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { SiteContent } from "../admin/adminHomeEditLayout/AdminLayout.types";
import home from "../../assets/home.png";

const iconMap = {
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight
} as const;

const Home: React.FC = () => {
  const { data: contentResponse, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => getContent(""),
    select: (response) => ({
      hero: response.data.hero,
      features: response.data.features,
      statistics: response.data.statistics,
      cta: response.data.cta
    } as Partial<SiteContent>)
  });

  if (isLoading || !contentResponse) {
    return (
      <div className="fixed inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD65A] border-t-[#16C47F]"></div>
      </div>
    );
  }
 
  const { hero, features, statistics, cta } = contentResponse;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      {hero && (
        <section className="relative flex items-center min-h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#16C47F]/40 via-[#FFD65A]/40 to-[#FF9D23]/40" />
          <img
            src={home}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
          <div className="relative container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in text-black">
              {hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-black/90 mb-8 max-w-2xl mx-auto">
              {hero.subtitle}
            </p>
            <Link
              to={hero.buttonLink}
              className="inline-flex items-center gap-2 bg-[#FFD65A] text-gray-800 px-8 py-4 rounded-lg text-lg font-medium 
                       hover:bg-[#FFD65A]/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {hero.buttonText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Features Section */}
      {features && features.items && features.items.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
              {features.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.items.map((feature, index) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || CheckCircle;
                return (
                  <div
                    key={index}
                    className="p-8 rounded-xl transition-all duration-200 hover:scale-105"
                    style={{
                      borderLeft: '4px solid #16C47F'
                    }}
                  >
                    <IconComponent className="w-10 h-10 mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Statistics Section */}
      {statistics && statistics.items && statistics.items.length > 0 && (
        <section className="py-16 bg-[#FFD65A]/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {statistics.items.map((stat, index) => (
                <div key={index} className="text-center">
                  <h3 
                    className="text-4xl font-bold mb-2" 
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      {cta && (
        <section className="py-16 bg-gradient-to-r from-[#FF9D23] to-[#F93827]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              {cta.title}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {cta.subtitle}
            </p>
            <Link
              to={cta.buttonLink}
              className="inline-flex items-center gap-2 bg-[#FFD65A] text-gray-800 px-8 py-4 rounded-lg text-lg font-medium 
                       hover:bg-[#FFD65A]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {cta.buttonText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;