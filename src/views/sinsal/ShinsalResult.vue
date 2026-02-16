<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(true);
const error = ref(null);
const matchedSinsals = ref([]);
const showCopyToast = ref(false);
const imageExtIndexById = ref({});
const hiddenImageById = ref({});
const imageExtensions = ['webp', 'png', 'jpg', 'jpeg'];

const parseCsvRows = (csvText) => {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  const normalizedText = String(csvText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    const nextChar = normalizedText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if (char === '\n' && !inQuotes) {
      row.push(cell);
      if (row.some(item => String(item).trim() !== '')) {
        rows.push(row);
      }
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some(item => String(item).trim() !== '')) {
    rows.push(row);
  }

  return rows.map((cells) => cells.map((value) => String(value || '').replace(/\ufeff/g, '').trim()));
};

const normalizeSinsalName = (name) => {
  return String(name || '')
    .replace(/\s+/g, '')
    .replace(/[()（）[\]{}]/g, '')
    .trim();
};

const parseDelimitedList = (text, delimiterPattern) => {
  if (!text) return [];
  return String(text)
    .split(delimiterPattern)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseTagList = (text) => {
  return parseDelimitedList(text, /[#,\n，]/);
};

const normalizeImageId = (id) => String(id || '').replace(/\ufeff/g, '').trim();

const getSinsalImageSrc = (id) => {
  const normalizedId = normalizeImageId(id);
  if (!normalizedId) return '';
  const extIndex = imageExtIndexById.value[normalizedId] || 0;
  const ext = imageExtensions[extIndex] || imageExtensions[0];
  return `/sinsal/${normalizedId}.${ext}`;
};

const handleSinsalImageError = (id) => {
  const normalizedId = normalizeImageId(id);
  if (!normalizedId) return;

  const currentIndex = imageExtIndexById.value[normalizedId] || 0;
  const nextIndex = currentIndex + 1;

  if (nextIndex < imageExtensions.length) {
    imageExtIndexById.value = {
      ...imageExtIndexById.value,
      [normalizedId]: nextIndex
    };
  } else {
    hiddenImageById.value = {
      ...hiddenImageById.value,
      [normalizedId]: true
    };
  }
};

const parseTextItems = (text) => {
  if (!text) return [];
  const chunks = String(text)
    .replace(/\r/g, '')
    .split(/\n+|[;；]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (chunks.length === 1) {
    const commaSeparated = parseDelimitedList(chunks[0], /[,，]/);
    if (commaSeparated.length > 1) {
      return commaSeparated.map((value) => ({ keyword: '', description: value }));
    }
  }

  return chunks.map((item) => {
    const colonIdx = item.includes(':') ? item.indexOf(':') : item.indexOf('：');
    if (colonIdx > -1) {
      return {
        keyword: item.slice(0, colonIdx).trim(),
        description: item.slice(colonIdx + 1).trim()
      };
    }
    return { keyword: '', description: item };
  });
};

onMounted(async () => {
  try {
    const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxIRbhPA2x3RoSW5j2zLHCUCrImIMkxtdoVz-oN7YALQxaLHjAl2H5og9Vb1mlEa3ZXJ2tBUK09wo9/pub?output=csv';
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error('Google Sheets에서 데이터를 불러오는데 실패했습니다.');
    }

    const csvText = await response.text();
    const rows = parseCsvRows(csvText);
    const dataRows = rows.slice(1); // 헤더 제외
    const sheetData = dataRows
      .map((cells) => {
        console.log(cells, 'cells');
        return {
          id: normalizeImageId(cells[0]),
          name: cells[1] || '',
          keyword: cells[2] || '',
          keyword_tags: parseDelimitedList(cells[2], /#/),
          description: cells[3] || '',
          romance_title: cells[4] || '',
          romance_style_text: cells[5] || '',
          romance_style_items: parseTextItems(cells[5]),
          ideal_partners: parseTagList(cells[6]),
          career_title: cells[7] || '',
          career_style_text: cells[8] || '',
          career_style_items: parseTextItems(cells[8]),
          recommended_jobs: parseDelimitedList(cells[9], /[,，]/),
          precaution_items: parseTextItems(cells[10]),
          keywords: parseDelimitedList(cells[11], /#/)
        };
      })
      .filter((item) => item.name);

      console.log(sheetData, 'sheetData');
      
    const sinsalResultString = sessionStorage.getItem('sinsalResult');
    if (!sinsalResultString) {
      router.push('/sinsal/analysis');
      return;
    }
    const sinsalResult = JSON.parse(sinsalResultString);
    const presentSinsals = sinsalResult.sals.filter(s => s.present);

  
    matchedSinsals.value = presentSinsals.map(presentSinsal => {
      const normalizedPresentName = normalizeSinsalName(presentSinsal.name);
      const matchingSheetItem = sheetData.find((sheetItem) => {
        const normalizedSheetName = normalizeSinsalName(sheetItem.name);
        return (
          normalizedSheetName === normalizedPresentName ||
          normalizedSheetName.includes(normalizedPresentName) ||
          normalizedPresentName.includes(normalizedSheetName)
        );
      });

      return {
        ...presentSinsal,
        id: matchingSheetItem?.id || '',
        keyword: matchingSheetItem?.keyword || '',
        keyword_tags: matchingSheetItem?.keyword_tags || [],
        description: matchingSheetItem?.description || '설명을 찾을 수 없습니다.',
        romance_title: matchingSheetItem?.romance_title || '',
        romance_style_text: matchingSheetItem?.romance_style_text || '',
        romance_style_items: matchingSheetItem?.romance_style_items || [],
        ideal_partners: matchingSheetItem?.ideal_partners || [],
        career_title: matchingSheetItem?.career_title || '',
        career_style_text: matchingSheetItem?.career_style_text || '',
        career_style_items: matchingSheetItem?.career_style_items || [],
        recommended_jobs: matchingSheetItem?.recommended_jobs || [],
        precaution_items: matchingSheetItem?.precaution_items || [],
        keywords: matchingSheetItem?.keywords || []
      };
    });
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const goBack = () => {
  router.push('/sinsal/analysis');
};


const shareResult = async () => {
  const currentUrl = window.location.href;

  try {
    await navigator.clipboard.writeText(currentUrl);
    showCopyToast.value = true;
    setTimeout(() => {
      showCopyToast.value = false;
    }, 2000);
  } catch {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      showCopyToast.value = true;
      setTimeout(() => {
        showCopyToast.value = false;
      }, 2000);
    } catch (fallbackError) {
      console.error('링크 복사 실패:', fallbackError);
      alert('링크 복사에 실패했습니다. 브라우저 주소창에서 직접 복사해주세요.');
    }
  }
};
</script>

<template>
  <div class="detail-page">
    <div class="detail-header">
      <button @click="goBack" class="back-button">← 다시 분석하기</button>
    </div>

    <div v-if="loading" class="loading-state">
      <p>결과를 불러오는 중...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="detail-content">
      <h1 class="hero__title center">나의 신살 분석 결과</h1>

      <div v-if="matchedSinsals.length > 0" class="results-wrapper">
        <div v-for="(sinsal, index) in matchedSinsals" :key="sinsal.name" class="sinsal-section">
          <h2 class="ganji-title">{{ index + 1 }}. {{ sinsal.name }}</h2>
          <div v-if="sinsal.id && !hiddenImageById[sinsal.id]" class="character-image-wrapper">
            <img
              :src="getSinsalImageSrc(sinsal.id)"
              :alt="`${sinsal.name} 이미지`"
              class="character-image"
              @error="handleSinsalImageError(sinsal.id)"
            />
          </div>
          <ul v-if="sinsal.keyword_tags.length > 0" class="kv-list tag-list keyword-tag-row">
            <li v-for="(tag, idx) in sinsal.keyword_tags" :key="'keyword-'+idx" class="kv-item">
              <span class="chapter-tag">#{{ tag }}</span>
            </li>
          </ul>
          <div class="info-card">
            <div class="card-header">
              <span class="chapter-tag">요약</span>
            </div>
            <p class="summary-text">{{ sinsal.description }}</p>
          </div>

          <div v-if="sinsal.romance_title || sinsal.romance_style_text || sinsal.ideal_partners.length > 0" class="info-card">
            <div class="card-header">
              <span class="chapter-tag">연애</span>
              <h3 v-if="sinsal.romance_title" class="card-main-title">{{ sinsal.romance_title }}</h3>
            </div>
            <p v-if="sinsal.romance_style_text" class="summary-text">{{ sinsal.romance_style_text }}</p>
            <ul class="kv-list tag-list" v-if="sinsal.ideal_partners.length > 0">
              <li v-for="(partner, idx) in sinsal.ideal_partners" :key="'ideal-'+idx" class="kv-item">
                <p class="chapter-tag">#{{ partner }}</p>
              </li>
            </ul>
          </div>

          <div v-if="sinsal.career_title || sinsal.career_style_text || sinsal.recommended_jobs.length > 0" class="info-card">
            <div class="card-header">
              <span class="chapter-tag">직업</span>
               <h3 v-if="sinsal.career_title" class="card-main-title">{{ sinsal.career_title }}</h3>
            </div>
            <p v-if="sinsal.career_style_text" class="summary-text">{{ sinsal.career_style_text }}</p>
            <ul class="kv-list tag-list" v-if="sinsal.recommended_jobs.length > 0">
              <li v-for="(job, idx) in sinsal.recommended_jobs" :key="'job-'+idx" class="kv-item">
                <p class="chapter-tag">{{ job }}</p>
              </li>
            </ul>
          </div>

          <div v-if="sinsal.precaution_items.length > 0" class="info-card">
            <div class="card-header">
              <span class="chapter-tag">주의사항</span>
            </div>
            <ul class="kv-list">
              <li v-for="(item, idx) in sinsal.precaution_items" :key="'prec-'+idx" class="kv-item">
                <strong v-if="item.keyword" class="kv-key">{{ item.keyword }}</strong>
                <p class="kv-value">{{ item.description || item.keyword }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else class="info-card">
         <p class="center">당신에게 해당하는 신살이 없습니다.</p>
      </div>

      <div class="share-section">
        <button @click="shareResult" class="share-button">
          <span class="share-icon">🔗</span>
          결과 공유하기
        </button>
        <div class="bottom-action-buttons">
          <button @click="goBack" class="back-button">← 다시 분석하기</button>
        </div>
      </div>
    </div>

    <div v-if="showCopyToast" class="toast-message">
      링크가 클립보드에 복사되었습니다!
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/shared.css';

.detail-page {
  min-height: 100vh;
  padding: 2rem clamp(1.5rem, 4vw, 5rem);
  background: #ffffff;
  max-width: 600px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 2rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ganji-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #ff99a4;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

.ganji-intro {
  font-size: 1.1rem;
  color: #36454f;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

.keyword-tag-row {
  margin: 0;
  text-align: center;
}

.character-image-wrapper {
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  margin: 0.5rem auto 1rem;
}

.character-image {
  width: 100%;
  height: auto;
  max-width: 250px;
  object-fit: contain;
}

.results-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.sinsal-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tag-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
}

.tag-list .kv-item {
  display: inline-flex;
  flex: 0 0 auto;
  width: auto;
}

.tag-list .chapter-tag {
  display: inline-block;
  width: auto;
  margin: 0;
}

.summary-text {
  font-size: 1rem;
  color: rgba(54, 69, 79, 0.9);
  line-height: 1.7;
  margin: 0;
  padding: 1.5rem;
}

.share-section {
  width: 100%;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(54, 69, 79, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.share-section .share-button {
  width: 100%;
  border-radius: 16px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.bottom-action-buttons {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.bottom-action-buttons .back-button,
.bottom-action-buttons .home-button {
  width: auto;
  min-width: 140px;
  justify-content: center;
}

.share-icon {
  font-size: 1.2rem;
}

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

.loading-state, .error-message {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-primary);
}

.error-message {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .detail-page {
    padding: 1rem;
  }

  .share-button {
    font-size: 1rem;
    padding: 0.9rem 1.5rem;
  }
}
</style>

