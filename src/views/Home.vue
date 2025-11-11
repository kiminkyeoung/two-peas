<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const calendarOptions = ['양력', '음력', '음력(윤달)']

const selectedCalendar = ref(calendarOptions[0])
const birthDate = ref('')
const birthHour = ref('')
const birthMinute = ref('')
const isTimeUnknown = ref(false)

const hours = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, index) => index.toString().padStart(2, '0'))

const ganjiList = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥",
]

// 이미지 슬라이드 관련
const currentImageIndex = ref(1)
const isImageTransitioning = ref(false)
let slideInterval = null

const getImageUrl = (index) => {
  return new URL(`../assets/ganji/${index}.png`, import.meta.url).href
}

const getRandomImageIndex = () => {
  return Math.floor(Math.random() * 60) + 1
}

const changeImage = () => {
  isImageTransitioning.value = true
  
  setTimeout(() => {
    // 이전 이미지와 다른 이미지가 나올 때까지 랜덤 선택
    let newIndex = getRandomImageIndex()
    while (newIndex === currentImageIndex.value) {
      newIndex = getRandomImageIndex()
    }
    currentImageIndex.value = newIndex
    setTimeout(() => {
      isImageTransitioning.value = false
    }, 50)
  }, 300)
}

const handleImageError = (event) => {
  // 이미지 로드 실패 시 기본 이미지(1.png)로 변경
  event.target.src = new URL(`../assets/ganji/1.png`, import.meta.url).href
}

onMounted(() => {
  // 초기 랜덤 이미지 설정
  currentImageIndex.value = getRandomImageIndex()
  
  // 3초마다 랜덤 이미지로 변경
  slideInterval = setInterval(() => {
    changeImage()
  }, 3000)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})

import { Solar } from 'lunar-javascript';

watch(isTimeUnknown, (checked) => {
  if (checked) {
    birthHour.value = ''
    birthMinute.value = ''
  }
})

const isTimeDisabled = computed(() => isTimeUnknown.value)

const setCalendar = (option) => {
  selectedCalendar.value = option
}

const handleSubmit = () => {
  if (!birthDate.value) {
    alert("생년월일을 입력해주세요!");
    return;
  }

  const dateStr = birthDate.value.toString();
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6));
  const day = parseInt(dateStr.slice(6, 8));

  // ✅ undefined 방지: 시간 기본값 처리
  const hour = isTimeUnknown.value
    ? 12
    : birthHour.value !== '' && birthHour.value !== undefined
    ? parseInt(birthHour.value)
    : 12;

  const minute = isTimeUnknown.value
    ? 0
    : birthMinute.value !== '' && birthMinute.value !== undefined
    ? parseInt(birthMinute.value)
    : 0;

  try {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const timePillar = lunar.getTimeInGanZhi();

    console.log("연주:", yearPillar);
    console.log("월주:", monthPillar);
    console.log("일주:", dayPillar);
    console.log("시주:", timePillar);

    // ✅ 천간/지지 분리
    const heavenlyStem = dayPillar[0]; // 예: 丙
    const earthlyBranch = dayPillar[1]; // 예: 戌

    // ✅ 천간 → 색상 매핑
    const stemToColor = {
      '甲': '푸른', '乙': '푸른',
      '丙': '빨간', '丁': '빨간',
      '戊': '노란', '己': '노란',
      '庚': '흰',   '辛': '흰',
      '壬': '검은', '癸': '검은'
    };

    // ✅ 지지 → 동물 매핑
    const branchToAnimal = {
      '子': '쥐', '丑': '소', '寅': '호랑이', '卯': '토끼',
      '辰': '용', '巳': '뱀', '午': '말', '未': '양',
      '申': '원숭이', '酉': '닭', '戌': '개', '亥': '돼지'
    };

    const color = stemToColor[heavenlyStem] || '';
    const animal = branchToAnimal[earthlyBranch] || '알 수 없음';

    const coloredAnimal = `${color}${animal}`;
    
    // 일주(dayPillar)의 인덱스를 찾아서 ID 계산
    const ganjiIndex = ganjiList.indexOf(dayPillar);
    const ganjiId = ganjiIndex !== -1 ? ganjiIndex + 1 : null;
    
    // 결과를 sessionStorage에 저장하고 상세 페이지로 이동
    const result = {
      dayPillar,
      coloredAnimal,
      yearPillar,
      monthPillar,
      timePillar
    };
    
    sessionStorage.setItem('birthResult', JSON.stringify(result));
    
    // 일주 ID가 있으면 상세 페이지로, 없으면 목록 페이지로 이동
    if (ganjiId) {
      router.push(`/result/${ganjiId}`);
    } else {
      router.push('/result');
    }

  } catch (error) {
    console.error("만세력 계산 중 오류:", error);
    alert("입력값을 다시 확인해주세요.");
  }
};
</script>

<template>
  <div class="landing palette-modern">
    <section class="hero">
      <div class="hero__intro center">
        <h1 class="hero__title">나의 일주 동물 </h1>
        <div class="image-slider-wrapper">
          <img 
            :src="getImageUrl(currentImageIndex)" 
            :alt="`간지 ${currentImageIndex}`"
            width="300"
            class="slider-image"
            :class="{ 'fade-out': isImageTransitioning }"
            @error="handleImageError"
          />
        </div>
        <p class="hero__subtitle">
          나만의 사주를 기반으로 귀여운 3D 친구를 만나보세요.<br/>생년월일을 입력하면 일주 동물을 찾아드릴게요.
        </p>
      </div>

      <form class="birth-form" @submit.prevent="handleSubmit">
        <div class="field-group">
          <span class="field-label">양 / 음력</span>
          <div class="toggle-group">
            <button
              v-for="option in calendarOptions"
              :key="option"
              type="button"
              class="toggle-button"
              :class="{ 'toggle-button--active': selectedCalendar === option }"
              @click="setCalendar(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="birth-date">생년월일</label>
          <input
            id="birth-date"
            v-model="birthDate"
            type="number"
            placeholder="20250101"
            class="input-control"
            required
          />
        </div>

        <div class="field-group">
          <span class="field-label">태어난 시</span>
          <div class="time-row">
            <select
              v-model="birthHour"
              class="input-control time-select"
              :disabled="isTimeDisabled"
              required
            >
              <option value="" disabled>시</option>
              <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
            </select>

            <select
              v-model="birthMinute"
              class="input-control time-select"
              :disabled="isTimeDisabled"
              required
            >
              <option value="" disabled>분</option>
              <option v-for="minute in minutes" :key="minute" :value="minute">{{ minute }}</option>
            </select>

            <label class="unknown-box">
              <input type="checkbox" v-model="isTimeUnknown" />
              <span>모름</span>
            </label>
          </div>
        </div>

        <button class="cta-button" type="submit">확인하기</button>
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

.hero,
.hero-visual {
  position: relative;
  z-index: 1;
}

.hero__intro {
  max-width: 520px;
  margin: 0 auto;
}

.hero__kicker {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-main-pink);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.hero__title {
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 1.1;
  font-weight: 800;
  margin: 0 0 1rem;
  color: var(--color-text-primary);
}

.hero__title--accent {
  display: block;
  color: var(--color-main-pink);
}

.hero__subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(54, 69, 79, 0.8);
  margin-bottom: 2.5rem;
}

.image-slider-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-image {
  width: 300px;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  transition: opacity 0.3s ease-in-out;
  opacity: 1;
}

.slider-image.fade-out {
  opacity: 0;
}

.birth-form {
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

.toggle-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.toggle-button {
  border: none;
  padding: 0.65rem 1.3rem;
  border-radius: 999px;
  background: rgba(255, 153, 164, 0.18);
  color: var(--color-text-primary);
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.toggle-button:hover {
  background: rgba(255, 153, 164, 0.3);
}

.toggle-button--active {
  background: var(--color-main-pink);
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(255, 153, 164, 0.3);
}

.input-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(54, 69, 79, 0.1);
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-control:focus {
  outline: none;
  border-color: var(--color-main-pink);
  box-shadow: 0 0 0 4px rgba(255, 153, 164, 0.15);
}

.time-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.time-select {
  max-width: 110px;
}

.unknown-box {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: rgba(54, 69, 79, 0.75);
  padding: 0.55rem 0.9rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(54, 69, 79, 0.08);
}

.unknown-box input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-main-pink);
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

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-visual__card {
  position: relative;
  background: radial-gradient(circle at top, #fff4f8 0%, #ffffff 65%);
  border-radius: 40px;
  width: clamp(280px, 40vw, 420px);
  aspect-ratio: 1;
  box-shadow: 0 40px 80px rgba(54, 69, 79, 0.14);
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 4vw, 3rem);
}

.hero-visual__glow {
  position: absolute;
  inset: 15%;
  background: radial-gradient(circle, rgba(255, 153, 164, 0.35) 0%, rgba(242, 231, 255, 0.15) 55%, rgba(255, 255, 255, 0) 100%);
  filter: blur(4px);
}

.hero-visual__character {
  width: 100%;
  height: 100%;
  max-width: 240px;
  background: url('/character-tiger.png') center/contain no-repeat, linear-gradient(180deg, #ffe0e8 0%, #f2e7ff 100%);
  border-radius: 32px;
  box-shadow: inset 0 12px 30px rgba(255, 255, 255, 0.35);
}

.hero-visual__caption {
  position: absolute;
  bottom: clamp(1rem, 3vw, 1.75rem);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(54, 69, 79, 0.8);
  color: #ffffff;
  padding: 0.55rem 1.5rem;
  border-radius: 999px;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  box-shadow: 0 12px 30px rgba(54, 69, 79, 0.28);
}

@media (max-width: 768px) {
  .hero__title {
    text-align: center;
  }

  .hero__intro,
  .birth-form {
    text-align: center;
  }

  .toggle-group,
  .time-row {
    justify-content: center;
  }

  .image-slider-wrapper {
    width: 250px;
    height: 250px;
  }

  .slider-image {
    width: 250px;
    max-height: 250px;
  }
}
</style>

