import { createRouter, createWebHistory } from 'vue-router'

// views 폴더의 모든 Vue 파일을 자동으로 가져오기
const modules = import.meta.glob('../views/**/*.vue', { eager: true })

// 파일 경로를 라우트 경로로 변환하는 함수
function getRoutePath(filePath) {
  // ../views/ 제거
  let path = filePath.replace('../views/', '')
  // .vue 제거
  path = path.replace(/\.vue$/, '')
  
  // 파일명을 camelCase 유지하거나 kebab-case로 변환 (선택 가능)
  const parts = path.split('/')
  const fileName = parts[parts.length - 1]
  
  // 첫 글자를 소문자로 변환 (camelCase 유지)
  const camelFileName = fileName.charAt(0).toLowerCase() + fileName.slice(1)
  parts[parts.length - 1] = camelFileName
  
  // 경로 조합
  return '/' + parts.join('/')
}

// 파일명을 컴포넌트 이름으로 변환하는 함수
function getRouteName(filePath) {
  let name = filePath.replace('../views/', '').replace(/\.vue$/, '')
  const parts = name.split('/')
  // 각 부분을 PascalCase로 변환
  return parts.map(part => {
    // 첫 글자를 대문자로, 나머지는 소문자로
    return part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, '$1')
  }).join('')
}

// 자동 생성된 라우트들
const autoRoutes = Object.keys(modules).map(filePath => {
  const component = modules[filePath].default
  const routePath = getRoutePath(filePath)
  const routeName = getRouteName(filePath)
  
  // 디버깅용 로그
  if (filePath.includes('billion') || filePath.includes('Billion')) {
    console.log('라우트 생성:', { filePath, routePath, routeName, component })
  }
  
  return {
    path: routePath,
    name: routeName,
    component: component
  }
})

// 특수 케이스: 수동으로 정의해야 하는 라우트들 (동적 파라미터, 특정 경로 등)
const manualRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
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
      description: '일주의 상세한 성격 정보와 특징을 확인해보세요.',
      keywords: '일주 상세, 간지 성격, 일주 분석'
    }
  }
]

// 메타 정보 매핑 (파일 경로 기반)
const metaMap = {
  'result': {
    title: '60일주 동물 도감 - Two Peas',
    description: '60가지 일주 동물을 모두 확인해보세요. 각 일주의 특징과 성격을 알아볼 수 있습니다.',
    keywords: '60일주, 일주 동물, 간지 도감, 사주 동물'
  },
  'coworker/txt': {
    title: '내 업무 도우미 (TXT → CSV) - Two Peas',
    description: 'TXT 파일을 CSV 파일로 변환해드립니다.',
    keywords: 'TXT → CSV, 변환, 텍스트 파일, CSV 파일'
  },
  'richplan/billionCalc': {
    title: '1억 부자 계산기 - Two Peas',
    description: '현재 자본금, 매월 목표 저축 금액, 연 수익률을 입력하면 1억 달성 시기를 알려드립니다. 복리 계산으로 정확한 목표 달성 날짜를 확인해보세요.',
    keywords: '1억 부자, 자본금 계산, 목표 달성, 재테크 계산기, 복리 계산, 저축 계산기, 부자 되기, 재무 계획',
    imageUrl: 'https://twopeas.co.kr/richplan/rich-gril-thumnail.png'
  }
}

// 자동 라우트에 메타 정보 추가
const routesWithMeta = autoRoutes.map(route => {
  // 수동 라우트와 경로가 겹치지 않는 경우만 처리
  const isManualRoute = manualRoutes.some(mr => mr.path === route.path || mr.name === route.name)
  if (isManualRoute) return null
  
  // 메타 정보 찾기
  const metaKey = route.path.replace(/^\//, '')
  const meta = metaMap[metaKey]
  
  return {
    ...route,
    meta: meta || {
      title: `${route.name} - Two Peas`,
      description: '',
      keywords: ''
    }
  }
}).filter(Boolean)

// 최종 라우트: 수동 라우트 + 자동 라우트
const routes = [...manualRoutes, ...routesWithMeta]

// 디버깅: 생성된 라우트 확인
console.log('생성된 라우트 목록:', routes.map(r => ({ path: r.path, name: r.name })))

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 페이지별 메타 태그 동적 업데이트
router.beforeEach((to, from, next) => {
  // 기본 사이트명
  const siteName = 'Two Peas'
  
  // 페이지별 타이틀 설정
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = siteName
  }
  
  // 메타 태그 업데이트 함수
  const updateMetaTag = (name, content, isProperty = false) => {
    const attribute = isProperty ? 'property' : 'name'
    let element = document.querySelector(`meta[${attribute}="${name}"]`)
    
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, name)
      document.head.appendChild(element)
    }
    
    element.setAttribute('content', content)
  }
  
  // Description 업데이트
  if (to.meta.description) {
    updateMetaTag('description', to.meta.description)
    updateMetaTag('og:description', to.meta.description, true)
    updateMetaTag('twitter:description', to.meta.description, true)
  }
  
  // Keywords 업데이트
  if (to.meta.keywords) {
    updateMetaTag('keywords', to.meta.keywords)
  }
  
  // OG Title 업데이트
  if (to.meta.title) {
    updateMetaTag('og:title', to.meta.title, true)
    updateMetaTag('twitter:title', to.meta.title, true)
  }
  
  // OG URL 업데이트
  const currentUrl = window.location.origin + to.path
  updateMetaTag('og:url', currentUrl, true)
  updateMetaTag('twitter:url', currentUrl, true)
  
  // OG Image 업데이트
  if (to.meta.imageUrl) {
    updateMetaTag('og:image', to.meta.imageUrl, true)
    updateMetaTag('og:image:width', '1200', true)
    updateMetaTag('og:image:height', '630', true)
    updateMetaTag('twitter:image', to.meta.imageUrl, true)
  }
  
  // Canonical URL 업데이트
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', currentUrl)
  
  next()
})

export default router

