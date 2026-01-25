<template>
  <div class="quick-menu-container">
    <header class="menu-header">
      <h1>Twopeace에 오신 것을 환영합니다!</h1>
      <p>어떤 서비스가 궁금하신가요?</p>
    </header>
    <div class="menu-grid">
      <router-link to="/ganji/find-my-animal" class="menu-card pink">
        <div class="card-icon"></div>
        <h2>내 일주 동물 찾기</h2>
        <p>생년월일시를 입력하고<br/>나를 상징하는 동물을 찾아보세요.</p>
      </router-link>

      <router-link to="/what-is-ilju-animal" class="menu-card lavender">
        <div class="card-icon"></div>
        <h2>일주 동물이란?</h2>
        <p>나의 진짜 성향을 알려주는<br/>일주 동물의 개념을 알아보세요.</p>
      </router-link>
      
      <router-link to="/result" class="menu-card yellow">
        <div class="card-icon"></div>
        <h2>60 동물 도감</h2>
        <p>갑자부터 계해까지<br/>60마리의 동물 친구들을 만나보세요.</p>
      </router-link>

      <router-link to="/richplan/billionCalc" class="menu-card blue">
        <div class="card-icon"></div>
        <h2>1억 부자 계산기</h2>
        <p>복리 마법으로<br/>부자가 되는 날을 계산해드려요.</p>
      </router-link>

      <router-link to="/richplan/loanCalc" class="menu-card green">
        <div class="card-icon"></div>
        <h2>대출 상환 계산기</h2>
        <p>원리금 균등, 원금 균등 방식의<br/>월 상환액을 비교해보세요.</p>
      </router-link>
      
      <router-link to="/about" class="menu-card gray">
        <div class="card-icon"></div>
        <h2>Twopeace 소개</h2>
        <p>Twopeace가 제공하는<br/>다양한 이야기를 확인해보세요.</p>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
};
</script>

<style scoped>
.quick-menu-container {
  max-width: 960px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.menu-header {
  margin-bottom: 40px;
}

.menu-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.menu-header p {
  font-size: 1.1rem;
  color: #777;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.menu-card {
  display: block;
  padding: 30px 20px;
  border-radius: 16px;
  text-decoration: none;
  color: var(--color-text-primary);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: var(--color-background-primary);
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.menu-card h2 {
  font-size: 1.4rem;
  margin: 10px 0;
}

.menu-card p {
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.8;
}

/* Color Variants */
.menu-card.pink { border-top: 5px solid var(--color-main-pink); }
.menu-card.lavender { border-top: 5px solid var(--color-soft-lavender); }
.menu-card.yellow { border-top: 5px solid var(--color-accent); }
.menu-card.blue { border-top: 5px solid #85c1e9; }
.menu-card.green { border-top: 5px solid #7dcea0; }
.menu-card.gray { border-top: 5px solid #bdc3c7; }
</style>