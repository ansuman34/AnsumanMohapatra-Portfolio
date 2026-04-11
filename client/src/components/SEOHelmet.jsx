import { Helmet } from 'react-helmet-async';

export default function SEOHelmet({ title, description, keywords = [], canonical }) {
  return (
    <Helmet>
      <title>{title || 'Ansuman Mohapatra | MERN Stack Developer'}</title>
      <meta name="description" content={description || 'MERN Stack Developer from Bhubaneswar, India. Portfolio of scalable web apps and AI projects.'} />
      <meta name="keywords" content={(keywords.length ? keywords : ['full stack developer', 'MERN', 'React', 'Node.js', 'portfolio', 'Bhubaneswar']).join(', ')} />
      {canonical && <link rel="canonical" href={canonical} />}
      {/* OG */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
