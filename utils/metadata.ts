import { Metadata } from "next";
import { MetaTagType, SeoType } from "../lib";
import { resolveImage } from "./resolveImage";

export const buildMetadata = (seo: SeoType): Metadata => {
  const { metaTitle, metaDescription, openGraph, twitter } = seo || {};
  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: openGraph?.title,
      description: openGraph?.description,
      siteName: openGraph?.siteName,
      url: openGraph?.url,
      images: [{ url: resolveImage(openGraph?.image) }],
    },
    twitter: {
      creator: twitter?.creator,
      site: twitter?.site,
      card: "summary",
    },
    other: {},
  };
};

export const addAdditionalMetaTags = (metadata: Metadata, additionalMetaTags: MetaTagType[]): void => {
  if (!additionalMetaTags?.length) return;

  additionalMetaTags?.forEach(({ metaAttributes }) => {
    if (!metaAttributes || metaAttributes?.length < 2) return;

    const property = metaAttributes?.find(attr => attr?.attributeKey === "property");
    const content = metaAttributes?.find(attr => attr?.attributeKey === "content");

    const propertyKey = property?.attributeValueString;
    const contentValue = content?.attributeValueString || resolveImage(content?.attributeValueImage);

    metadata.other = metadata?.other || {}
    if (propertyKey) {
      metadata.other[propertyKey] = contentValue || metadata.other[propertyKey];
    }
  });
};
