<template>
  <div id="app-wrapper">
    <nav-bar />
    <main class="main-content">
      <router-view />
    </main>
    <app-footer />
  </div>
</template>

<script>
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    AppFooter
  },
  setup() {
    const route = useRoute()

    /**
     * 구조화된 데이터 (JSON-LD) 추가/업데이트
     * 라우트 변경 시 동적으로 업데이트하여 SEO 최적화
     */
    const updateStructuredData = () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]')
      if (existingScript) {
        existingScript.remove()
      }

      const meta = route.meta || {}
      const currentUrl = window.location.origin + route.path

      // 기본 WebSite 스키마 (홈페이지용)
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Two Peas',
        alternateName: meta.title || 'Two Peas - 나의 일주 동물 찾기',
        description: meta.description || '생년월일을 입력하면 나만의 일주 동물을 찾아드립니다. 60가지 간지 동물 중 당신의 일주를 확인해보세요.',
        url: currentUrl,
        keywords: meta.keywords || '일주 동물, 사주, 만세력, 간지, 60간지, 일주 찾기',
        author: {
          '@type': 'Organization',
          name: 'Two Peas'
        },
        inLanguage: 'ko-KR'
      }

      // 홈페이지인 경우에만 SearchAction 추가
      if (route.path === '/') {
        structuredData.potentialAction = {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${window.location.origin}/result?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }

      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    // 초기 마운트 시 및 라우트 변경 시 업데이트
    onMounted(() => {
      updateStructuredData()
    })

    watch(() => route.path, () => {
      updateStructuredData()
    })

    return {} // setup 함수에서 반환값이 필요할 수 있으므로 빈 객체 반환
  }
}
</script>

<style>
:root {
  --color-main-pink: #ff99a4;
  --color-background-primary: #ffffff;
  --color-accent: #ffd700;
  --color-text-primary: #36454f;
  --color-soft-lavender: #f2e7ff;
  --color-card-shadow: rgba(255, 153, 164, 0.35);
}

body {
  background: linear-gradient(180deg, #fff8fb 0%, #fdf7ff 45%, #ffffff 100%);
  color: var(--color-text-primary);
  margin: 0;
  padding: 0;
}

body * {
  font-family: 'Paperozi', sans-serif;
}

#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>
