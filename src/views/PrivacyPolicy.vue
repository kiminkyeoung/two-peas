<template>
  <div class="privacy-policy-container">
    <h1>개인정보처리방침</h1>
    <p class="effective-date">시행일자: 2026년 1월 25일</p>

    <section>
      <h2>1. 총칙</h2>
      <p>
        Twopeace(이하 '회사')는 사용자의 개인정보를 매우 중요하게 생각하며, 사용자가 회사의 서비스를 이용함과 동시에 온라인상에서 회사에 제공한 개인정보가 보호받을 수 있도록 최선을 다하고 있습니다.
        회사는 개인정보보호 관련 주요 법률인 '개인정보 보호법'을 준수하고 있습니다.
      </p>
    </section>

    <section>
      <h2>2. 수집하는 개인정보 항목 및 수집 방법</h2>
      <p>
        회사의 서비스(일주 동물 찾기, 각종 계산기 등)는 사용자의 어떠한 개인정보도 수집하거나 저장하지 않습니다.
        사용자가 입력하는 모든 데이터(생년월일, 금액 등)는 오직 해당 기능의 결과 계산을 위해서만 일시적으로 사용되며, 브라우저를 닫거나 페이지를 벗어나는 즉시 파기됩니다.
        서버를 비롯한 그 어디에도 사용자의 입력 정보는 저장되지 않으므로 안심하고 이용하셔도 좋습니다.
      </p>
    </section>
    
    <section>
      <h2>3. 개인정보의 이용 목적</h2>
      <p>
        회사는 어떠한 개인정보도 수집하지 않으므로, 이용 목적 또한 존재하지 않습니다.
      </p>
    </section>

    <section>
      <h2>4. 개인정보의 보유 및 이용 기간</h2>
      <p>
        회사는 어떠한 개인정보도 저장하지 않으므로, 보유 및 이용 기간 또한 존재하지 않습니다.
      </p>
    </section>

    <section>
      <h2>5. 개인정보처리방침의 변경에 관한 사항</h2>
      <p>
        본 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 경우, 개정 최소 7일 전에 '공지사항'을 통해 사전 공지를 할 것입니다.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy'
};
</script>

<style scoped>
.privacy-policy-container {
  font-family: 'Pretendard', sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  color: var(--color-text-primary);
  line-height: 1.8;
}
h1 {
  font-size: 2.2rem;
  border-bottom: 2px solid var(--color-main-pink);
  padding-bottom: 10px;
  margin-bottom: 5px;
}
.effective-date {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 40px;
}
h2 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-top: 40px;
  margin-bottom: 15px;
}
p {
  font-size: 1rem;
}
</style>
