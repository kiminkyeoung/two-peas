import { createRouter, createWebHistory } from 'vue-router'

const SITE_NAME = 'Two Peas'
const IS_DEV = import.meta.env.DEV

// views 폴더의 모든 Vue 파일을 자동으로 가져오기
const modules = import.meta.glob('../views/**/*.vue', { eager: true })

/**
 * 파일 경로를 라우트 경로로 변환
 * @param {string} filePath - 파일 경로 (예: '../views/richplan/BillionCalc.vue')
 * @returns {string} 라우트 경로 (예: '/richplan/billionCalc')
 */
function getRoutePath(filePath) {
  const path = filePath
    .replace('../views/', '')
    .replace(/\.vue$/, '')
  
  const parts = path.split('/')
  const fileName = parts[parts.length - 1]
  const camelFileName = fileName.charAt(0).toLowerCase() + fileName.slice(1)
  parts[parts.length - 1] = camelFileName
  
  return '/' + parts.join('/')
}

/**
 * 파일명을 컴포넌트 이름으로 변환
 * @param {string} filePath - 파일 경로
 * @returns {string} 컴포넌트 이름 (예: 'RichplanBillionCalc')
 */
function getRouteName(filePath) {
  const name = filePath.replace('../views/', '').replace(/\.vue$/, '')
  return name
    .split('/')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, '$1'))
    .join('')
}

// 특수 케이스: 수동으로 정의해야 하는 라우트들 (동적 파라미터, 특정 경로 등)
const manualRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'Twopeace - 사주, 계산기, 그리고 즐거움',
      description: 'Twopeace에 오신 것을 환영합니다! 내 일주 동물 찾기, 재테크 계산기 등 삶에 유용한 정보와 즐거움을 더해주는 다양한 서비스를 만나보세요.',
      keywords: 'twopeace, 사주, 만세력, 계산기, 재테크'
    }
  },
  {
    path: '/ganji/find-my-animal',
    name: 'GanjiFindMyAnimal',
    component: () => import('../views/ganji/FindMyAnimal.vue'),
    meta: {
      title: '나의 일주 동물 찾기 - Two Peas',
      description: '생년월일을 입력하면 나만의 일주 동물을 찾아드립니다. 60가지 간지 동물 중 당신의 일주를 확인해보세요.',
      keywords: '일주 동물, 사주, 만세력, 간지, 60간지, 일주 찾기'
    }
  },
  {
    path: '/result/:id',
    name: 'ResultDetail',
    component: () => import('../views/result/ResultDetail.vue'),
    props: true,
    meta: {
      title: '일주 상세 정보 - Two Peas',
      description: '나만의 일주 동물에 대한 상세한 성격 정보와 특징을 확인해보세요.',
      keywords: '일주 상세, 간지 성격, 일주 분석'
    }
  },
  {
    path: '/coworker/txt',
    name: 'CoworkerTxt',
    component: () => import('../views/coworker/txt.vue'),
    meta: {
      title: '내 업무 도우미 (TXT → CSV) - Two Peas',
      description: 'TXT 파일을 CSV 파일로 변환해드립니다.',
      keywords: 'TXT → CSV, 변환, 텍스트 파일, CSV 파일'
    }
  },
  {
    path: '/richplan/billionCalc',
    name: 'RichplanBillionCalc',
    component: () => import('../views/richplan/BillionCalc.vue'),
    meta: {
      title: '1억 부자 계산기 - Two Peas',
      description: '현재 자본금, 매월 목표 저축 금액, 연 수익률을 입력하면 1억 달성 시기를 알려드립니다. 복리 계산으로 정확한 목표 달성 날짜를 확인해보세요.',
      keywords: '1억 부자, 자본금 계산, 목표 달성, 재테크 계산기, 복리 계산, 저축 계산기, 부자 되기, 재무 계획',
      imageUrl: 'https://twopeas.co.kr/richplan/rich-gril-thumnail.png'
    }
  },
  {
    path: '/richplan/loanCalc',
    name: 'RichplanLoanCalc',
    component: () => import('../views/richplan/loanCalc.vue'),
    meta: {
      title: '대출 상환 계산기 - 원리금균등, 원금균등, 만기일시상환 - Two Peas',
      description: '대출 원금, 이자율, 상환 기간을 입력하면 원리금균등상환, 원금균등상환, 만기일시상환 방식별로 월별 상환액과 총 이자를 계산해드립니다. 차트로 상환 추세를 한눈에 확인하세요.',
      keywords: '대출 계산기, 대출 상환 계산, 원리금균등상환, 원금균등상환, 만기일시상환, 대출 이자 계산, 주택담보대출 계산, 대출 상환액, 월 상환액 계산, 대출 비교',
      imageUrl: 'https://twopeas.co.kr/richplan/loan-thumnail.png'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: 'Twopeace를 소개합니다',
      description: 'Twopeace는 유용한 계산기와 재미로 보는 사주 정보를 제공하여 당신의 삶에 작은 평화와 즐거움을 더해드립니다.',
      keywords: 'twopeace, 소개, about, 사주, 계산기'
    }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('../views/PrivacyPolicy.vue'),
    meta: {
      title: '개인정보처리방침 - Twopeace',
      description: 'Twopeace의 개인정보처리방침입니다. 우리는 사용자의 어떤 정보도 수집하거나 저장하지 않습니다.',
      keywords: '개인정보처리방침, privacy policy, twopeace'
    }
  },
  {
    path: '/what-is-ilju-animal',
    name: 'WhatIsIljuAnimal',
    component: () => import('../views/ganji/WhatIsIljuAnimal.vue'),
    meta: {
      title: '일주 동물이란? - Twopeace',
      description: '나를 상징하는 진짜 동물, 일주 동물에 대해 알아보세요. 사주와 일주, 60간지의 개념을 쉽게 설명해드립니다.',
      keywords: '일주동물, 일주, 사주, 60간지, 간지, 사주팔자'
    }
  },
  {
    path: '/sinsal/analysis',
    name: 'ShinsalAnalysis',
    component: () => import('../views/sinsal/ShinsalAnalysis.vue'),
    meta: {
      title: '내 사주 속 신살 분석 - Twopeace',
      description: '생년월일을 통해 당신의 사주 속 숨겨진 신살을 분석해드립니다.',
      keywords: '신살, 사주, 운명, 분석'
    }
  },
  {
    path: '/sinsal/result',
    name: 'ShinsalResult',
    component: () => import('../views/sinsal/ShinsalResult.vue'),
    meta: {
      title: '신살 분석 결과 - Twopeace',
      description: '당신의 사주 속 신살 분석 결과를 확인하세요.',
      keywords: '신살 결과, 사주 분석, 운명 해석'
    }
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: () => import('../views/blog/BlogList.vue'),
    meta: {
      title: 'Twopeace 블로그 - 사주, 재테크 이야기',
      description: 'Twopeace 블로그에서 사주, 만세력, 재테크 관련 흥미로운 글들을 만나보세요.',
      keywords: '블로그, 사주, 재테크, 만세력, 신살'
    }
  },
  {
    path: '/blog/:slug',
    name: 'ArticleDetail',
    component: () => import('../views/blog/ArticleDetail.vue'),
    props: true,
    meta: {
      title: 'Twopeace 블로그 - 아티클 상세',
      description: 'Twopeace 블로그의 흥미로운 아티클 상세 내용을 확인하세요. 사주, 만세력, 재테크 관련 깊이 있는 정보들을 만나보세요.',
      keywords: '블로그, 아티클, 사주, 재테크, 만세력, 신살'
    }
  }
]

// 자동 생성된 라우트들에 대한 메타 정보 매핑 (수동 라우트 제외)
const autoRouteMetaMap = {
  'result': {
    title: '60일주 동물 도감 - Two Peas',
    description: '60가지 일주 동물을 모두 확인해보세요. 각 일주의 특징과 성격을 알아볼 수 있습니다.',
    keywords: '60일주, 일주 동물, 간지 도감, 사주 동물'
  }
}

// 자동 생성된 라우트들
const manualRoutePaths = new Set(manualRoutes.map(r => r.path))
const manualRouteNames = new Set(manualRoutes.map(r => r.name))

const autoRoutes = Object.keys(modules)
  .map(filePath => {
    const component = modules[filePath].default
    const routePath = getRoutePath(filePath)
    const routeName = getRouteName(filePath)
    
    // 수동 라우트와 겹치지 않는 경우만 처리
    if (manualRoutePaths.has(routePath) || manualRouteNames.has(routeName)) {
      return null
    }
    
    // 메타 정보 찾기
    const metaKey = routePath.replace(/^\//, '')
    const meta = autoRouteMetaMap[metaKey]
    
    return {
      path: routePath,
      name: routeName,
      component: component,
      meta: meta || {
        title: `${routeName} - ${SITE_NAME}`,
        description: '',
        keywords: ''
      }
    }
  })
  .filter(Boolean)

// 최종 라우트: 수동 라우트 + 자동 라우트
const routes = [...manualRoutes, ...autoRoutes]


const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 메타 태그를 업데이트하거나 생성하는 헬퍼 함수
 * @param {string} name - 메타 태그 이름 또는 속성
 * @param {string} content - 메타 태그 내용
 * @param {boolean} isProperty - property 속성 사용 여부 (기본값: false, name 속성 사용)
 */
export function updateMetaTag(name, content, isProperty = false) {
  const attribute = isProperty ? 'property' : 'name'
  let element = document.querySelector(`meta[${attribute}="${name}"]`)
  
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  
  element.setAttribute('content', content)
}

/**
 * Canonical URL을 업데이트하는 헬퍼 함수
 * @param {string} url - Canonical URL
 */
export function updateCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)
}

// 페이지별 메타 태그 동적 업데이트
router.beforeEach((to, from, next) => {
  const currentUrl = window.location.origin + to.path
  const meta = to.meta || {}
  
  // 페이지 타이틀 설정
  const pageTitle = meta.title || SITE_NAME
  document.title = pageTitle
  
  // Primary Meta Tags
  updateMetaTag('title', pageTitle)
  
  if (meta.description) {
    updateMetaTag('description', meta.description)
    updateMetaTag('og:description', meta.description, true)
    updateMetaTag('twitter:description', meta.description, true)
  }
  
  if (meta.keywords) {
    updateMetaTag('keywords', meta.keywords)
  }
  
  // Open Graph / Facebook / Twitter
  if (meta.title) {
    updateMetaTag('og:title', meta.title, true)
    updateMetaTag('twitter:title', meta.title, true)
  }
  
  updateMetaTag('og:url', currentUrl, true)
  updateMetaTag('twitter:url', currentUrl, true)
  updateMetaTag('og:site_name', SITE_NAME, true)
  
  // OG Image 업데이트 (항상 업데이트하여 초기 HTML의 기본 이미지 덮어쓰기)
  const ogImage = meta.imageUrl || 'https://twopeas.co.kr/intro.webp'
  updateMetaTag('og:image', ogImage, true)
  updateMetaTag('og:image:width', '1200', true)
  updateMetaTag('og:image:height', '630', true)
  updateMetaTag('twitter:image', ogImage, true)
  
  // Canonical URL 업데이트
  updateCanonical(currentUrl)
  
  if (IS_DEV && to.path.includes('billionCalc')) {
    console.log('billionCalc 라우트 메타 정보:', {
      path: to.path,
      meta: meta,
      title: document.title,
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    })
  }
  
  next()
})

export default router

