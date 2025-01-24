export interface NavItem {
  label: string;
  path: string;
  visibility: 'logged-in' | 'logged-out' | 'all';
}

export interface HeroContent {
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
  footer: FooterContent;
}

export interface ContentResponse {
  statusCode: number;
  message: string;
  data: SiteContent;
}
