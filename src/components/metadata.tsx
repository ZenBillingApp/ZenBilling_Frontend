// src/components/Metadata.tsx
import { Metadata } from "next";

export const metadata: (
  title: string,
  description: string,
  keywords: string,
  openGraph: {
    title: string;
    description: string;
    type: string;
    locale: string;
    url: string;
    siteName: string;
  }
) => Metadata = (title, description, keywords, openGraph) => ({
  title: title,
  description: description,
  keywords: keywords,
  openGraph: {
    title: openGraph.title,
    description: openGraph.description,
    url: openGraph.url,
    type: openGraph.type,
    locale: openGraph.locale,
    siteName: openGraph.siteName,
  },
});

export default metadata;
