<template>
  <div class="content-container">
    <header class="content-header">
      <h1>일주 동물이란?</h1>
      <p class="subtitle">나를 상징하는 또 다른 동물, 일주 동물 이야기</p>
    </header>

    <section>
      <h2>'일주(日柱)'가 무엇인가요?</h2>
      <p>
        사주(四柱)는 사람이 태어난 연(年), 월(月), 일(日), 시(時) 네 가지 기둥을 바탕으로 운의 흐름을 읽는 동양의 전통적인 운명학입니다.
        이 네 개의 기둥 중, 개인이 태어난 날짜를 상징하는 '일주(日柱)'는 네 기둥 중에서도 '나 자신'을 대표하는 가장 중요한 기둥으로 여겨집니다.
      </p>
      <p>
        따라서 일주는 한 사람의 기본적인 성격, 기질, 가치관, 그리고 배우자와의 관계까지 암시하는 핵심적인 요소로 해석됩니다.
      </p>
    </section>

    <section>
      <h2>'일주 동물'은 '띠'와 다른가요?</h2>
      <p>
        네, 다릅니다. 우리가 흔히 알고 있는 '띠'는 태어난 해(年柱)를 상징하는 동물입니다. 반면 '일주 동물'은 태어난 날(日柱)을 상징하는 동물입니다.
      </p>
      <p>
        띠 동물이 사회적인 모습이나 전반적인 이미지를 나타낸다면, 일주 동물은 그 사람의 내면 깊숙한 곳에 자리한 본질적인 성향과 개성을 보여줍니다. 그래서 "띠는 O인데, 실제 성격은 다른 것 같아"라고 느끼는 경우가 많은 것입니다. 일주 동물을 알면 자신을 더 깊이 이해할 수 있게 됩니다.
      </p>
    </section>

    <section>
      <h2>총 60가지의 '일주 동물'</h2>
      <p>
        일주는 하늘의 기운을 상징하는 10개의 천간(天干)과 땅의 기운을 상징하는 12개의 지지(地支)의 조합으로 만들어집니다. 이 조합을 통해 총 60가지의 고유한 간지(干支)가 형성되며, 각각의 간지는 특정한 동물로 상징화됩니다.
      </p>
      <p>
        Twopeace에서는 이 60가지 일주 동물을 하나씩 살펴보고, 각 동물이 가진 성격과 특징을 탐색해볼 수 있습니다. 나의 일주 동물을 찾아보고, 자신도 몰랐던 새로운 모습을 발견해보세요!
      </p>
      <router-link to="/ganji/find-my-animal" class="cta-button">내 일주 동물 찾아보기</router-link>
    </section>
  </div>
</template>

<script>
export default {
  name: 'WhatIsIljuAnimal'
};
</script>

<style scoped>
.content-container {
  font-family: 'Pretendard', sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  color: var(--color-text-primary);
  line-height: 1.8;
}

.content-header {
  text-align: center;
  margin-bottom: 50px;
}

.content-header h1 {
  font-size: 2.5rem;
  color: var(--color-main-pink);
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #777;
}

section {
  margin-bottom: 40px;
}

h2 {
  font-size: 1.8rem;
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-soft-lavender);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

p {
  font-size: 1rem;
  margin-bottom: 15px;
}

.cta-button {
  display: inline-block;
  background-color: var(--color-main-pink);
  color: white;
  padding: 12px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #ff7b8c; /* 메인 핑크보다 살짝 진한 색 */
}
</style>
