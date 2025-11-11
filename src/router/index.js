import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Result from '../views/Result.vue'
import ResultDetail from '../views/result/ResultDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: '나의 일주 동물 찾기 - Two Peas',
        description: '생년월일을 입력하면 나만의 일주 동물을 찾아드립니다. 60가지 간지 동물 중 당신의 일주를 확인해보세요.',
        keywords: '일주 동물, 사주, 만세력, 간지, 60간지, 일주 찾기'
      }
    },
    {
      path: '/result',
      name: 'Result',
      component: Result,
      meta: {
        title: '60일주 동물 도감 - Two Peas',
        description: '60가지 일주 동물을 모두 확인해보세요. 각 일주의 특징과 성격을 알아볼 수 있습니다.',
        keywords: '60일주, 일주 동물, 간지 도감, 사주 동물'
      }
    },
    {
      path: '/result/:id',
      name: 'ResultDetail',
      component: ResultDetail,
      props: true,
      meta: {
        title: '일주 상세 정보 - Two Peas',
        description: '일주의 상세한 성격 정보와 특징을 확인해보세요.',
        keywords: '일주 상세, 간지 성격, 일주 분석'
      }
    }
  ]
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

