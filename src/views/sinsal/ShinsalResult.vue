<template>
  <div class="result-container">
    <header class="result-header">
      <h1>내 사주 속 신살 분석 결과</h1>
      <p class="subtitle">
        {{ birthDate }} {{ birthTime }} 분석 결과 발견된 신살은 다음과 같습니다.
      </p>
    </header>

    <section v-if="foundSals.length > 0" class="sinsal-list">
      <div v-for="sal in foundSals" :key="sal.id" class="sinsal-card">
        <h2>{{ sal.name }}</h2>
        <p class="sinsal-description">{{ sal.description }}</p>
        <div class="sinsal-meta">
          <span>분류: {{ sal.category }}</span>
          <span>속성: {{ sal.attribute }}</span>
          <span>획득처: {{ sal.source }}</span>
        </div>
      </div>
    </section>

    <section v-else class="no-sinsal">
      <p>당신의 사주에서는 특별히 감지되는 신살이 없습니다.</p>
      <p>이는 조용하고 평온한 삶을 암시할 수 있습니다.</p>
    </section>

    <div class="action-buttons">
      <button @click="goBackToAnalysis" class="cta-button secondary">다시 분석하기</button>
      <router-link to="/" class="cta-button">홈으로</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import shinsalData from '../../data/shinsal.json';

export default {
  name: 'ShinsalResult',
  setup() {
    const router = useRouter();
    const birthDate = ref('');
    const birthTime = ref('');
    const foundSals = ref([]);

    onMounted(() => {
      const storedResult = sessionStorage.getItem('sinsalResult');
      if (storedResult) {
        const result = JSON.parse(storedResult);
        birthDate.value = result.birthDate;
        birthTime.value = result.birthTime;

        // foundSals를 shinsalData와 매칭하여 상세 정보 가져오기
        foundSals.value = result.sals.map(salName => {
          return shinsalData.find(item => item.name === salName);
        }).filter(Boolean); // 유효하지 않은 salName은 제거
      } else {
        // 결과가 없으면 분석 페이지로 리다이렉트
        router.replace('/sinsal/analysis');
      }
    });

    const goBackToAnalysis = () => {
      router.push('/sinsal/analysis');
    };

    return {
      birthDate,
      birthTime,
      foundSals,
      goBackToAnalysis,
    };
  },
};
</script>

<style scoped>
.result-container {
  font-family: 'Pretendard', sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  color: var(--color-text-primary);
  line-height: 1.8;
  text-align: center;
}

.result-header {
  margin-bottom: 40px;
}

.result-header h1 {
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

.sinsal-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.sinsal-card {
  background-color: var(--color-background-primary);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--color-card-shadow);
  padding: 25px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sinsal-card h2 {
  font-size: 1.5rem;
  color: var(--color-main-pink);
  margin-bottom: 10px;
}

.sinsal-description {
  font-size: 0.95rem;
  color: var(--color-text-primary);
  margin-bottom: 15px;
  flex-grow: 1;
}

.sinsal-meta span {
  display: block;
  font-size: 0.8rem;
  color: #a0a0a0;
  margin-top: 5px;
}

.no-sinsal {
  background-color: var(--color-background-primary);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--color-card-shadow);
  padding: 30px;
  margin-top: 30px;
}

.no-sinsal p {
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.action-buttons {
  margin-top: 50px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.cta-button {
  display: inline-block;
  background-color: var(--color-main-pink);
  color: white;
  padding: 12px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  border: none;
  cursor: pointer;
}

.cta-button:hover {
  background-color: #ff7b8c;
}

.cta-button.secondary {
  background-color: #bdc3c7;
}

.cta-button.secondary:hover {
  background-color: #95a5a6;
}
</style>
