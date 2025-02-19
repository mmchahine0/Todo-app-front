import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  name?: string;
  image?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "A modern task management application",
  canonical = typeof window !== "undefined" ? window.location.href : "",
  type = "website",
  name = "Todo App",
  image = "/og-image.jpg",
}) => {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <Helmet>
      {/* Basic */}
      <title>{title ? `${title} | ${name}` : name}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={name} />
      <meta property="og:title" content={title || name} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${siteUrl}${image}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
};
