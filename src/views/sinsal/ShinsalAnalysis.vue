<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSajuPillars, checkSinsal } from '../../utils/sinsalLogic.js'

const router = useRouter()
const calendarOptions = ['양력', '음력', '음력(윤달)']
const selectedCalendar = ref(calendarOptions[0])
const birthDate = ref('')
const birthHour = ref('')
const birthMinute = ref('')
const isTimeUnknown = ref(false)

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

const isTimeDisabled = computed(() => isTimeUnknown.value)

const setCalendar = (option) => { selectedCalendar.value = option }

watch(isTimeUnknown, (val) => { if (val) { birthHour.value = ''; birthMinute.value = ''; } })

const handleSubmit = () => {
  if (!birthDate.value || birthDate.value.length !== 8) {
    alert("생년월일 8자리를 입력해주세요.");
    return;
  }

  const hour = isTimeUnknown.value ? 12 : (parseInt(birthHour.value) || 0);
  const minute = isTimeUnknown.value ? 0 : (parseInt(birthMinute.value) || 0);

  try {
    // 1. 사주 데이터 추출
    const sajuData = getSajuPillars(birthDate.value, hour, minute, selectedCalendar.value);
    
    if (!sajuData) throw new Error("사주 데이터 산출 불가");

    const foundSals = checkSinsal(sajuData);

    const result = {
      saju: sajuData, 
      sals: foundSals,
      inputInfo: {
        date: birthDate.value,
        time: isTimeUnknown.value ? '모름' : `${hour}:${minute}`,
        type: selectedCalendar.value
      }
    };
    
    sessionStorage.setItem('sinsalResult', JSON.stringify(result));
    router.push(`/sinsal/result`);
  } catch (error) {
    alert("분석 중 오류가 발생했다.");
  }
};
</script>

<template>

  <div class="landing palette-modern">

    <section class="hero">

      <div class="hero__intro center">

        <h1 class="hero__title">내 사주 속 신살(神煞) 분석</h1>

        <p class="hero__subtitle">

          타고난 사주에 어떤 신살이 있는지 확인해보세요.<br/>생년월일시를 입력하면 신살을 분석해드립니다.

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
            type="text"
            pattern="[0-9]*"
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

              :disabled="isTimeUnknown"

              required

            >

              <option value="" disabled>시</option>

              <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>

            </select>



            <select

              v-model="birthMinute"

              class="input-control time-select"

              :disabled="isTimeUnknown"

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

</style>
