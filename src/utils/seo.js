export function setSeoMeta({
  title,
  description,
  keywords,
  url,
  imageUrl,
  siteName = 'Two Peas',
  type = 'website',
  twitterCard = 'summary_large_image',
  imageWidth = '1200',
  imageHeight = '630',
} = {}) {
  const updateMetaTag = (name, content, isProperty = false) => {
    if (!content) return
    const attribute = isProperty ? 'property' : 'name'
    let element = document.querySelector(`meta[${attribute}="${name}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, name)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  if (title) {
    document.title = title
    updateMetaTag('title', title)
  }

  if (description) {
    updateMetaTag('description', description)
  }

  if (keywords) {
    updateMetaTag('keywords', keywords)
  }

  // Open Graph
  updateMetaTag('og:type', type, true)
  if (url) updateMetaTag('og:url', url, true)
  if (title) updateMetaTag('og:title', title, true)
  if (description) updateMetaTag('og:description', description, true)
  if (imageUrl) {
    updateMetaTag('og:image', imageUrl, true)
    updateMetaTag('og:image:width', imageWidth, true)
    updateMetaTag('og:image:height', imageHeight, true)
  }
  updateMetaTag('og:site_name', siteName, true)

  // Twitter
  updateMetaTag('twitter:card', twitterCard, true)
  if (url) updateMetaTag('twitter:url', url, true)
  if (title) updateMetaTag('twitter:title', title, true)
  if (description) updateMetaTag('twitter:description', description, true)
  if (imageUrl) updateMetaTag('twitter:image', imageUrl, true)

  // Canonical
  if (url) {
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }
}





