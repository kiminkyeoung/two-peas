<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdfAUB2EQpQJLWSIhUnAD9wP5QycKQiFAoGqL9M7WWvc9UZAw1wNvvO2HhawM35rx4eI0QNIfmphWz/pub?output=csv'
const router = useRouter()
const route = useRoute()

const ganjiList = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥",
]

const stemToColor = {
  '甲': '푸른', '乙': '푸른',
  '丙': '빨간', '丁': '빨간',
  '戊': '노란', '己': '노란',
  '庚': '흰',   '辛': '흰',
  '壬': '검은', '癸': '검은'
}

const branchToAnimal = {
  '子': '쥐', '丑': '소', '寅': '호랑이', '卯': '토끼',
  '辰': '용', '巳': '뱀', '午': '말', '未': '양',
  '申': '원숭이', '酉': '닭', '戌': '개', '亥': '돼지'
}

// 일주별 성격 정보 (예시 데이터 - 실제로는 더 상세한 정보를 넣을 수 있습니다)
const personalityData = {
  '甲子': {
    title: '푸른 쥐',
    personality: '활발하고 적극적인 성격으로, 새로운 도전을 즐깁니다. 사교적이며 리더십이 뛰어납니다.',
    strengths: ['적극성', '리더십', '사교성'],
    weaknesses: ['성급함', '경쟁심']
  },
  '乙丑': {
    title: '푸른 소',
    personality: '차분하고 인내심이 강하며, 꾸준한 노력으로 목표를 달성합니다.',
    strengths: ['인내심', '꾸준함', '신뢰성'],
    weaknesses: ['고집', '보수적']
  }
  // 나머지 58개도 동일한 구조로 추가 가능
}

const ganjiId = computed(() => {
  const id = parseInt(route.params.id)
  if (id < 1 || id > 60) {
    return null
  }
  return id
})

const currentGanji = computed(() => {
  if (!ganjiId.value) return null
  return ganjiList[ganjiId.value - 1]
})

const ganjiInfo = computed(() => {
  if (!currentGanji.value) return null
  
  const heavenlyStem = currentGanji.value[0]
  const earthlyBranch = currentGanji.value[1]
  const color = stemToColor[heavenlyStem] || ''
  const animal = branchToAnimal[earthlyBranch] || '알 수 없음'
  const coloredAnimal = `${color}${animal}`
  
  return {
    ganji: currentGanji.value,
    color,
    animal,
    coloredAnimal,
    number: ganjiId.value
  }
})

const personality = computed(() => {
  if (!currentGanji.value) return null
  
  // Google Sheets에서 가져온 데이터 우선 사용
  const sheetData = allPersonalityData.value[currentGanji.value]
  if (sheetData) {
    return {
      title: sheetData.title || ganjiInfo.value?.coloredAnimal || '',
      intro: sheetData.personality || '',
      strengths: sheetData.strengths || [],
      weaknesses: sheetData.weaknesses || [],
      traits: sheetData.traits || [] // 성격 특성 4줄 (CSV에서 추가 컬럼으로 받아올 수 있음)
    }
  }
  
  // 기본 데이터 사용
  return personalityData[currentGanji.value] || {
    title: ganjiInfo.value?.coloredAnimal || '',
    intro: `${ganjiInfo.value?.coloredAnimal || ''}의 성격을 가진 사람입니다.`,
    strengths: ['특성 1', '특성 2', '특성 3'],
    weaknesses: ['개선점 1', '개선점 2'],
    traits: [
      '상세한 성격 정보는 추후 업데이트될 예정입니다.',
      '추가 정보가 곧 제공될 예정입니다.',
      '더 많은 정보를 확인하세요.',
      '지속적으로 업데이트 중입니다.'
    ]
  }
})

const goBack = () => {
  router.push('/result')
}

const goHome = () => {
  router.push('/')
}

const getImageUrl = (id) => {
  try {
    // Vite에서 동적 import 사용
    return new URL(`../../assets/ganji/${id}.webp`, import.meta.url).href
  } catch {
    // 실패 시 기본 이미지
    return new URL(`../../assets/ganji/1.webp`, import.meta.url).href
  }
}

const handleImageError = (event) => {
  // 이미지 로드 실패 시 기본 이미지 사용
  event.target.src = new URL(`../../assets/ganji/1.webp`, import.meta.url).href
}

const shareResult = async () => {
  const currentUrl = window.location.href
  
  try {
    // 클립보드에 URL 복사
    await navigator.clipboard.writeText(currentUrl)
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2000)
  } catch (error) {
    // 클립보드 API가 실패하면 fallback 방법 사용
    try {
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      showCopyToast.value = true
      setTimeout(() => {
        showCopyToast.value = false
      }, 2000)
    } catch (fallbackError) {
      console.error('링크 복사 실패:', fallbackError)
      alert('링크 복사에 실패했습니다. 브라우저 주소창에서 직접 복사해주세요.')
    }
  }
}


const isLoadingData = ref(true) // 데이터 로딩 상태
const allPersonalityData = ref({}) // 스프레드시트에서 가져온 60개 일주의 성격 데이터
const errorMessage = ref('') // 에러 메시지
const showCopyToast = ref(false) // 복사 성공 토스트 표시 여부

const fetchPersonalityData = async () => {
  isLoadingData.value = true
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL)
    console.log(response);
    
    if (!response.ok) {
        throw new Error('데이터 로드 실패: 구글 시트 URL을 확인해야 한다.')
    }
    const csvText = await response.text()
    
    console.log(csvText);
    

    // CSV 파싱 - 현재 간지 ID에 해당하는 데이터만 가져오기
    const lines = csvText.trim().split('\n').slice(1) // 헤더(첫 줄) 제외
    const targetNumber = ganjiId.value // 현재 간지 ID
    
    // 현재 간지에 해당하는 라인만 찾기
    let foundData = null
    
    for (const line of lines) {
        // 정규식을 사용하여 쉼표로 분리하되, 따옴표 안의 쉼표는 무시한다.
        const values = line.match(/(?:"[^"]*"|[^,])+/g).map(v => v.replace(/^"|"$/g, '').trim())

        // 스프레드시트 구조: number, ganji, title, personality, strengths, weaknesses, detail
        if (values.length >= 7) {
            const number = parseInt(values[0])
            
            // 현재 간지 ID와 일치하는 데이터만 처리
            if (number === targetNumber && number >= 1 && number <= 60) {
                const ganji = values[1]

                // strengths: "#뛰어난 리더십, #활발함, #사교성" 형태를 배열로 변환
                const strengthsStr = values[4] || ''
                const strengths = strengthsStr
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s && s.startsWith('#'))
                    .map(s => s.replace(/^#/, '')) // # 제거
                
                // weaknesses: "#성급함, #다혈질, #강한 고집" 형태를 배열로 변환
                const weaknessesStr = values[5] || ''
                const weaknesses = weaknessesStr
                    .split(',')
                    .map(w => w.trim())
                    .filter(w => w && w.startsWith('#'))
                    .map(w => w.replace(/^#/, '')) // # 제거
                
                // detail: 긴 문단을 문장 단위로 나눠서 4줄로 표시
                const detailStr = values[6] || ''
                
                // 먼저 줄바꿈으로 분리 시도 (CSV에서 이미 줄바꿈으로 구분되어 있을 수 있음)
                let detailSentences = []
                
                if (detailStr.includes('\n')) {
                    // 줄바꿈이 있으면 줄바꿈으로 분리
                    detailSentences = detailStr
                        .split(/\n+/)
                        .map(s => s.trim())
                        .filter(s => s.length > 0)
                } else {
                    // 줄바꿈이 없으면 문장 구분자로 분리 (한국어 마침표 포함)
                    detailSentences = detailStr
                        .split(/[.!?。]\s*/) // 마침표 뒤 공백이 없어도 분리, 한국어 마침표 포함
                        .map(s => s.trim())
                        .filter(s => s.length > 0)
                    
                    // 문장이 하나만 있거나 너무 길면 적절히 나누기
                    if (detailSentences.length === 1 && detailSentences[0].length > 100) {
                        // 긴 문장을 쉼표나 공백으로 나누기
                        const longSentence = detailSentences[0]
                        const parts = longSentence.split(/[，.]\s*/) // 쉼표로 분리
                        if (parts.length > 1) {
                            detailSentences = parts.map(s => s.trim()).filter(s => s.length > 0)
                        } else {
                            // 쉼표가 없으면 적절한 길이로 나누기 (약 50자씩)
                            const chunkSize = 50
                            detailSentences = []
                            for (let i = 0; i < longSentence.length; i += chunkSize) {
                                const chunk = longSentence.slice(i, i + chunkSize).trim()
                                if (chunk) detailSentences.push(chunk)
                            }
                        }
                    }
                }
                
                const traits = detailSentences.slice(0, 4)
                
                foundData = {
                    [ganji]: {
                        title: values[2] || '',
                        personality: values[3] || '',
                        strengths: strengths.length > 0 ? strengths : ['특성 1', '특성 2', '특성 3'],
                        weaknesses: weaknesses.length > 0 ? weaknesses : ['개선점 1', '개선점 2'],
                        traits: traits.length > 0 ? traits : [
                            values[3] || '상세한 성격 정보가 곧 제공될 예정입니다.',
                            '추가 정보를 확인하세요.',
                            '지속적으로 업데이트 중입니다.',
                            '더 많은 정보를 기대해주세요.'
                        ]
                    }
                }
                
                break
            }
        }
    }
    
    if (foundData) {
        allPersonalityData.value = foundData
    }

  } catch (error) {
    errorMessage.value = `데이터 로드 오류: ${error.message}. (URL을 확인하거나 CSV가 올바른 형식인지 확인해야 한다.)`
  } finally {
    isLoadingData.value = false
  }
}

onMounted(() => {
  if (!ganjiId.value) {
    router.push('/result')
  }
  fetchPersonalityData()
})

// 메타 태그 동적 업데이트
watch([personality, ganjiInfo, ganjiId], () => {
  if (personality.value && ganjiInfo.value && ganjiId.value) {
    const title = `${personality.value.title || ganjiInfo.value.coloredAnimal} - 일주 상세 정보 | Two Peas`
    const description = `${personality.value.title || ganjiInfo.value.coloredAnimal}의 상세한 성격 정보와 특징을 확인해보세요. ${personality.value.intro || ''}`
    
    // 해당 간지 이미지 URL 생성
    const ganjiImageUrl = `https://twopeas.co.kr/ganji/${ganjiId.value}.webp`
    
    document.title = title
    
    // 메타 태그 업데이트
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      
      element.setAttribute('content', content)
    }
    
    updateMetaTag('description', description)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', ganjiImageUrl, true)
    updateMetaTag('og:image:width', '1200', true)
    updateMetaTag('og:image:height', '1200', true)
    updateMetaTag('twitter:title', title, true)
    updateMetaTag('twitter:description', description, true)
    updateMetaTag('twitter:image', ganjiImageUrl, true)
    
    const currentUrl = window.location.href
    updateMetaTag('og:url', currentUrl, true)
    updateMetaTag('twitter:url', currentUrl, true)
    
    // Canonical URL 업데이트
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', currentUrl)
  }
}, { immediate: true })
</script>

<template>
  <div class="detail-page" v-if="ganjiInfo">
    <div class="detail-header">
      <button @click="goBack" class="back-button">← 목록으로</button>
      <button @click="goHome" class="home-button">홈으로</button>
    </div>

    <div class="detail-content" v-if="!isLoadingData">
      <!-- 간지 제목 -->
      <h1 class="ganji-title">{{ personality?.title || ganjiInfo.coloredAnimal }}</h1>
      
      <!-- 한줄 소개 -->
      <p class="ganji-intro">{{ personality?.intro || personality?.personality || '' }}</p>

      <!-- 캐릭터 이미지 -->
      <div class="character-image-wrapper">
        <img :src="getImageUrl(ganjiId)" :alt="ganjiInfo.coloredAnimal" class="character-image" 
             @error="handleImageError" />
      </div>

      <!-- 장점 해시태그 -->
      <div class="hashtag-section">
        <h3 class="hashtag-label">장점</h3>
        <div class="hashtag-container">
          <span v-for="(strength, index) in personality?.strengths" :key="index" class="hashtag hashtag-strength">
            #{{ strength }}
          </span>
        </div>
      </div>

      <!-- 개선점 해시태그 -->
      <div class="hashtag-section">
        <h3 class="hashtag-label">개선점</h3>
        <div class="hashtag-container">
          <span v-for="(weakness, index) in personality?.weaknesses" :key="index" class="hashtag hashtag-weakness">
            #{{ weakness }}
          </span>
        </div>
      </div>

      <!-- 성격 특성 블릿 리스트 -->
      <div class="traits-section">
        <ul class="traits-list">
          <li v-for="(trait, index) in personality?.traits" :key="index" class="trait-item">
            {{ trait }}
          </li>
        </ul>
      </div>

      <!-- 공유하기 버튼 -->
      <div class="share-section">
        <button @click="shareResult" class="share-button">
          <span class="share-icon">🔗</span>
          결과 공유하기
        </button>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoadingData" class="loading-state">
      <p>데이터를 불러오는 중...</p>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 복사 성공 토스트 -->
    <div v-if="showCopyToast" class="toast-message">
      링크가 클립보드에 복사되었습니다!
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding: 2rem clamp(1.5rem, 4vw, 5rem);
  background: #ffffff;
  max-width: 800px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.back-button,
.home-button {
  background: rgba(255, 153, 164, 0.2);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.back-button:hover,
.home-button:hover {
  background: rgba(255, 153, 164, 0.35);
  transform: translateX(-3px);
}

.home-button:hover {
  transform: translateX(3px);
}

.detail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* 간지 제목 */
.ganji-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #ff99a4;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

/* 한줄 소개 */
.ganji-intro {
  font-size: 1.1rem;
  color: #36454f;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

/* 캐릭터 이미지 */
.character-image-wrapper {
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.character-image {
  width: 100%;
  height: auto;
  max-width: 300px;
  object-fit: contain;
}

/* 해시태그 섹션 */
.hashtag-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hashtag-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #36454f;
  margin: 0;
}

.hashtag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hashtag {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 600;
}

.hashtag-strength {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
}

.hashtag-weakness {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

/* 성격 특성 블릿 리스트 */
.traits-section {
  width: 100%;
  margin-top: 1rem;
}

.traits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trait-item {
  padding-left: 1.5rem;
  position: relative;
  font-size: 1rem;
  line-height: 1.6;
  color: #36454f;
}

.trait-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #ff99a4;
  font-weight: bold;
  font-size: 1.2rem;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #36454f;
}

/* 에러 메시지 */
.error-message {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

/* 공유하기 버튼 */
.share-section {
  width: 100%;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(54, 69, 79, 0.1);
}

.share-button {
  width: 100%;
  background: linear-gradient(135deg, #ff99a4 0%, #ffb6c5 100%);
  border: none;
  border-radius: 16px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 153, 164, 0.3);
}

.share-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 153, 164, 0.4);
}

.share-button:active {
  transform: translateY(0);
}

.share-icon {
  font-size: 1.2rem;
}

/* 토스트 메시지 */
.toast-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(54, 69, 79, 0.95);
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .detail-page {
    padding: 1.5rem;
  }

  .detail-header {
    flex-direction: column;
  }

  .ganji-title {
    font-size: 2rem;
  }

  .ganji-intro {
    font-size: 1rem;
  }

  .character-image {
    max-width: 250px;
  }

  .hashtag {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }

  .share-button {
    font-size: 1rem;
    padding: 0.9rem 1.5rem;
  }
}
</style>

