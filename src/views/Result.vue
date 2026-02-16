<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSajuPillars, checkSinsal } from '@/utils/sinsalLogic'

const router = useRouter()

const ganjiList = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥",
]

const userResult = ref(null)

const stemToColor = {
  '甲': '푸른', '乙': '푸른',
  '丙': '붉은', '丁': '붉은',
  '戊': '황금', '己': '황금',
  '庚': '흰',   '辛': '흰',
  '壬': '검은', '癸': '검은'
}

const branchToAnimal = {
  '子': '쥐', '丑': '소', '寅': '호랑이', '卯': '토끼',
  '辰': '용', '巳': '뱀', '午': '말', '未': '양',
  '申': '원숭이', '酉': '닭', '戌': '개', '亥': '돼지'
}

// 파스텔 색상 매핑
const colorToPastelBg = {
  '푸른': { bg: '#E3F2FD', circle: '#BBDEFB', button: '#90CAF9' },
  '붉은': { bg: '#FFE0E6', circle: '#FFB3C1', button: '#FF8FA3' },
  '황금': { bg: '#FFF9C4', circle: '#FFF59D', button: '#FFF176' },
  '흰': { bg: '#F5F5F5', circle: '#E0E0E0', button: '#BDBDBD' },
  '검은': { bg: '#ECEFF1', circle: '#CFD8DC', button: '#90A4AE' }
}

const colorToClass = {
  '푸른': 'color-blue',
  '붉은': 'color-red',
  '황금': 'color-yellow',
  '흰': 'color-white',
  '검은': 'color-black'
}

const ganjiInfo = computed(() => {
  return ganjiList.map((ganji, index) => {
    const heavenlyStem = ganji[0]
    const earthlyBranch = ganji[1]
    const color = stemToColor[heavenlyStem] || ''
    const animal = branchToAnimal[earthlyBranch] || '알 수 없음'
    const coloredAnimal = `${color}${animal}`
    const colorClass = colorToClass[color] || ''
    const isUserGanji = userResult.value && userResult.value.dayPillar === ganji
    const pastelColors = colorToPastelBg[color] || { bg: '#F5F5F5', circle: '#E0E0E0', button: '#BDBDBD' }
    
    return {
      ganji,
      color,
      animal,
      coloredAnimal,
      colorClass,
      isUserGanji,
      pastelColors,
      number: index + 1
    }
  })
})

const getImageUrl = (index) => {
  return new URL(`../assets/ganji/${index}.webp`, import.meta.url).href
}

const goHome = () => {
  router.push('/')
}

const goToDetail = (id) => {
  router.push(`/result/${id}`)
}

onMounted(() => {
  const storedResult = sessionStorage.getItem('birthResult')
  if (storedResult) {
    userResult.value = JSON.parse(storedResult)
  } else {
    router.push('/')
  }
})
</script>

<template>
  <div class="result-page">
    <div class="result-header">
      <button @click="goHome" class="back-button">← 돌아가기</button>
      <h1 class="result-title">60일주 동물 도감</h1>
    </div>

    <div class="ganji-grid">
      <div
        v-for="(info, index) in ganjiInfo"
        :key="index"
        class="ganji-card"
        :class="{ 'user-ganji': info.isUserGanji }"
        :style="{ 
          backgroundColor: info.pastelColors.bg,
          '--circle-color': info.pastelColors.circle,
          '--button-color': info.pastelColors.button
        }"
        @click="goToDetail(index + 1)"
      >
        <div class="card-image-wrapper">
          <div class="card-circle">
            <img 
              :src="getImageUrl(info.number)" 
              :alt="info.coloredAnimal"
              class="card-image"
              @error="(e) => e.target.src = getImageUrl(1)"
            />
          </div>
        </div>
        <div class="card-content">
          <div class="ganji-text">{{ info.ganji }}</div>
          <div class="ganji-animal">{{ info.coloredAnimal }}</div>
          <div class="ganji-number">No. {{ info.number }}</div>
        </div>
        <button class="card-button" @click.stop="goToDetail(index + 1)">
          상세보기
        </button>
        <div v-if="info.isUserGanji" class="user-badge">나의 일주</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Result.vue 고유 스타일 */
.result-page {
  min-height: 100vh;
  padding: 2rem clamp(1.5rem, 4vw, 5rem);
  background: linear-gradient(180deg, #fff8fb 0%, #fdf7ff 45%, #ffffff 100%);
}

.result-header {
  max-width: 1200px;
  margin: 0 auto 3rem;
  text-align: center;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: clamp(1.5rem, 4vw, 5rem);
}

.result-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 2rem 0 1.5rem;
}

.ganji-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem 0;
}

.ganji-card {
  position: relative;
  border-radius: 24px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.ganji-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.ganji-card.user-ganji {
  border: 3px solid #ff99a4;
  box-shadow: 0 8px 30px rgba(255, 153, 164, 0.3);
}

.card-image-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background-color: var(--circle-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.card-content {
  text-align: center;
  width: 100%;
  margin-bottom: 1.5rem;
}

.ganji-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: #36454f;
  margin-bottom: 0.5rem;
}

.ganji-animal {
  font-size: 1rem;
  font-weight: 600;
  color: #36454f;
  margin-bottom: 0.5rem;
}

.ganji-number {
  font-size: 0.85rem;
  color: rgba(54, 69, 79, 0.6);
  font-weight: 500;
}

.card-button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background-color: var(--button-color);
  color: #36454f;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff99a4;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 153, 164, 0.4);
}

@media (max-width: 768px) {
  .ganji-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }

  .ganji-card {
    padding: 1.5rem 1rem;
  }

  .card-circle {
    width: 150px;
    height: 150px;
  }

  .card-image {
    width: 120px;
    height: 120px;
  }

  .ganji-text {
    font-size: 1.5rem;
  }

  .ganji-animal {
    font-size: 0.9rem;
  }

  .back-button {
    position: relative;
    top: 0;
    left: 0;
    margin-bottom: 1rem;
  }
}
</style>
