export interface NavItem {
  label: string;
  path: string;
  visibility: 'logged-in' | 'logged-out' | 'all' | 'admin';
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

export interface StatisticItem {
  value: string;
  label: string;
  color: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface FeaturesContent {
  title: string;
  items: FeatureItem[];
}

export interface StatisticsContent {
  items: StatisticItem[];
}

export interface CtaContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface FooterContent {
  companyName: string;
  description: string;
  links: NavItem[];
}

export interface SiteContent {
  navbar: NavItem[];
  hero: HeroContent;
  features: FeaturesContent;
  statistics: StatisticsContent;
  cta: CtaContent;
  footer: FooterContent;
}

export interface ContentResponse {
  statusCode: number;
  message: string;
  data: SiteContent;
}

export interface PageContent {
  id: string;
  type: string;
  content: object;
  pageId: string;
  updatedAt: Date;
}

export interface Props {
  pageId: string;
}

export interface DeleteConfirmState {
  isOpen: boolean;
  type: "nav" | "hero" | "footer" | "feature" | "statistic" | null;
  index: number;
  itemLabel: string;
}

export interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface LocalContentState {
  navItems: NavItem[];
  heroContent: HeroContent;
  featuresContent: FeaturesContent;
  statisticsContent: StatisticsContent;
  ctaContent: CtaContent;
  footerContent: FooterContent;
}