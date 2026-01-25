<template>
  <div class="blog-list-container">
    <header class="blog-header">
      <h1>Twopeace 블로그</h1>
      <p class="subtitle">사주와 재테크에 대한 흥미로운 이야기들을 만나보세요.</p>
    </header>

    <section class="articles-grid">
      <router-link
        v-for="article in articles"
        :key="article.slug"
        :to="`/blog/${article.slug}`"
        class="article-card"
      >
        <h2>{{ article.title }}</h2>
        <p class="article-description">{{ article.description }}</p>
        <div class="article-meta">
          <span class="author">by {{ article.author }}</span>
          <span class="date">{{ article.date }}</span>
        </div>
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import articlesData from '../../data/blogArticles.json';

const articles = ref([]);

onMounted(() => {
  articles.value = articlesData;
});
</script>

<style scoped>
.blog-list-container {
  font-family: 'Pretendard', sans-serif;
  max-width: 960px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.blog-header {
  margin-bottom: 40px;
}

.blog-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-main-pink);
  padding-bottom: 10px;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 1.1rem;
  color: #777;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.article-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  background-color: var(--color-background-primary);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--color-card-shadow);
  text-decoration: none;
  color: var(--color-text-primary);
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.article-card h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-main-pink);
  margin-bottom: 10px;
}

.article-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #555;
  flex-grow: 1; /* Description takes up available space */
  margin-bottom: 15px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  margin-top: auto; /* Push meta to the bottom */
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.author {
  font-weight: 500;
}
</style>
