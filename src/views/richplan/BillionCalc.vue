<script setup lang="ts">
import { ref } from 'vue'


const currentCapital = ref(500)
const targetCapital = ref(50)
const annualReturn = ref(7)

const result = ref<{ title: string; year?: string; subtitle: string; investorType?: number } | null>(null)
const showReturnInfo = ref(false)

const GOAL = 100000000;

// 투자자 타입 정의
const investorTypes = [
  {
    id: 1,
    name: '새싹 안정형',
    description: '작아도 꾸준하면 된다! 내 돈은 절대 마이너스 안 됨.',
    image: '/richplan/rich-1.png'
  },
  {
    id: 2,
    name: '소액 실험가',
    description: '이건 실전 연습용! 경험치 모아 레벨업 중',
    image: '/richplan/rich-2.png'
  },
  {
    id: 3,
    name: '소액 게이머',
    description: '하이 리스크 하이 리턴! 이 돈은 없어도 되는 돈이다!',
    image: '/richplan/rich-3.png'
  },
  {
    id: 4,
    name: '신중한 설계자',
    description: '소비는 딱 즐길 만큼만. 대신 미래 설계는 엣지있게 간다.',
    image: '/richplan/rich-4.png'
  },
  {
    id: 5,
    name: '균형적인 전략가',
    description: '장기전이 답이다. 포트폴리오가 나의 멘탈 케어',
    image: '/richplan/rich-5.png'
  },
  {
    id: 6,
    name: '가속형 투자자',
    description: '기회다 싶으면 바로 달린다! 리스크? 계산은 했음.',
    image: '/richplan/rich-6.png'
  },
  {
    id: 7,
    name: '자산 수호자',
    description: '많이 벌어봤자 못 지키면 소용없지. 자산은 보호가 최우선',
    image: '/richplan/rich-7.png'
  },
  {
    id: 8,
    name: '기관급 전략가',
    description: '개인인데 기관 느낌. 분석·분산·계획이 국룰.',
    image: '/richplan/rich-8.png'
  },
  {
    id: 9,
    name: '시장의 지배자',
    description: '최고점? 나는 그 위를 본다. 기회는 잡는 게 아니라 만드는 것',
    image: '/richplan/rich-9.png'
  }
]

// 투자자 타입 결정 함수
const getInvestorType = (monthly: number, rate: number): number => {
  // 월 저축 금액 분류
  let savingsCategory: '소액' | '중액' | '고액'
  if (monthly < 500000) {
    savingsCategory = '소액'
  } else if (monthly < 1500000) {
    savingsCategory = '중액'
  } else {
    savingsCategory = '고액'
  }

  // 수익률 분류
  let returnCategory: '안정형' | '중립형' | '공격형'
  if (rate <= 4) {
    returnCategory = '안정형'
  } else if (rate <= 8) {
    returnCategory = '중립형'
  } else {
    returnCategory = '공격형'
  }

  // 조합하여 타입 ID 결정
  // 소액: 1-3, 중액: 4-6, 고액: 7-9
  // 안정형: 1,4,7 / 중립형: 2,5,8 / 공격형: 3,6,9
  const typeMap: Record<string, number> = {
    '소액안정형': 1,
    '소액중립형': 2,
    '소액공격형': 3,
    '중액안정형': 4,
    '중액중립형': 5,
    '중액공격형': 6,
    '고액안정형': 7,
    '고액중립형': 8,
    '고액공격형': 9
  }

  const key = `${savingsCategory}${returnCategory}`
  return typeMap[key] || 1
}

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

const shareResult = async () => {
  if (!result.value || !result.value.investorType) return

  const investorType = investorTypes[result.value.investorType - 1]
  const shareText = `🎯 나의 투자자 타입: ${investorType.name}\n\n${result.value.title}\n${result.value.year}\n\n${investorType.description}\n\n1억 부자 계산기로 확인해보세요! 👉`
  const shareUrl = 'https://twopeas.co.kr/richplan/billionCalc'

  // Web Share API 지원 확인
  if (navigator.share) {
    try {
      await navigator.share({
        title: `나의 투자자 타입: ${investorType.name}`,
        text: shareText,
        url: shareUrl
      })
    } catch (err) {
      // 사용자가 공유를 취소한 경우 무시
      if ((err as Error).name !== 'AbortError') {
        console.error('공유 실패:', err)
        fallbackShare(shareText, shareUrl)
      }
    }
  } else {
    // Web Share API를 지원하지 않는 경우 클립보드 복사
    fallbackShare(shareText, shareUrl)
  }
}

const fallbackShare = async (text: string, url: string) => {
  const fullText = `${text}\n${url}`
  
  try {
    await navigator.clipboard.writeText(fullText)
    alert('결과가 클립보드에 복사되었습니다! 📋\n원하는 곳에 붙여넣기 하세요.')
  } catch (err) {
    // 클립보드 API 실패 시 텍스트 영역 사용
    const textarea = document.createElement('textarea')
    textarea.value = fullText
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
      document.execCommand('copy')
      alert('결과가 클립보드에 복사되었습니다! 📋\n원하는 곳에 붙여넣기 하세요.')
    } catch (err) {
      alert('공유 기능을 사용할 수 없습니다. 브라우저를 확인해주세요.')
    }
    
    document.body.removeChild(textarea)
  }
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

  const days = Math.floor(months * 30.44);

  const dailySavings = Math.floor(monthly / 30.44);
  const yearText = years > 0 ? `${String(years).padStart(2, '0')}년` : '00년';
  const monthText = remainingMonths > 0 ? `${String(remainingMonths).padStart(2, '0')}개월` : '00개월';
  const periodText = `${yearText}${monthText}`;

  // 투자자 타입 결정
  const investorTypeId = getInvestorType(monthly, rate);

  result.value = {
    title: `${periodText} 뒤 드디어 1억 클럽에 입성합니다 🎉`,
    year: `${targetYear}년 ${targetMonth}월`,
    subtitle: `지금 속도로 가면 ${days.toLocaleString()}일 남았어요. 하루 ${dailySavings.toLocaleString()}원씩 모으고 있어요.`,
    investorType: investorTypeId
  };
};

</script>


<template>
  <div class="landing palette-modern">
    <section class="hero" v-if="result">
      <div class="hero__intro center">
        <h1 class="result-title" v-if="result.investorType">
          {{ investorTypes[result.investorType - 1]?.name }}
        </h1>
        <p class="result-subtitle" v-if="result.investorType">
          {{ investorTypes[result.investorType - 1]?.description }}
        </p>
        <img v-if="result.investorType"
          :src="investorTypes[result.investorType - 1]?.image || '/richplan/rich-gril.png'" alt="투자자 타입 이미지"
          class="hero__image" />
      </div>
      <div class="result-box">
        <p class="result-date" v-html="result.title"></p>
        <h2 class="result-date-year" v-if="result.year">{{ result.year }}</h2>
        <p class="result-daily-savings" v-if="result.subtitle">{{ result.subtitle }}</p>
        <div class="button-group">
          <button @click="resetCalculation" class="reset-button">
            다시 계산하기
          </button>
          <button @click="shareResult" class="share-button">
            결과 공유하기
          </button>
        </div>
      </div>
    </section>
    <section class="hero" v-else>
      <div class="hero__intro center">
        <h1 class="hero__title">1억 부자 계산기</h1>
        <img src="/richplan/rich-gril.png" alt="1억 부자 계산기" class="hero__image" />
        <p class="hero__subtitle">현재 자본금, 매월 목표 저축 금액을 입력하면 1억 달성 시기를 알려드립니다. </p>
      </div>
      <form class="calc-form" @submit.prevent="handleSubmit">
        <div class="field-group">
          <span class="field-label">💰 현재 자본금</span>
          <div class="input-wrapper">
            <input id="current-capital" v-model="currentCapital" type="number" placeholder="1000000"
              class="input-control" required />
            <span class="input-unit">만원</span>
          </div>
        </div>

        <div class="field-group">
          <span class="field-label">💵 매월 목표 저축 금액</span>
          <div class="input-wrapper">
            <input id="target-capital" v-model="targetCapital" type="number" placeholder="10000000"
              class="input-control" required />
            <span class="input-unit">만원</span>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label-wrapper">
            <span class="field-label">📈 연 수익률</span>
            <button type="button" @click="showReturnInfo = !showReturnInfo" class="info-icon-button"
              aria-label="수익률 정보">
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
            <input id="annual-return" v-model="annualReturn" type="number" placeholder="7" class="input-control"
              required />
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
/* BillionCalc.vue 고유 스타일 */
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

.result-box {
  max-width: 550px;
  margin: 2rem auto 0;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0000000d;
  border: 1px solid #f5f5f5;
}

.hero__intro .hero__image {
  margin-bottom: 1.5rem;
}

.result-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #ff99a4;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

.result-subtitle {
  font-size: 1.1rem;
  color: #36454f;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

.result-date {
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.5;
}

.result-date-year {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--color-main-pink);
  margin: 0.5rem 0;
  line-height: 1.3;
}

.result-daily-savings {
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: rgba(54, 69, 79, 0.75);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .result-title {
    font-size: 1.4rem;
  }

  .result-subtitle {
    font-size: 0.95rem;
    padding: 0 0.5rem;
  }

  .result-box {
    padding: 1.5rem 1.25rem;
    margin: 1.5rem auto 0;
  }

  .result-date {
    font-size: 1rem;
  }

  .result-date-year {
    font-size: 1.3rem;
  }

  .result-daily-savings {
    font-size: 0.9rem;
  }
}
</style>
