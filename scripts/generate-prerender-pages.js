import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { routeMetaMap, dynamicRouteMetaMap } from './route-meta.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, '..', 'dist')
const indexHtmlPath = path.join(distDir, 'index.html')
const sourceIndexHtmlPath = path.join(__dirname, '..', 'index.html')

if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ dist/index.html을 찾을 수 없습니다. 먼저 빌드를 실행해주세요.')
  process.exit(1)
}

if (!fs.existsSync(sourceIndexHtmlPath)) {
  console.error('❌ index.html을 찾을 수 없습니다.')
  process.exit(1)
}

// 원본 index.html에서 메타 태그 템플릿 가져오기
const sourceIndexHtml = fs.readFileSync(sourceIndexHtmlPath, 'utf8')
// 빌드된 index.html 가져오기 (스크립트/스타일 링크 포함)
const builtIndexHtml = fs.readFileSync(indexHtmlPath, 'utf8')

const BASE_URL = 'https://twopeas.co.kr'
const DEFAULT_IMAGE = 'https://twopeas.co.kr/intro.webp'

/**
 * 메타 태그를 교체하는 함수
 */
function replaceMetaTags(html, routePath, meta) {
  const pageUrl = `${BASE_URL}${routePath}`
  const ogImage = meta.imageUrl || DEFAULT_IMAGE
  
  // 빌드된 HTML에서 head 부분 찾기
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/)
  if (!headMatch) {
    console.warn(`⚠️  ${routePath}: head 태그를 찾을 수 없습니다.`)
    return html
  }
  
  let headContent = headMatch[1]
  
  // Title 교체 (먼저 처리)
  headContent = headContent.replace(/<title>.*?<\/title>/s, `<title>${meta.title}</title>`)
  
  // 기존 메타 태그 제거 (있을 경우)
  headContent = headContent.replace(/<meta\s+name="title"[^>]*>/gi, '')
  headContent = headContent.replace(/<meta\s+name="description"[^>]*>/gi, '')
  headContent = headContent.replace(/<meta\s+name="keywords"[^>]*>/gi, '')
  headContent = headContent.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
  headContent = headContent.replace(/<meta\s+property="twitter:[^"]*"[^>]*>/gi, '')
  headContent = headContent.replace(/<link\s+rel="canonical"[^>]*>/gi, '')
  
  // 메타 태그 추가 (viewport 다음에 삽입)
  const metaTags = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${meta.title}">
    ${meta.description ? `<meta name="description" content="${meta.description}">` : ''}
    ${meta.keywords ? `<meta name="keywords" content="${meta.keywords}">` : ''}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${meta.title}">
    ${meta.description ? `<meta property="og:description" content="${meta.description}">` : ''}
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:site_name" content="Two Peas">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${pageUrl}">
    <meta property="twitter:title" content="${meta.title}">
    ${meta.description ? `<meta property="twitter:description" content="${meta.description}">` : ''}
    <meta property="twitter:image" content="${ogImage}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${pageUrl}">`
  
  // viewport 메타 태그 다음에 삽입
  headContent = headContent.replace(
    /(<meta\s+name="viewport"[^>]*>)/,
    `$1${metaTags}`
  )
  
  let result = html.replace(/<head>[\s\S]*?<\/head>/, `<head>${headContent}</head>`)
  
  // Title
  result = result.replace(
    /<title>.*?<\/title>/s,
    `<title>${meta.title}</title>`
  )
  
  // Primary Meta Tags
  result = result.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="title" content="${meta.title}">`
  )
  
  if (meta.description) {
    result = result.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${meta.description}">`
    )
  }
  
  if (meta.keywords) {
    result = result.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/,
      `<meta name="keywords" content="${meta.keywords}">`
    )
  }
  
  // Open Graph Tags
  result = result.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${pageUrl}">`
  )
  
  result = result.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${meta.title}">`
  )
  
  if (meta.description) {
    result = result.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${meta.description}">`
    )
  }
  
  result = result.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${ogImage}">`
  )
  
  // Twitter Tags
  result = result.replace(
    /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:url" content="${pageUrl}">`
  )
  
  result = result.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:title" content="${meta.title}">`
  )
  
  if (meta.description) {
    result = result.replace(
      /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="twitter:description" content="${meta.description}">`
    )
  }
  
  result = result.replace(
    /<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:image" content="${ogImage}">`
  )
  
  // Canonical URL
  result = result.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${pageUrl}">`
  )
  
  return result
}

/**
 * 정적 라우트에 대한 HTML 생성
 */
function generateStaticRoutes() {
  console.log('📄 정적 라우트 사전 렌더링 시작...')
  
  for (const [routePath, meta] of Object.entries(routeMetaMap)) {
    // 루트 경로는 index.html 그대로 사용
    if (routePath === '/') {
      const html = replaceMetaTags(builtIndexHtml, routePath, meta)
      fs.writeFileSync(indexHtmlPath, html)
      console.log(`  ✅ ${routePath} → index.html`)
      continue
    }
    
    // 하위 경로는 폴더 구조 생성 (Netlify가 자동으로 index.html을 서빙하도록)
    const pathParts = routePath.split('/').filter(Boolean)
    const dirPath = path.join(distDir, ...pathParts)
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    
    // 각 폴더에 index.html 생성 (Netlify가 자동으로 서빙)
    const html = replaceMetaTags(builtIndexHtml, routePath, meta)
    const filePath = path.join(dirPath, 'index.html')
    fs.writeFileSync(filePath, html)
    console.log(`  ✅ ${routePath} → ${filePath.replace(distDir, '')}`)
  }
}

/**
 * 동적 라우트에 대한 HTML 생성
 */
function generateDynamicRoutes() {
  console.log('📄 동적 라우트 사전 렌더링 시작...')
  
  // /result/:id 라우트 처리
  if (dynamicRouteMetaMap['/result/:id']) {
    const metaTemplate = dynamicRouteMetaMap['/result/:id']
    const resultDir = path.join(distDir, 'result')
    
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true })
    }
    
    // 1-60까지 생성
    for (let i = 1; i <= 60; i++) {
      const routePath = `/result/${i}`
      const meta = {
        ...metaTemplate,
        imageUrl: metaTemplate.getImageUrl ? metaTemplate.getImageUrl(i) : DEFAULT_IMAGE
      }
      
      const html = replaceMetaTags(builtIndexHtml, routePath, meta)
      const filePath = path.join(resultDir, `${i}.html`)
      fs.writeFileSync(filePath, html)
    }
    
    console.log(`  ✅ /result/:id → result/1.html ~ result/60.html (60개 파일)`)
  }
}

/**
 * _redirects 파일 생성 (정적 파일이 있는 경로는 리다이렉트 제외)
 */
function generateRedirectsFile() {
  console.log('📄 _redirects 파일 생성 시작...')
  
  const redirectsPath = path.join(distDir, '_redirects')
  const redirects = []
  
  // 정적 파일이 있는 경로 목록 수집
  const staticPaths = new Set()
  
  // 정적 라우트 경로 추가
  for (const routePath of Object.keys(routeMetaMap)) {
    if (routePath === '/') {
      continue // 루트는 제외
    }
    // /richplan/billionCalc -> /richplan/billionCalc/*
    staticPaths.add(`${routePath}/*`)
  }
  
  // 동적 라우트 경로 추가
  if (dynamicRouteMetaMap['/result/:id']) {
    // /result/1 ~ /result/60은 정적 파일로 존재
    for (let i = 1; i <= 60; i++) {
      staticPaths.add(`/result/${i}`)
    }
  }
  
  // 정적 파일이 없는 경로만 리다이렉트
  redirects.push('# 정적 파일이 있는 경로는 자동으로 서빙됨')
  redirects.push('# 나머지 경로는 SPA 라우팅을 위해 index.html로 리다이렉트')
  redirects.push('/*    /index.html   200')
  
  fs.writeFileSync(redirectsPath, redirects.join('\n'))
  console.log(`  ✅ _redirects 파일 생성 완료`)
}

// 메인 실행
try {
  generateStaticRoutes()
  generateDynamicRoutes()
  generateRedirectsFile()
  console.log('\n✅ 사전 렌더링 완료!')
} catch (error) {
  console.error('❌ 사전 렌더링 중 오류 발생:', error)
  process.exit(1)
}

