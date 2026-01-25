<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-logo">Twopeace</router-link>

      <div class="menu-icon" @click="toggleMobileMenu">
        <svg v-if="!isMobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>

      <ul class="nav-menu" :class="{ 'active': isMobileMenuOpen }">
        <li class="nav-item" @click="closeMobileMenu">
          <router-link to="/" class="nav-link">홈</router-link>
        </li>
        <li class="nav-item has-dropdown" @mouseover="showIljuDropdown = true" @mouseleave="showIljuDropdown = false" :class="{ 'dropdown-open': showIljuDropdown }">
          <a class="nav-link" @click="toggleIljuDropdown">일주 동물 도감</a>
          <ul class="dropdown-menu" v-if="showIljuDropdown">
            <li @click="closeMobileMenu"><router-link to="/what-is-ilju-animal">일주 동물이란?</router-link></li>
            <li @click="closeMobileMenu"><router-link to="/ganji/find-my-animal">내 일주 동물 찾기</router-link></li>
            <!-- <li><router-link to="/sinsal/analysis">내 사주 속 신살 분석</router-link></li> -->
          </ul>
        </li>
        <li class="nav-item has-dropdown" @mouseover="showFinanceDropdown = true" @mouseleave="showFinanceDropdown = false" :class="{ 'dropdown-open': showFinanceDropdown }">
          <a class="nav-link" @click="toggleFinanceDropdown">재테크 계산기</a>
          <ul class="dropdown-menu" v-if="showFinanceDropdown">
            <li @click="closeMobileMenu"><router-link to="/richplan/billionCalc">1억 부자 계산기</router-link></li>
            <li @click="closeMobileMenu"><router-link to="/richplan/loanCalc">대출 상환 계산기</router-link></li>
          </ul>
        </li>
        <li class="nav-item" @click="closeMobileMenu">
          <router-link to="/blog" class="nav-link">블로그</router-link>
        </li>
        <li class="nav-item" @click="closeMobileMenu">
          <router-link to="/about" class="nav-link">소개</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { watch } from 'vue'; // watch는 여전히 필요하지만 setup 밖에서 사용

export default {
  name: 'NavBar',
  data() {
    return {
      showIljuDropdown: false,
      showFinanceDropdown: false,
      isMobileMenuOpen: false // 모바일 메뉴 상태 추가
    };
  },
  created() {
    // created 훅에서 라우트 변경 감지
    this.$watch(() => this.$route.path, () => {
      // 라우트 변경 시 모바일 메뉴 닫기
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
        this.showIljuDropdown = false; // 드롭다운도 닫기
        this.showFinanceDropdown = false; // 드롭다운도 닫기
      }
    });
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      if (!this.isMobileMenuOpen) { // 메뉴 닫을 때 드롭다운도 닫기
        this.showIljuDropdown = false;
        this.showFinanceDropdown = false;
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      this.showIljuDropdown = false;
      this.showFinanceDropdown = false;
    },
    toggleIljuDropdown() {
      // 모바일 환경에서만 클릭으로 드롭다운 토글
      if (window.innerWidth <= 768) { // 예시 브레이크포인트
        this.showIljuDropdown = !this.showIljuDropdown;
        this.showFinanceDropdown = false; // 다른 드롭다운 닫기
      }
    },
    toggleFinanceDropdown() {
      // 모바일 환경에서만 클릭으로 드롭다운 토글
      if (window.innerWidth <= 768) { // 예시 브레이크포인트
        this.showFinanceDropdown = !this.showFinanceDropdown;
        this.showIljuDropdown = false; // 다른 드롭다운 닫기
      }
    }
  }
};
</script>

<style scoped src="../assets/navbar.css"></style>
