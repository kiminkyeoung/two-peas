import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// scripts 폴더에서 한 단계 위로 올라가서 프로젝트 루트의 dist 폴더 찾기
const distDir = path.join(__dirname, '..', 'dist')
const indexHtmlPath = path.join(distDir, 'index.html')

// index.html 읽기
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8')

// result 디렉토리 생성
const resultDir = path.join(distDir, 'result')
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir, { recursive: true })
}

// 각 결과 페이지(1-60)에 대한 HTML 생성
for (let i = 1; i <= 60; i++) {
  const ganjiImageUrl = `https://twopeas.co.kr/ganji/${i}.webp`
  const pageUrl = `https://twopeas.co.kr/result/${i}`
  
  // 메타 태그를 동적으로 교체 (더 정확한 정규식 사용)
  let html = indexHtml
    .replace(
      /<title>.*?<\/title>/s,
      `<title>일주 상세 정보 - Two Peas</title>`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${pageUrl}">`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="일주 상세 정보 - Two Peas">`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="일주의 상세한 성격 정보와 특징을 확인해보세요.">`
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${ganjiImageUrl}">`
    )
    .replace(
      /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="twitter:url" content="${pageUrl}">`
    )
    .replace(
      /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="twitter:title" content="일주 상세 정보 - Two Peas">`
    )
    .replace(
      /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="twitter:description" content="일주의 상세한 성격 정보와 특징을 확인해보세요.">`
    )
    .replace(
      /<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="twitter:image" content="${ganjiImageUrl}">`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${pageUrl}">`
    )
  
  // og:image:width와 og:image:height 추가 (없으면 추가)
  if (!html.includes('og:image:width')) {
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${ganjiImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="1200">`
    )
  }
  
  // HTML 파일 저장
  const filePath = path.join(resultDir, `${i}.html`)
  fs.writeFileSync(filePath, html)
}

console.log('✅ Generated 60 static HTML files for result pages')

