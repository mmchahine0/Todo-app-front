import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getContent } from "../admin/adminHomeEditLayout/AdminLayout.services";
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import home from "../../assets/home.png";

const Home: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: () => getContent(""),
  });

  const features = [
    {
      title: "Easy Task Management",
      description: "Experience seamless integration with our powerful tools.",
      icon: CheckCircle,
    },
    {
      title: "Real-time Updates",
      description: "Stay organized with our intuitive task management system.",
      icon: Clock,
    },
    {
      title: "Priority Alerts",
      description: "Never miss important deadlines with smart notifications.",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative flex items-center min-h-[600px]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#16C47F]/40 via-[#FFD65A]/40 to-[#FF9D23]/40" />
        <img
          src={home}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />

        {/* Content */}
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in text-black">
            {data?.data.hero.title ?? "Welcome to Our Platform"}
          </h1>
          <p className="text-xl md:text-2xl text-black/90 mb-8 max-w-2xl mx-auto">
            {data?.data.hero.subtitle ??
              "Discover the power of seamless collaboration"}
          </p>
          <Link
            to={data?.data.hero.buttonLink ?? "#"}
            className="inline-flex items-center gap-2 bg-[#FFD65A] text-gray-800 px-8 py-4 rounded-lg text-lg font-medium 
                     hover:bg-[#FFD65A]/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {data?.data.hero.buttonText ?? "Get Started"}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  borderLeft: `4px solid`,
                }}
              >
                <feature.icon className="w-10 h-10 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section - New! */}
      <section className="py-16 bg-[#FFD65A]/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-[#16C47F] text-4xl font-bold mb-2">1000+</h3>
              <p className="text-gray-600">Tasks Completed</p>
            </div>
            <div className="text-center">
              <h3 className="text-[#FFD65A] text-4xl font-bold mb-2">24/7</h3>
              <p className="text-gray-600">Support Available</p>
            </div>
            <div className="text-center">
              <h3 className="text-[#FF9D23] text-4xl font-bold mb-2">99%</h3>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <h3 className="text-[#F93827] text-4xl font-bold mb-2">50+</h3>
              <p className="text-gray-600">Active Teams</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-[#FF9D23] to-[#F93827]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying our platform
          </p>
          <Link
            to={data?.data.hero.buttonLink ?? "#"}
            className="inline-flex items-center gap-2 bg-[#FFD65A] text-gray-800 px-8 py-4 rounded-lg text-lg font-medium 
                     hover:bg-[#FFD65A]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {data?.data.hero.buttonText ?? "Join Now"}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD65A] border-t-[#16C47F]"></div>
        </div>
      )}
    </div>
  );
};

export default Home;
