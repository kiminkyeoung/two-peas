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







