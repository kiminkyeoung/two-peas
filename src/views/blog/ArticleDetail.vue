<template>
  <div class="article-detail-container">
    <div v-if="loading" class="loading-state">
      <p>아티클을 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>아티클을 찾을 수 없습니다: {{ slug }}</p>
      <router-link to="/blog">블로그 목록으로 돌아가기</router-link>
    </div>
    <component :is="articleComponent" v-else />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import articlesData from '../../data/blogArticles.json';
import { updateMetaTag, updateCanonical } from '../../router'; // router에서 헬퍼 함수 임포트

// 모든 아티클 컴포넌트를 미리 로드하는 맵 생성
const articleModules = import.meta.glob('./articles/*.vue');

const props = defineProps({
  slug: {
    type: String,
    required: true
  }
});

const route = useRoute();
const loading = ref(true);
const error = ref(false);
const articleComponent = ref(null);

const currentArticleMeta = computed(() => {
  return articlesData.find(article => article.slug === props.slug);
});

// BlogPosting JSON-LD 스키마 업데이트 함수
const updateBlogPostingSchema = (articleMeta) => {
  const existingScript = document.querySelector('script[type="application/ld+json"][data-schema-type="BlogPosting"]');
  if (existingScript) {
    existingScript.remove();
  }

  if (articleMeta) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": articleMeta.title,
      "description": articleMeta.description,
      "datePublished": articleMeta.date,
      "author": {
        "@type": "Person", // Or Organization
        "name": articleMeta.author
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${window.location.origin}${route.path}`
      },
      "url": `${window.location.origin}${route.path}`
      // "image": {
      //   "@type": "ImageObject",
      //   "url": articleMeta.imageUrl || 'https://twopeas.co.kr/default-blog-image.webp'
      // }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-type', 'BlogPosting'); // 스키마 유형을 식별하기 위한 속성
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
};

// 동적으로 컴포넌트 로드
const loadArticleComponent = async (slug) => {
  loading.value = true;
  error.value = false;
  articleComponent.value = null;

  const articleMeta = currentArticleMeta.value;

  if (!articleMeta) {
    error.value = true;
    loading.value = false;
    return;
  }

  try {
    const componentName = slug.split('-')
                                  .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                                  .join('');
    
    const modulePath = `./articles/${componentName}.vue`;
    const componentLoader = articleModules[modulePath];

    if (componentLoader) {
      const module = await componentLoader(); // 컴포넌트 로더 함수 실행
      articleComponent.value = module.default;
    } else {
      throw new Error(`Component loader not found for: ${modulePath}`);
    }
  } catch (e) {
    console.error(`Failed to load article component for slug: ${slug}`, e);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 슬러그가 변경될 때마다 컴포넌트를 다시 로드
watch(() => props.slug, (newSlug) => {
  loadArticleComponent(newSlug);
}, { immediate: true }); 

// 메타 정보 동적 업데이트
watch(currentArticleMeta, (newMeta) => {
  if (newMeta) {
    const fullUrl = window.location.origin + route.path;

    document.title = newMeta.title || 'Twopeace 블로그';
    updateMetaTag('title', newMeta.title || 'Twopeace 블로그'); // Primary meta title

    if (newMeta.description) {
      updateMetaTag('description', newMeta.description);
      updateMetaTag('og:description', newMeta.description, true);
      updateMetaTag('twitter:description', newMeta.description, true);
    }
    if (newMeta.keywords) {
      updateMetaTag('keywords', newMeta.keywords);
    }

    // Open Graph / Twitter specific
    updateMetaTag('og:title', newMeta.title || 'Twopeace 블로그', true);
    updateMetaTag('twitter:title', newMeta.title || 'Twopeace 블로그', true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('twitter:url', fullUrl, true);
    
    // Canonical URL 업데이트
    updateCanonical(fullUrl);

    // BlogPosting Schema 업데이트
    updateBlogPostingSchema(newMeta);
  }
}, { immediate: true });
</script>

<style scoped>
.article-detail-container {
  font-family: 'Pretendard', sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  color: var(--color-text-primary);
  line-height: 1.8;
}

.loading-state, .error-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #777;
}

.error-state a {
  color: var(--color-main-pink);
  text-decoration: none;
  font-weight: bold;
}
</style>
