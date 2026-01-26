<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter for navigation

const router = useRouter(); // Initialize router

const loading = ref(true);
const error = ref(null);
const matchedSinsals = ref([]);

// Function to parse keyword:description pairs from text
const parseKeyDescPairs = (text) => {
  if (!text) return [];
  const lines = String(text).replace(/\r/g, '').split(/\n+/);
  const items = [];
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    const sepIdx = trimmedLine.indexOf(':') !== -1 ? trimmedLine.indexOf(':') : trimmedLine.indexOf('：');
    if (sepIdx > -1) {
      const keyword = trimmedLine.slice(0, sepIdx).trim();
      const description = trimmedLine.slice(sepIdx + 1).trim();
      if (keyword || description) {
        items.push({ keyword, description });
      }
    } else {
      items.push({ keyword: '', description: trimmedLine });
    }
  }
  return items;
};

onMounted(async () => {
  try {
    // 1. Fetch data from Google Sheet
    const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxIRbhPA2x3RoSW5j2zLHCUCrImIMkxtdoVz-oN7YALQxaLHjAl2H5og9Vb1mlEa3ZXJ2tBUK09wo9/pub?output=csv';
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error('Google Sheets에서 데이터를 불러오는데 실패했습니다.');
    }

    const csvText = await response.text();

    // 2. Parse CSV to extract sinsal data
    const sheetData = csvText.split('\n')
      .filter(row => row.trim() !== '') // Filter out empty rows
      .map(row => {
        // Use a regex to split by comma, but ignore commas inside double quotes
        const cells = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(cell => cell.replace(/^"|"$/g, ''));
        return {
          name: cells[0] ? cells[0].trim() : '',
          description: cells[1] ? cells[1].trim() : '',
          romance_title: cells[2] ? cells[2].trim() : '',
          romance_style: cells[3] ? cells[3].trim() : '',
          ideal_partner: cells[4] ? cells[4].trim() : '',
          career_title: cells[5] ? cells[5].trim() : '',
          career_style: cells[6] ? cells[6].trim() : '',
          recommended_jobs: cells[7] ? parseKeyDescPairs(cells[7]) : [],
          precautions: cells[8] ? parseKeyDescPairs(cells[8]) : []
        };
      })
      .filter(item => item.name); // Filter out items with no name
    
    // 3. Get sinsal results from sessionStorage
    const sinsalResultString = sessionStorage.getItem('sinsalResult');
    
    if (!sinsalResultString) {
      // If no sinsal results, redirect to analysis page
      router.push('/sinsal/analysis');
      return;
    }
    const sinsalResult = JSON.parse(sinsalResultString);
    
    const presentSinsals = sinsalResult.sals.filter(s => s.present);

    // 4. Match and set the final results
    matchedSinsals.value = presentSinsals.map(presentSinsal => {
      const matchingSheetItem = sheetData.find(sheetItem => sheetItem.name === presentSinsal.name);
      return {
        ...presentSinsal,
        description: matchingSheetItem ? matchingSheetItem.description : '설명을 찾을 수 없습니다.',
        romance_title: matchingSheetItem ? matchingSheetItem.romance_title : '',
        romance_style: matchingSheetItem ? matchingSheetItem.romance_style : '',
        ideal_partner: matchingSheetItem ? matchingSheetItem.ideal_partner : '',
        career_title: matchingSheetItem ? matchingSheetItem.career_title : '',
        career_style: matchingSheetItem ? matchingSheetItem.career_style : '',
        recommended_jobs: matchingSheetItem ? matchingSheetItem.recommended_jobs : [],
        precautions: matchingSheetItem ? matchingSheetItem.precautions : []
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

</script>

<template>
  <div class="detail-page">
    <div class="detail-header">
      <button @click="goBack" class="back-button">← 다시 분석하기</button>
    </div>

    <div class="main-content-wrapper"> <!-- New wrapper for conditional content -->
      <div v-if="loading" class="loading-state">
        <p>결과를 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else class="detail-content">
        <h1 class="ganji-title">나의 신살 분석 결과</h1>

        <div v-if="matchedSinsals.length > 0">
          <div v-for="sinsal in matchedSinsals" :key="sinsal.name" class="info-card">
            <div class="card-header">
              <span class="chapter-tag">신살</span>
              <h3 class="card-main-title">{{ sinsal.name }}</h3>
            </div>
            <p class="summary-text">{{ sinsal.description }}</p>
            <p class="reason">해당 글자: {{ sinsal.reason }}</p>

            <div v-if="sinsal.romance_title || sinsal.romance_style || sinsal.ideal_partner" class="sub-info-card">
              <div class="card-header">
                <span class="chapter-tag">연애</span>
                <h4 v-if="sinsal.romance_title" class="card-sub-title">{{ sinsal.romance_title }}</h4>
              </div>
              <p v-if="sinsal.romance_style">{{ sinsal.romance_style }}</p>
              <p v-if="sinsal.ideal_partner">이상형: {{ sinsal.ideal_partner }}</p>
            </div>

            <div v-if="sinsal.career_title || sinsal.career_style || sinsal.recommended_jobs.length > 0" class="sub-info-card">
              <div class="card-header">
                <span class="chapter-tag">직업</span>
                <h4 v-if="sinsal.career_title" class="card-sub-title">{{ sinsal.career_title }}</h4>
              </div>
              <p v-if="sinsal.career_style">{{ sinsal.career_style }}</p>
              <ul class="kv-list" v-if="sinsal.recommended_jobs.length > 0">
                <li v-for="(job, idx) in sinsal.recommended_jobs" :key="'job-'+idx" class="kv-item">
                  <strong v-if="job.keyword" class="kv-key">{{ job.keyword }}</strong>
                  <p class="kv-value">{{ job.description || job.keyword }}</p>
                </li>
              </ul>
            </div>

            <div v-if="sinsal.precautions.length > 0" class="sub-info-card">
              <div class="card-header">
                <span class="chapter-tag">주의사항</span>
                <h4 class="card-sub-title"></h4> <!-- This h4 can remain empty if needed -->
              </div>
              <ul class="kv-list">
                <li v-for="(precaution, idx) in sinsal.precautions" :key="'prec-'+idx" class="kv-item">
                  <strong v-if="precaution.keyword" class="kv-key">{{ precaution.keyword }}</strong>
                  <p class="kv-value">{{ precaution.description || precaution.keyword }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-else>
          <p>당신에게 해당하는 신살이 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ResultDetail.vue 고유 스타일 */
.detail-page {
  min-height: 100vh;
  padding: 2rem clamp(1.5rem, 4vw, 5rem);
  background: #ffffff;
  max-width: 600px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-start; /* Adjusted to align to start */
}

.main-content-wrapper { /* New style for the wrapper div */
  width: 100%;
}

.detail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.ganji-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #ff99a4;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

.summary-text {
  font-size: 1rem;
  color: rgba(54, 69, 79, 0.9);
  line-height: 1.7;
  margin: 0;
  padding: 1.5rem;
}

.info-card {
  width: 100%;
  background-color: #fcfcfc;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(54, 69, 79, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
}

.sub-info-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(54, 69, 79, 0.03);
  border: 1px dashed #f0f0f0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.chapter-tag {
  background-color: #ffdde2;
  color: #c54a7b;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.card-main-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #36454f;
  margin: 0;
}

.card-sub-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #555;
  margin: 0;
}

.kv-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kv-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #36454f;
}

.kv-key {
  font-weight: 600;
  color: #c54a7b;
  flex-shrink: 0;
}

.kv-value {
  flex-grow: 1;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #36454f;
}

.error-message {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .detail-page {
    padding: 1rem;
  }

  .detail-header {
    flex-direction: column;
  }

  .ganji-title {
    font-size: 2rem;
  }

  .summary-text {
    font-size: 0.9rem;
  }

  .info-card {
    padding: 1rem;
  }

  .card-main-title {
    font-size: 1.2rem;
  }

  .card-sub-title {
    font-size: 1rem;
  }

  .kv-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .kv-key {
    margin-bottom: 0.2rem;
  }
}

</style>

