import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { routeMetaMap, dynamicRouteMetaMap } from './route-meta.js';
import blogArticles from '../src/data/blogArticles.json' assert { type: 'json' }; // 블로그 아티클 데이터 임포트

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const BASE_URL = 'https://twopeas.co.kr'; // 실제 도메인으로 변경하세요.

function generateSitemap() {
  const urls = [];

  // 1. 정적 라우트 추가
  for (const routePath in routeMetaMap) {
    urls.push({
      loc: `${BASE_URL}${routePath}`,
      lastmod: new Date().toISOString().split('T')[0], // 현재 날짜
      changefreq: 'weekly',
      priority: routePath === '/' ? '1.0' : '0.8',
    });
  }

  // 2. 동적 라우트 추가 (/result/:id)
  if (dynamicRouteMetaMap['/result/:id']) {
    for (let i = 1; i <= 60; i++) {
      urls.push({
        loc: `${BASE_URL}/result/${i}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
  }

  // 3. 동적 블로그 아티클 라우트 추가 (/blog/:slug)
  blogArticles.forEach(article => {
    urls.push({
      loc: `${BASE_URL}/blog/${article.slug}`,
      lastmod: article.date, // 블로그 아티클의 게시 날짜 사용
      changefreq: 'monthly',
      priority: '0.9',
    });
  });

  // XML 구조 생성
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  // 파일에 쓰기
  try {
    fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
    console.log(`✅ sitemap.xml 생성 완료: ${SITEMAP_PATH}`);
    console.log(`총 ${urls.length}개의 URL이 사이트맵에 포함되었습니다.`);
  } catch (error) {
    console.error(`❌ sitemap.xml 생성 중 오류 발생:`, error);
  }
}

generateSitemap();
