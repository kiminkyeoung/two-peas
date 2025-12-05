<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { setSeoMeta } from '@/utils/seo'


const currentCapital = ref(100)   
const targetCapital = ref(50)
const annualReturn = ref(7)

const result = ref<{ title: string; subtitle: string } | null>(null)
const showReturnInfo = ref(false)

const GOAL = 100000000; 

const calculateMonths = (current: number, monthly: number, annualRate: number): number => {
  const r = annualRate / 100 / 12; 

  let month = 0;
  let total = current;

  while (total < GOAL) {
    total = total * (1 + r) + monthly;
    month++;

    if (month > 2000) return NaN;
  }

  return month;
};

const resetCalculation = () => {
  result.value = null
}

const handleSubmit = () => {
  const current = Number(currentCapital.value) * 10000; 
  const monthly = Number(targetCapital.value) * 10000;  
  const rate = Number(annualReturn.value);

  if (current <= 0 || monthly <= 0 || rate < 0) {
    result.value = {
      title: "입력값이 올바르지 않습니다!",
      subtitle: ""
    };
    return;
  }

  if (current >= GOAL) {
    result.value = {
      title: "이미 1억을 달성하셨습니다! 🎉",
      subtitle: ""
    };
    return;
  }

  const months = calculateMonths(current, monthly, rate);

  if (isNaN(months)) {
    result.value = {
      title: "입력값이 올바르지 않습니다!",
      subtitle: ""
    };
    return;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  // 목표 달성 날짜 계산
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setMonth(today.getMonth() + months);
  
  const targetYear = targetDate.getFullYear();
  const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0'); // getMonth()는 0부터 시작하므로 +1

  // 일수 계산 (대략적으로 months * 30.44일)
  const days = Math.floor(months * 30.44);
  
  // 하루 저축액 계산 (원 단위)
  const dailySavings = Math.floor(monthly / 30.44);

  // 첫 번째 줄: 년/개월과 목표 달성 날짜
  const yearText = years > 0 ? `${String(years).padStart(2, '0')}년` : '00년';
  const monthText = remainingMonths > 0 ? `${String(remainingMonths).padStart(2, '0')}개월` : '00개월';
  const periodText = `${yearText}${monthText}`;
  
  result.value = {
    title: `${periodText} 뒤 드디어 1억 클럽에 입성합니다 🎉<br/><h2>${targetYear}년 ${targetMonth}월</h2><br/>`,
    subtitle: `지금 속도로 가면 ${days.toLocaleString()}일 남았어요. 하루 ${dailySavings.toLocaleString()}원씩 모으고 있어요.`
  };
};

// SEO 메타 태그 설정
onMounted(() => {
  const pageUrl = 'https://twopeas.co.kr/richplan/billionCalc'
  const pageTitle = '1억 부자 계산기 - Two Peas'
  const pageDescription = '현재 자본금, 매월 목표 저축 금액, 연 수익률을 입력하면 1억 달성 시기를 알려드립니다. 복리 계산으로 정확한 목표 달성 날짜를 확인해보세요.'
  const pageKeywords = '1억 부자, 자본금 계산, 목표 달성, 재테크 계산기, 복리 계산, 저축 계산기, 부자 되기, 재무 계획'
  const imageUrl = 'https://twopeas.co.kr/richplan/rich-gril-thumnail.png'

  setSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    url: pageUrl,
    imageUrl: imageUrl,
    siteName: 'Two Peas',
    type: 'website',
    twitterCard: 'summary_large_image',
    imageWidth: '1200',
    imageHeight: '630'
  } as any)
})

</script>


<template>
    <div class="landing palette-modern">
      <section class="hero">
        <div class="hero__intro center">
          <h1 class="hero__title">1억 부자 계산기</h1>
          <img src="/richplan/rich-gril.png" alt="1억 부자 계산기" class="hero__image"/>
          <p class="hero__subtitle">현재 자본금, 매월 목표 저축 금액을 입력하면 1억 달성 시기를 알려드립니다. </p>
        </div>
  
    
  
        <!-- 결과 출력 -->
        <div v-if="result" class="result-box">
          <h2 class="result-title" v-html="result.title"></h2>
          <p class="result-subtitle" v-if="result.subtitle">{{ result.subtitle }}</p>
          <button @click="resetCalculation" class="reset-button">
            다시 계산하기
          </button>
        </div>    
        <form v-else class="calc-form" @submit.prevent="handleSubmit">
          <div class="field-group">
            <span class="field-label">💰 현재 자본금</span>
            <div class="input-wrapper">
              <input
                id="current-capital"
                v-model="currentCapital"
                type="number"
                placeholder="1000000"
                class="input-control"
                required
              />
              <span class="input-unit">만원</span>
            </div>
          </div>
  
          <div class="field-group">
            <span class="field-label">💵 매월 목표 저축 금액</span>
            <div class="input-wrapper">
              <input
                id="target-capital"
                v-model="targetCapital"
                type="number"
                placeholder="10000000"
                class="input-control"
                required
              />
              <span class="input-unit">만원</span>
            </div>
          </div>
  
          <div class="field-group">
            <div class="field-label-wrapper">
              <span class="field-label">📈 연 수익률</span>
              <button type="button" @click="showReturnInfo = !showReturnInfo" class="info-icon-button" aria-label="수익률 정보">
                ℹ️
                <span class="tooltip-text">수익률 측정을 어떻게 해야할까요?</span>
              </button>
            </div>
            <div v-if="showReturnInfo" class="return-info-box">
              <div class="info-item info-safe">
                <span class="info-badge">🟢 안정형 투자자: 2% ~ 4%</span>
                <p class="info-desc">예금·적금·채권 위주, 원금 손실이 싫은 분</p>
              </div>
              <div class="info-item info-neutral">
                <span class="info-badge">🟡 중립형 투자자: 5% ~ 8%</span>
                <p class="info-desc">주식 + 채권을 적절히 섞는 무난한 스타일</p>
              </div>
              <div class="info-item info-aggressive">
                <span class="info-badge">🔴 공격형 투자자: 9% ~ 12%</span>
                <p class="info-desc">미국주식·테크 ETF 등 성장에 베팅하는 타입</p>
              </div>
            </div>
            <div class="input-wrapper">
              <input
                id="annual-return"
                v-model="annualReturn"
                type="number"
                placeholder="7"
                class="input-control"
                required
              />
              <span class="input-unit">%</span>
            </div>
          </div>
  
          <button class="cta-button" type="submit">
            1억 부자 될 준비가 되었으면 클릭 🥰
          </button>
        </form>
      </section>
    </div>
  </template>

<style scoped>
:root {
  --color-main-pink: #ffc0cb;
  --color-background-primary: #fffff0;
  --color-accent: #add8e6;
  --color-text-primary: #4e3629;
  --color-soft-lavender: #d8d9ff;
  --color-card-shadow: rgba(255, 153, 164, 0.45);
}

.palette-modern {
  --color-main-pink: #ff99a4;
  --color-background-primary: #ffffff;
  --color-accent: #ffd700;
  --color-text-primary: #36454f;
  --color-soft-lavender: #f2e7ff;
  --color-card-shadow: rgba(255, 153, 164, 0.35);
}

.center {
  text-align: center;
}
.landing {
  display: grid;
  gap: 3rem;
  padding: 4rem clamp(1.5rem, 4vw, 5rem);
  min-height: 100vh;
  align-items: center;
  background-color: var(--color-background-primary);
  position: relative;
  overflow: hidden;
}

.landing::before,
.landing::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(255, 153, 164, 0.33) 0%, rgba(255, 153, 164, 0) 70%);
  filter: blur(8px);
  z-index: 0;
}

.landing::before {
  top: -80px;
  left: -120px;
}

.landing::after {
  bottom: -120px;
  right: -140px;
}

.hero {
  position: relative;
  z-index: 1;
}

.hero__intro {
  max-width: 520px;
  margin: 0 auto;
}

.hero__title {
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 1.1;
  font-weight: 800;
  margin: 0 0 1rem;
  color: var(--color-text-primary);
}

.hero__image {
  width: 100%;
  max-width: 400px;
  height: auto;
  margin: 0 auto 2rem;
  display: block;
  object-fit: contain;
}

.hero__subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(54, 69, 79, 0.8);
  margin-bottom: 2.5rem;
}

.calc-form {
  max-width: 520px;
  display: grid;
  gap: 1.5rem;
  justify-self: center;
  background: rgba(255, 244, 248, 0.85);
  border-radius: 28px;
  padding: 2rem clamp(1.5rem, 4vw, 2.5rem);
  box-shadow: 0 30px 70px rgba(255, 153, 164, 0.18);
  backdrop-filter: blur(10px);
}

.field-group {
  display: grid;
  gap: 0.75rem;
}

.field-label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.field-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.info-icon-button {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  opacity: 0.7;
  position: relative;
}

.info-icon-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.tooltip-text {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(54, 69, 79, 0.95);
  color: #ffffff;
  font-size: 0.85rem;
  white-space: nowrap;
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip-text::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 1rem;
  border: 6px solid transparent;
  border-top-color: rgba(54, 69, 79, 0.95);
}

.info-icon-button:hover .tooltip-text {
  opacity: 1;
  visibility: visible;
}

.return-info-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(255, 153, 164, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-item {
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-badge {
  display: block;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.info-desc {
  font-size: 0.85rem;
  color: rgba(54, 69, 79, 0.7);
  margin: 0;
  padding-left: 1rem;
  line-height: 1.5;
}

.info-safe .info-badge {
  color: #22c55e;
}

.info-neutral .info-badge {
  color: #eab308;
}

.info-aggressive .info-badge {
  color: #ef4444;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-control {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 3.5rem;
  border-radius: 16px;
  border: 1px solid rgba(54, 69, 79, 0.1);
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-unit {
  position: absolute;
  right: 1rem;
  color: rgba(54, 69, 79, 0.6);
  font-size: 1rem;
  pointer-events: none;
  user-select: none;
}

.input-control:focus {
  outline: none;
  border-color: var(--color-main-pink);
  box-shadow: 0 0 0 4px rgba(255, 153, 164, 0.15);
}

.cta-button {
  border: none;
  border-radius: 999px;
  padding: 0.9rem 2.4rem;
  font-size: 1.05rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-main-pink) 0%, #ffb6c5 70%);
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 20px 35px rgba(255, 153, 164, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 26px 40px rgba(255, 153, 164, 0.45);
}

.result-box {
  max-width: 520px;
  margin: 2rem auto 0;
  padding: 1.5rem 2rem;
  background: rgba(255, 244, 248, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(255, 153, 164, 0.2);
  text-align: center;
}

.result-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.result-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(54, 69, 79, 0.8);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.reset-button {
  border: none;
  border-radius: 999px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-main-pink);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 153, 164, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid var(--color-main-pink);
}

.reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 153, 164, 0.3);
  background: var(--color-main-pink);
  color: #ffffff;
}

@media (max-width: 768px) {
  .hero__title {
    text-align: center;
  }

  .hero__intro,
  .birth-form {
    text-align: center;
  }

  .hero__image {
    max-width: 300px;
  }
}
</style>

