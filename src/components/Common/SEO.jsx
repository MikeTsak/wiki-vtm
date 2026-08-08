import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, image, article, noindex }) => {
  const defaultTitle = 'Erebus Wiki';
  const defaultDescription = 'The definitive encyclopedia for the Chronicle of Erebus. A dark gothic Vampire LARP universe.';
  const defaultImage = '/logo.png'; // Assuming there's a logo or placeholder
  
  const seo = {
    title: title ? `${title} - ${defaultTitle}` : defaultTitle,
    description: description || defaultDescription,
    image: image || defaultImage,
    url: url || window.location.href,
  };

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph tags for Facebook, LinkedIn, etc. */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      
      {/* Twitter cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
};

export default SEO;
