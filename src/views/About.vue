<template>
  <div class="about-container">
    <header class="about-header">
      <h1>Welcome to Twopeace!</h1>
      <p>이곳은 여러분의 삶에 유용한 정보와 즐거움을 더해드리기 위해 만들어진 공간입니다.</p>
    </header>

    <section class="about-section">
      <h2>우리가 제공하는 것</h2>
      <div class="features">
        <div class="feature">
          <div class="feature-icon"> calculators</div>
          <h3>유용한 계산기</h3>
          <p>복잡한 금융 계산부터 생활 속 필요한 계산까지, 저희가 만든 편리한 계산기들을 자유롭게 이용해보세요. 여러분의 시간을 아껴드립니다.</p>
        </div>
        <div class="feature">
          <div class="feature-icon">saju</div>
          <h3>만세력을 이용한 사주 정보</h3>
          <p>전통적인 만세력을 기반으로 한 재미로 보는 사주 정보를 제공합니다. 자신의 또 다른 모습을 발견하고, 삶의 작은 힌트를 얻어 가세요.</p>
        </div>
      </div>
    </section>

    <section class="about-section">
      <h2>Twopeace의 약속</h2>
      <p>
        'twopeace'는 이름처럼 여러분의 마음에 작은 평화와 즐거움을 드리는 것을 목표로 합니다.<br>
        이곳에서 머무는 동안 유익한 정보를 얻고, 잠시나마 즐거운 시간을 보내시길 바랍니다.<br>
        자, 이제 twopeace에서 즐거운 여행을 시작해보세요!
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'About'
};
</script>

<style scoped>
.about-container {
  font-family: 'Pretendard', sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  color: var(--color-text-primary);
  line-height: 1.7;
}

.about-header {
  text-align: center;
  margin-bottom: 50px;
}

.about-header h1 {
  color: var(--color-text-primary);
  margin-bottom: 10px;
}

.about-header p {
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.about-section {
  margin-bottom: 40px;
}

.about-section h2 {
  font-size: 1.8rem;
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-main-pink);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.features {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  text-align: center;
}

.feature {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--color-background-primary);
  box-shadow: 0 2px 4px var(--color-card-shadow);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: var(--color-main-pink);
}

.feature h3 {
  font-size: 1.3rem;
  color: var(--color-text-primary);
  margin-bottom: 10px;
}

@media (max-width: 600px) {
  .features {
    flex-direction: column;
  }
}
</style>
