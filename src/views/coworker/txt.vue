<script setup>
import { ref, onMounted } from 'vue'
import { setSeoMeta } from '../../utils/seo.js'

const textContent = ref('')
const fileName = ref('data.csv')


const ensureCsvExtension = (name) => {
  if (!name) return 'data.csv'
  return name.toLowerCase().endsWith('.csv') ? name : `${name}.csv`
}

const downloadCsv = () => {
  const content = textContent.value ?? ''
  const bom = '\uFEFF'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = ensureCsvExtension(fileName.value.trim())
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// SEO 메타 태그 설정 (공통 함수 사용)
onMounted(() => {
  setSeoMeta({
    title: 'TXT → CSV 변환 - Two Peas',
    description: '텍스트(TXT)를 그대로 CSV 파일로 변환하여 다운로드하세요. UTF-8 BOM 추가로 엑셀 한글 깨짐 방지.',
    keywords: 'TXT CSV 변환, CSV 다운로드, 텍스트 변환, 도구, Two Peas',
    url: window.location.href,
    imageUrl: 'https://twopeas.co.kr/coworker.webp',
  })
})
</script>

<template>
  <div class="page">
    <h1 class="title">TXT → CSV 변환 사이트</h1>

    <textarea
      class="editor"
      v-model="textContent"
      placeholder="여기에 CSV 형태의 텍스트를 붙여넣으세요.&#10;예) 이름,나이,도시&#10;홍길동,30,서울"
    ></textarea>

    <button class="download-btn" :disabled="!textContent" @click="downloadCsv">
      CSV로 내려받기
    </button>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem clamp(1rem, 3vw, 2rem);
}

.title {
  margin: 0 0 1rem;
  font-weight: 800;
  color: var(--color-text-primary, #36454f);
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.file-label {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  background: rgba(255, 153, 164, 0.15);
  padding: 0.6rem 1rem;
  border-radius: 12px;
  cursor: pointer;
}

.file-label input {
  display: none;
}

.name-input {
  flex: 1;
  min-width: 220px;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid rgba(54, 69, 79, 0.15);
  background: #fff;
}

.editor {
  width: 100%;
  min-height: 360px;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(54, 69, 79, 0.15);
  background: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  line-height: 1.5;
  color: var(--color-text-primary, #36454f);
}

.download-btn {
  margin-top: 1rem;
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #ff99a4 0%, #ffb6c5 100%);
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(255, 153, 164, 0.3);
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
