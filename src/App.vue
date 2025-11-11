<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 구조화된 데이터 (JSON-LD) 추가
onMounted(() => {
  const addStructuredData = () => {
    // 기존 구조화된 데이터 제거
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Two Peas',
      description: '다양한 계산기와 심리테스트를 제공하는 Two Peas. 일주 동물 찾기, 만세력 계산 등 재미있고 유용한 도구들을 만나보세요.',
      url: window.location.origin,
      potentialAction: {
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

  addStructuredData()
})
</script>

<template>
  <router-view />
</template>

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
</style>
