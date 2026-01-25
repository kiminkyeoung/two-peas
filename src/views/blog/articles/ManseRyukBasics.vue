<template>
  <div class="article-detail-container">
    <header class="article-header">
      <h1>만세력 초보 가이드: 천간과 지지의 의미</h1>
      <div class="article-meta">
        <span class="author">by Twopeace 운영진</span>
        <span class="date">2026-01-25</span>
      </div>
    </header>

    <article class="article-content">
      <p>
        사주(四柱)는 사람이 태어난 연(年), 월(月), 일(日), 시(時) 네 가지 기둥을 의미합니다. 이 네 기둥은 각각 하늘의 기운을 상징하는 '천간(天干)'과 땅의 기운을 상징하는 '지지(地支)'로 이루어져 총 여덟 글자(팔자)를 구성하게 됩니다. 이것이 바로 우리가 흔히 말하는 '사주팔자'입니다.
      </p>

      <h2>천간(天干)이란?</h2>
      <p>
        천간은 10가지의 기운, 즉 갑(甲), 을(乙), 병(丙), 정(丁), 무(戊), 기(己), 경(庚), 신(辛), 임(壬), 계(癸)를 말합니다. 이 10가지 천간은 목(木), 화(火), 토(土), 금(金), 수(水)의 오행과 음(陰), 양(陽)의 특성을 가지고 있습니다. 예를 들어, 갑(甲)은 양목(陽木)을, 을(乙)은 음목(陰木)을 의미합니다.
      </p>
      <p>
        천간은 주로 정신적인 영역, 사상, 이상, 외부로 드러나는 모습 등을 나타낸다고 해석합니다. 사주에서 천간이 어떤 글자로 구성되어 있는지에 따라 그 사람의 기본적인 성격과 특징을 유추할 수 있습니다.
      </p>

      <h2>지지(地支)란?</h2>
      <p>
        지지는 12가지의 기운, 즉 자(子), 축(丑), 인(寅), 묘(卯), 진(辰), 사(巳), 오(午), 미(未), 신(申), 유(酉), 술(戌), 해(亥)를 말합니다. 이 12가지 지지는 우리가 흔히 아는 12지신(쥐, 소, 호랑이 등) 동물과도 연결됩니다.
      </p>
      <p>
        지지는 주로 현실적인 영역, 행동, 환경, 결과 등을 나타낸다고 해석합니다. 천간이 정신이라면 지지는 육체와 같은 개념으로 볼 수 있으며, 사주의 깊이를 더하는 중요한 요소입니다. 지지끼리의 합(合), 충(沖), 형(刑), 파(破), 해(害) 등의 관계를 통해 복잡한 운의 흐름을 읽어낼 수 있습니다.
      </p>

      <h2>천간과 지지의 조합: 육십갑자(六十甲子)</h2>
      <p>
        10개의 천간과 12개의 지지를 순서대로 한 번씩 짝지으면 총 60가지의 조합이 나옵니다. 이것을 '육십갑자(六十甲子)'라고 부릅니다. 육십갑자는 사주의 연주(年柱), 월주(月柱), 일주(日柱), 시주(時柱)를 구성하는 기본 단위가 됩니다.
      </p>
      <p>
        Twopeace의 '내 일주 동물 찾기' 기능은 바로 이 육십갑자 중 태어난 날을 상징하는 '일주(日柱)'를 기반으로 당신의 숨겨진 동물과 성향을 알려드립니다.
      </p>
    </article>
  </div>
</template>

<script>
export default {
  name: 'ManseRyukBasics'
};
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

.article-header {
  text-align: center;
  margin-bottom: 40px;
}

.article-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-main-pink);
  padding-bottom: 10px;
  margin-bottom: 5px;
}

.article-meta {
  font-size: 0.9rem;
  color: #777;
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.article-content {
  text-align: left;
}

.article-content h2 {
  font-size: 1.8rem;
  color: var(--color-main-pink);
  margin-top: 35px;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--color-soft-lavender);
  padding-bottom: 5px;
}

.article-content p {
  font-size: 1rem;
  margin-bottom: 15px;
}
</style>
