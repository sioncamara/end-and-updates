import { Metadata } from 'next'

interface ArticleMetadata {
  title: string
  description: string
  date?: string
  author?: string
  slug: string
  // New optional parameters for custom OG images
  ogImageType?: 'default' | 'math' | 'code' | 'philosophy'
  customFormula?: string
  highlightConcept?: string
  customImage?: string // For completely custom static images
}

export function generateArticleMetadata({
  title,
  description,
  date,
  author = 'Sion Wilks',
  slug,
  ogImageType = 'default',
  customFormula,
  highlightConcept,
  customImage,
}: ArticleMetadata): Metadata {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/writings/${slug}`
  
  // Use custom static image if provided
  if (customImage) {
    const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${customImage}`
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: date,
        authors: [author],
        url,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    }
  }

  // Build dynamic OG image URL with parameters
  const ogParams = new URLSearchParams({
    title: title,
    description: description,
    type: ogImageType,
  })

  if (customFormula) {
    ogParams.set('formula', customFormula)
  }
  
  if (highlightConcept) {
    ogParams.set('concept', highlightConcept)
  }

  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?${ogParams.toString()}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: date,
      authors: [author],
      url,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}
