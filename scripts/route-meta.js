// 라우트별 메타 정보 정의 (사전 렌더링용)
export const routeMetaMap = {
  '/': {
    title: '나의 일주 동물 찾기 - Two Peas',
    description: '생년월일을 입력하면 나만의 일주 동물을 찾아드립니다. 60가지 간지 동물 중 당신의 일주를 확인해보세요.',
    keywords: '일주 동물, 사주, 만세력, 간지, 60간지, 일주 찾기',
    imageUrl: 'https://twopeas.co.kr/intro.webp'
  },
  '/richplan/billionCalc': {
    title: '1억 부자 계산기 - Two Peas',
    description: '현재 자본금, 매월 목표 저축 금액, 연 수익률을 입력하면 1억 달성 시기를 알려드립니다. 복리 계산으로 정확한 목표 달성 날짜를 확인해보세요.',
    keywords: '1억 부자, 자본금 계산, 목표 달성, 재테크 계산기, 복리 계산, 저축 계산기, 부자 되기, 재무 계획',
    imageUrl: 'https://twopeas.co.kr/richplan/rich-gril-thumnail.png'
  },
  '/richplan/loanCalc': {
    title: '대출 상환 계산기 - 원리금균등, 원금균등, 만기일시상환 - Two Peas',
    description: '대출 원금, 이자율, 상환 기간을 입력하면 원리금균등상환, 원금균등상환, 만기일시상환 방식별로 월별 상환액과 총 이자를 계산해드립니다. 차트로 상환 추세를 한눈에 확인하세요.',
    keywords: '대출 계산기, 대출 상환 계산, 원리금균등상환, 원금균등상환, 만기일시상환, 대출 이자 계산, 주택담보대출 계산, 대출 상환액, 월 상환액 계산, 대출 비교',
    imageUrl: 'https://twopeas.co.kr/richplan/loan-thumnail.png'
  },
  '/richplan/loancalc': {
    title: '대출 상환 계산기 - 원리금균등, 원금균등, 만기일시상환 - Two Peas',
    description: '대출 원금, 이자율, 상환 기간을 입력하면 원리금균등상환, 원금균등상환, 만기일시상환 방식별로 월별 상환액과 총 이자를 계산해드립니다. 차트로 상환 추세를 한눈에 확인하세요.',
    keywords: '대출 계산기, 대출 상환 계산, 원리금균등상환, 원금균등상환, 만기일시상환, 대출 이자 계산, 주택담보대출 계산, 대출 상환액, 월 상환액 계산, 대출 비교',
    imageUrl: 'https://twopeas.co.kr/richplan/loan-thumnail.png'
  },
  '/coworker/txt': {
    title: '내 업무 도우미 (TXT → CSV) - Two Peas',
    description: 'TXT 파일을 CSV 파일로 변환해드립니다.',
    keywords: 'TXT → CSV, 변환, 텍스트 파일, CSV 파일',
    imageUrl: 'https://twopeas.co.kr/intro.webp'
  },
  '/result': {
    title: '60일주 동물 도감 - Two Peas',
    description: '60가지 일주 동물을 모두 확인해보세요. 각 일주의 특징과 성격을 알아볼 수 있습니다.',
    keywords: '60일주, 일주 동물, 간지 도감, 사주 동물',
    imageUrl: 'https://twopeas.co.kr/intro.webp'
  }
}

// 동적 라우트 (파라미터 포함)
export const dynamicRouteMetaMap = {
  '/result/:id': {
    title: '일주 상세 정보 - Two Peas',
    description: '일주의 상세한 성격 정보와 특징을 확인해보세요.',
    keywords: '일주 상세, 간지 성격, 일주 분석',
    getImageUrl: (id) => `https://twopeas.co.kr/ganji/${id}.webp`
  }
}







