# sanity-plugin-seo

> This is a **Sanity Studio v3** plugin.

# What it is

The `sanity-plugin-seo` Plugin is designed to simplify the process of generating SEO fields for various types of content. This plugin is particularly useful for enhancing the structured data of your content, making it more accessible and understandable for search engines. By integrating seamlessly with Sanity Studio, it provides an easy way to add and configure SEO fields within your document schemas, ensuring your content is fully optimized for search visibility.

![Alt Text](https://github.com/bhargavpatelinfo/sanity-seo-plugin/blob/main/public/assets/demo-1.gif)

## Key Features

- **Customizable SEO Fields:** Easily add and configure essential SEO fields such as title, description, keywords, and more within your document schemas.

- **Sanity Studio Integration:** Effortlessly incorporate SEO field creation into your Sanity Studio workflow, ensuring that SEO optimization becomes an integral part of your content development process.

- **Compatibility:** Fully compatible with Sanity v3 and integrates seamlessly with your existing schemas and plugins.

## Installation

To get started, install the plugin using npm:

```sh
npm install sanity-plugin-seo
```

## Usage in Sanity Studio

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import { defineConfig } from 'sanity';
import { seoMetaFields } from 'sanity-plugin-seo';

export default defineConfig({
  plugins: [seoMetaFields()]
});
```

You can then add the `schemaMarkup` field to any Sanity Document you want it to be in.

```javascript
const myDocument = {
  type: 'page',
  name: 'page',
  fields: [
    {
      title: 'Seo',
      name: 'seo',
      type: 'seoMetaFields'
    }
  ],
  preview: {
    select: {
      metaTitle: 'seo'
    },
    prepare(selection) {
      const { metaTitle } = selection?.metaTitle || '';
      return {
        title: metaTitle || 'seo',
      };
    }
  }
};
```

## License

MIT




For nextjs with app router sanity Compitaible


```javascript

const groqQuery = groq`*[_type == "page"]{
_type,
"slug":slug.current,
${seo},
}`;

export const seo = /* groq */ `seo{
${seofields}  
}`;

export const seofields = /* groq */ `
_type,
metaTitle,
nofollowAttributes,
seoKeywords,
metaDescription,
openGraph{
${openGraphQuery}
},
twitter{
${twitterQuery}
},
additionalMetaTags[]{
_type,
metaAttributes[]{
${metaAttributesQuery}     
}
}
`;

export const twitterQuery = /* groq */ `
_type,
site,
creator,
cardType,
handle
`


export const openGraphQuery = /* groq */ `
_type,
siteName,
url,
description,
title,
image{
${imageFields}
}
`

export const metaAttributesQuery = /* groq */ `
_type,
attributeValueString,
attributeType,
attributeKey,
attributeValueImage{
${imageFields}
}
`

export const imageFields = /* groq */ `
_type,
crop{
_type,
right,
top,
left,
bottom
},
hotspot{
_type,
x,
y,
height,
width,
},
asset->{...}
`


```
```javascript
//here is Type



export type SeoType = {
  _type?: "seo";
  nofollowAttributes?: boolean
  metaDescription?: string;
  additionalMetaTags?: MetaTagType[];
  metaTitle?: string;
  seoKeywords?: string[]
  openGraph?: OpenGraphType;
  twitter?: Twitter;
};

export type MetaTagType = {
  _type: "metaTag";
  metaAttributes?: MetaAttributeType[];
};

export type MetaAttributeType = {
  _type: "metaAttribute";
  attributeKey?: string;
  attributeType?: string;
  attributeValueString?: string;
  attributeValueImage?: CustomImageType;
};


export type OpenGraphType = {
  _type: "openGraph";
  title: string;
  url?: string
  siteName?: string
  description: string;
  image: CustomImageType;
};

export type Twitter = {
  _type: "twitter";
  handle?: string;
  creator?: string
  site?: string;
  cardType?: string;
};

export type CustomImageType = {
  _type: "customImage";
  asset?: SanityImageAssetType;
  crop?: {
    _type: "SanityImageCrop";
    right: number;
    top: number;
    left: number;
    bottom: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    _type: "SanityImageHotspot";
    width?: number;
  };
};

export type SanityImageAssetType = {
  _type?: "SanityImageAsset";
  _id?: string;
  path?: string;
  url?: string;
  metadata?: {
    _type?: "SanityImageMetadata";
    dimensions?: {
      _type?: "SanityImageDimensions";
      height?: number;
      width?: number;
    };
  };
};

```

```javascript

// /utils/resolveImage.ts

import { CustomImageType } from "../lib";

export const resolveImage = (image?: CustomImageType) => {
  return image?.asset?.url ?? "";
};

// /utils/metadata.ts

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

// /app/page.tsx

import { groq } from "next-sanity";
import Image from "next/image";
import { seo, SeoType } from "../../lib";
import { client } from "../../sanity/lib/client";
import { Metadata } from "next";
import { addAdditionalMetaTags, buildMetadata } from "../../utils/metadata";

const postGroqQuery = groq`*[_type == "post"]{
  _type,
  "slug":slug.current,
  ${seo},
  }`;

export type PageType = {
  slug: string;
  seo: SeoType;
};

export interface PageProps {
  page: PageType;
}

const fetchPageData = async () => {
  const pageData = await client.fetch<PageType[]>(postGroqQuery);
  const [pageSingleItem] = pageData;
  const page = pageSingleItem;
  return page;
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageData();
  const seo = page?.seo;

  const metadata = buildMetadata(seo);
  addAdditionalMetaTags(metadata, seo?.additionalMetaTags || []);

  return metadata;
}

export default async function Home() {
  return (
    <div>
      Your Home Page Content Goes Here.
    </div>
  )
}

```
```
<!-- here is the example of ENV -->
 
NEXT_PUBLIC_APP_URL="https://www.example.com"
NEXT_PUBLIC_SANITY_PROJECT_ID=""
NEXT_PUBLIC_SANITY_DATASET=""
