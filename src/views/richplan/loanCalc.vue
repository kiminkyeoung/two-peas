<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue'
  
  // 입력값 상태 관리
  const loanAmount = ref(600000000) // 대출 원금 (원) - 6억원
  const annualInterestRate = ref(4.0) // 연 이자율 (%)
  const loanTermYears = ref(20) // 상환 기간 (년)
  const repaymentMethod = ref<'level' | 'principal' | 'bullet'>('level') // 상환 방식
  
  const result = ref<any>(null)
  const chartData = ref<{ month: number; monthlyPayment: number; remainingBalance: number }[]>([])
  const monthlyDetails = ref<{ month: number; principal: number; interest: number; monthlyPayment: number; remainingBalance: number }[]>([])
  const tooltip = ref<{ show: boolean; x: number; y: number; month: number; monthlyPayment: number; remainingBalance: number } | null>(null)
  const chartPadding = ref({ top: 30, right: 120, bottom: 60, left: 80 })
  const highlightIndex = ref<number | null>(null)
  const isDrawingChart = ref(false)
  let mouseEventHandlers: { move: ((e: MouseEvent) => void) | null; leave: (() => void) | null } = { move: null, leave: null }
  
  // 숫자를 한글로 변환하는 함수 (숫자 + 띄어쓰기 형식)
  const formatToKoreanCurrency = (num: number): string => {
    if (!num || num === 0) return ''
    
    const numValue = Math.floor(num)
    const parts: string[] = []
    
    // 억 단위 처리
    const eok = Math.floor(numValue / 100000000)
    const remainderAfterEok = numValue % 100000000
    
    // 만 단위 처리
    const man = Math.floor(remainderAfterEok / 10000)
    const remainderAfterMan = remainderAfterEok % 10000
    
    // 천 단위 처리
    const cheon = Math.floor(remainderAfterMan / 1000)
    const remainderAfterCheon = remainderAfterMan % 1000
    
    // 백 단위 처리
    const baek = Math.floor(remainderAfterCheon / 100)
    const remainderAfterBaek = remainderAfterCheon % 100
    
    // 십 단위 처리
    const sip = Math.floor(remainderAfterBaek / 10)
    const il = remainderAfterBaek % 10
    
    // 억 - 숫자로 표시
    if (eok > 0) {
      parts.push(eok + '억')
    }
    
    // 만 - 숫자로 표시
    if (man > 0) {
      const manThousand = Math.floor(man / 1000)
      const manHundred = Math.floor((man % 1000) / 100)
      const manTen = Math.floor((man % 100) / 10)
      const manOne = man % 10
      
      let manPart = ''
      if (manThousand > 0) manPart += manThousand + '천 '
      if (manHundred > 0) manPart += manHundred + '백 '
      if (manTen > 0) manPart += manTen + '십 '
      if (manOne > 0) manPart += manOne
      manPart = manPart.trim()
      if (manPart) parts.push(manPart + '만')
    }
    
    // 천
    if (cheon > 0) {
      parts.push(cheon + '천')
    }
    
    // 백
    if (baek > 0) {
      parts.push(baek + '백')
    }
    
    // 십
    if (sip > 0) {
      parts.push(sip + '십')
    }
    
    // 일
    if (il > 0) {
      parts.push(il.toString())
    }
    
    return parts.join(' ') + '원'
  }
  
  // computed로 한글 금액 표시
  const koreanAmount = computed(() => {
    return formatToKoreanCurrency(Number(loanAmount.value))
  })

  // 숫자에 쉼표 추가하는 함수
  const formatNumberWithCommas = (num: number | string): string => {
    if (!num && num !== 0) return ''
    const numStr = String(num).replace(/,/g, '')
    if (numStr === '') return ''
    return Number(numStr).toLocaleString('ko-KR')
  }

  // 쉼표 제거하고 숫자만 반환하는 함수
  const removeCommas = (str: string): string => {
    return str.replace(/,/g, '')
  }

  // 대출 원금 입력값 포맷팅 (표시용)
  const loanAmountDisplay = computed({
    get: () => formatNumberWithCommas(loanAmount.value),
    set: (value: string) => {
      // 숫자와 쉼표만 허용
      const cleaned = value.replace(/[^0-9,]/g, '')
      const numValue = removeCommas(cleaned)
      if (numValue === '') {
        loanAmount.value = 0
      } else {
        const num = Number(numValue)
        if (!isNaN(num) && num >= 0) {
          loanAmount.value = num
        }
      }
    }
  })

  // 입력 시 숫자만 허용하는 핸들러
  const handleLoanAmountInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    // 숫자와 쉼표만 허용
    const cleaned = value.replace(/[^0-9,]/g, '')
    const numValue = removeCommas(cleaned)
    
    if (numValue === '') {
      loanAmount.value = 0
      target.value = ''
    } else {
      const num = Number(numValue)
      if (!isNaN(num) && num >= 0) {
        loanAmount.value = num
        target.value = formatNumberWithCommas(num)
      }
    }
  }
  
  // 상환 방식별 계산 로직
  const calculateLoan = () => {
    chartData.value = []
    monthlyDetails.value = []
    const P = Number(loanAmount.value) // 원금 (원 단위)
    const annualRate = Number(annualInterestRate.value) / 100
    const r = annualRate / 12 // 월 이자율
    const n = Number(loanTermYears.value) * 12 // 기간 (년을 개월로 변환)
  
    let totalInterest = 0
  
    if (repaymentMethod.value === 'level') {
      // 1. 원리금균등상환 공식
      const monthlyPaymentRaw = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      const monthlyPayment = Math.round(monthlyPaymentRaw) // 반올림 처리
      let remainingBalance = P
      const details: { month: number; monthlyPayment: number; remainingBalance: number }[] = []
      const allDetails: { month: number; principal: number; interest: number; monthlyPayment: number; remainingBalance: number }[] = []
      
      for (let i = 1; i <= n; i++) {
        const interest = Math.round(remainingBalance * r) // 반올림 처리
        let principal = monthlyPayment - interest
        
        // 마지막 달 처리: 잔액이 있으면 모두 상환
        if (i === n && remainingBalance > 0) {
          principal = remainingBalance
        }
        
        remainingBalance = Math.max(0, remainingBalance - principal)
        totalInterest += interest
        
        // 마지막 달 실제 상환액
        const actualPayment = i === n ? principal + interest : monthlyPayment
        
        // 모든 월별 상세 데이터 저장
        allDetails.push({
          month: i,
          principal: principal,
          interest: interest,
          monthlyPayment: actualPayment,
          remainingBalance: remainingBalance
        })
        
        // 차트용 데이터 (매 6개월마다 또는 처음/중간/마지막)
        if (i === 1 || i === Math.floor(n / 4) || i === Math.floor(n / 2) || i === Math.floor(n * 3 / 4) || i === n || i % 12 === 0) {
          details.push({
            month: i,
            monthlyPayment: actualPayment,
            remainingBalance: remainingBalance
          })
        }
      }
      
      chartData.value = details
      monthlyDetails.value = allDetails
      
      result.value = {
        methodName: '원리금균등상환',
        monthlyPayment,
        totalInterest,
        totalAmount: P + totalInterest
      }
      
      updateChart()
  
    } else if (repaymentMethod.value === 'principal') {
      // 2. 원금균등상환
      const monthlyPrincipal = Math.floor(P / n)
      let remainingBalance = P
      const details: { month: number; monthlyPayment: number; remainingBalance: number }[] = []
      const allDetails: { month: number; principal: number; interest: number; monthlyPayment: number; remainingBalance: number }[] = []
      
      for (let i = 1; i <= n; i++) {
        const interest = Math.floor(remainingBalance * r)
        const monthlyPayment = monthlyPrincipal + interest
        totalInterest += interest
        
        // 모든 월별 상세 데이터 저장
        const newBalance = remainingBalance - monthlyPrincipal
        allDetails.push({
          month: i,
          principal: monthlyPrincipal,
          interest: interest,
          monthlyPayment: monthlyPayment,
          remainingBalance: Math.max(0, newBalance)
        })
        
        remainingBalance = Math.max(0, newBalance)
        
        // 차트용 데이터 (매 6개월마다 또는 처음/중간/마지막)
        if (i === 1 || i === Math.floor(n / 4) || i === Math.floor(n / 2) || i === Math.floor(n * 3 / 4) || i === n || i % 12 === 0) {
          details.push({
            month: i,
            monthlyPayment: monthlyPayment,
            remainingBalance: remainingBalance
          })
        }
      }
      
      chartData.value = details
      monthlyDetails.value = allDetails
      
      result.value = {
        methodName: '원금균등상환',
        monthlyPayment: Math.floor((P + totalInterest) / n), // 평균값 표시
        totalInterest,
        totalAmount: P + totalInterest
      }
      
      updateChart()
  
    } else {
      // 3. 만기일시상환
      const monthlyInterest = Math.floor(P * r)
      totalInterest = Math.floor(P * r * n)
      let remainingBalance = P
      const details: { month: number; monthlyPayment: number; remainingBalance: number }[] = []
      const allDetails: { month: number; principal: number; interest: number; monthlyPayment: number; remainingBalance: number }[] = []
      
      for (let i = 1; i <= n; i++) {
        // 모든 월별 상세 데이터 저장
        allDetails.push({
          month: i,
          principal: i === n ? P : 0, // 마지막 달에만 원금 상환
          interest: monthlyInterest,
          monthlyPayment: i === n ? P + monthlyInterest : monthlyInterest,
          remainingBalance: i === n ? 0 : remainingBalance
        })
        
        // 차트용 데이터 (매 6개월마다 또는 처음/중간/마지막)
        if (i === 1 || i === Math.floor(n / 4) || i === Math.floor(n / 2) || i === Math.floor(n * 3 / 4) || i === n || i % 12 === 0) {
          details.push({
            month: i,
            monthlyPayment: i === n ? P + monthlyInterest : monthlyInterest, // 매월 이자만, 마지막 달에 원금 추가
            remainingBalance: i === n ? 0 : remainingBalance // 원금은 만기까지 동일
          })
        }
      }
      
      chartData.value = details
      monthlyDetails.value = allDetails
      
      result.value = {
        methodName: '만기일시상환',
        monthlyPayment: Math.floor(totalInterest / n), // 매월 이자만
        totalInterest,
        totalAmount: P + totalInterest
      }
      
      updateChart()
    }
  }
  
  const reset = () => { 
    result.value = null
    chartData.value = []
    monthlyDetails.value = []
    tooltip.value = null
    highlightIndex.value = null
    // 이벤트 리스너 제거
    const canvas = document.getElementById('repaymentChart') as HTMLCanvasElement
    if (canvas && mouseEventHandlers.move) {
      canvas.removeEventListener('mousemove', mouseEventHandlers.move)
      canvas.removeEventListener('mouseleave', mouseEventHandlers.leave!)
      mouseEventHandlers.move = null
      mouseEventHandlers.leave = null
    }
  }
  
  // 차트 그리기 함수
  const drawChart = (skipEvents = false) => {
    if (!chartData.value.length) return
    if (isDrawingChart.value) return
    
    isDrawingChart.value = true
    
    requestAnimationFrame(() => {
      const canvas = document.getElementById('repaymentChart') as HTMLCanvasElement
      if (!canvas) {
        isDrawingChart.value = false
        return
      }
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        isDrawingChart.value = false
        return
      }
      
      const width = canvas.width = canvas.offsetWidth
      const height = canvas.height = 350
      const padding = { top: 30, right: 100, bottom: 90, left: 100 }
      chartPadding.value = padding
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom
      
      ctx.clearRect(0, 0, width, height)
      
      // 데이터 정규화 - 각각 별도의 스케일
      const maxPayment = Math.max(...chartData.value.map(d => d.monthlyPayment))
      const maxBalance = Math.max(...chartData.value.map(d => d.remainingBalance))
      
      // 바 차트 너비 계산
      const barWidth = chartWidth / chartData.value.length * 0.6
      const barSpacing = chartWidth / chartData.value.length
      
      // 그리드 및 축 그리기
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      
      // 좌측 Y축 그리드 (원금 잔액용)
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
        
        // 좌측 Y축 라벨 (원금 잔액)
        ctx.fillStyle = '#ff99a4'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        const balanceLabel = Math.floor(maxBalance * (1 - i / 5)).toLocaleString()
        ctx.fillText(balanceLabel, padding.left - 10, y + 4)
      }
      
      // 우측 Y축 그리드 (월 상환액용)
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i
        // 우측 Y축 라벨 (월 상환액)
        ctx.fillStyle = '#4CAF50'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        const paymentLabel = Math.floor(maxPayment * (1 - i / 5)).toLocaleString()
        ctx.fillText(paymentLabel, width - padding.right + 10, y + 4)
      }
      
      // 좌측 Y축 선 (원금 잔액)
      ctx.strokeStyle = '#ff99a4'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(padding.left, padding.top)
      ctx.lineTo(padding.left, padding.top + chartHeight)
      ctx.stroke()
      
      // 우측 Y축 선 (월 상환액)
      ctx.strokeStyle = '#4CAF50'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(width - padding.right, padding.top)
      ctx.lineTo(width - padding.right, padding.top + chartHeight)
      ctx.stroke()
      
      // 그리드 색상 복원
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      
      // X축
      ctx.beginPath()
      ctx.moveTo(padding.left, padding.top + chartHeight)
      ctx.lineTo(width - padding.right, padding.top + chartHeight)
      ctx.stroke()
      
      // X축 라벨 - 겹치지 않도록 표시
      const labelPositions: { x: number; text: string }[] = []
      const minLabelDistance = 60 // 최소 라벨 간격 (픽셀)
      
      chartData.value.forEach((d, i) => {
        const x = padding.left + barSpacing * i + barSpacing / 2
        const text = `${d.month}개월`
        
        // 첫 번째 라벨은 항상 표시
        if (labelPositions.length === 0) {
          labelPositions.push({ x, text })
        } else {
          // 이전 라벨과의 거리 확인
          const lastLabel = labelPositions[labelPositions.length - 1]
          const distance = x - lastLabel.x
          
          // 충분한 거리가 있으면 추가
          if (distance >= minLabelDistance) {
            labelPositions.push({ x, text })
          } else {
            // 거리가 부족하면 현재 라벨이 더 중요하면 교체 (마지막 라벨)
            if (i === chartData.value.length - 1 || d.month % 12 === 0) {
              labelPositions[labelPositions.length - 1] = { x, text }
            }
          }
        }
      })
      
      // 마지막 라벨은 항상 표시
      const lastIndex = chartData.value.length - 1
      const lastX = padding.left + barSpacing * lastIndex + barSpacing / 2
      const lastText = `${chartData.value[lastIndex].month}개월`
      const hasLastLabel = labelPositions.some(l => l.x === lastX)
      if (!hasLastLabel) {
        const lastLabel = labelPositions[labelPositions.length - 1]
        if (lastX - lastLabel.x >= minLabelDistance) {
          labelPositions.push({ x: lastX, text: lastText })
        } else {
          labelPositions[labelPositions.length - 1] = { x: lastX, text: lastText }
        }
      }
      
      // 라벨 그리기
      ctx.fillStyle = '#666'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      labelPositions.forEach(label => {
        ctx.fillText(label.text, label.x, height - padding.bottom + 20)
      })
      
      // 원금 잔액 바 차트 그리기 (우측 Y축 기준)
      chartData.value.forEach((d, i) => {
        const x = padding.left + barSpacing * i + (barSpacing - barWidth) / 2
        const barHeight = (d.remainingBalance / maxBalance) * chartHeight
        const y = padding.top + chartHeight - barHeight
        
        // 바 그리기
        ctx.fillStyle = i === highlightIndex.value ? '#ff99a4' : 'rgba(255, 153, 164, 0.6)'
        ctx.fillRect(x, y, barWidth, barHeight)
        
        // 바 테두리
        ctx.strokeStyle = '#ff99a4'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, barWidth, barHeight)
      })
      
      // 월 상환액 선 차트 그리기 (좌측 Y축 기준)
      ctx.strokeStyle = '#4CAF50'
      ctx.lineWidth = 3
      ctx.beginPath()
      chartData.value.forEach((d, i) => {
        const x = padding.left + barSpacing * i + barSpacing / 2
        const y = padding.top + chartHeight - (d.monthlyPayment / maxPayment) * chartHeight
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      
      // 월 상환액 포인트 그리기
      chartData.value.forEach((d, i) => {
        const x = padding.left + barSpacing * i + barSpacing / 2
        const y = padding.top + chartHeight - (d.monthlyPayment / maxPayment) * chartHeight
        
        const pointSize = highlightIndex.value === i ? 6 : 4
        
        ctx.fillStyle = '#4CAF50'
        ctx.beginPath()
        ctx.arc(x, y, pointSize, 0, Math.PI * 2)
        ctx.fill()
        
        if (highlightIndex.value === i) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
      
      // 하이라이트 수직선 그리기
      if (highlightIndex.value !== null) {
        const x = padding.left + barSpacing * highlightIndex.value + barSpacing / 2
        ctx.strokeStyle = '#999'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, padding.top + chartHeight)
        ctx.stroke()
        ctx.setLineDash([])
      }
      
      // 범례 - 차트 하단 중앙에 배치 (X축 라벨 아래)
      const legendY = height - padding.bottom + 40
      const legendStartX = padding.left + chartWidth / 2 - 80
      
      // 월 상환액 범례
      ctx.strokeStyle = '#4CAF50'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(legendStartX, legendY)
      ctx.lineTo(legendStartX + 20, legendY)
      ctx.stroke()
      ctx.fillStyle = '#333'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('월 상환액', legendStartX + 25, legendY + 4)
      
      // 원금 잔액 범례
      ctx.fillStyle = '#ff99a4'
      ctx.fillRect(legendStartX + 100, legendY - 6, 20, 12)
      ctx.strokeStyle = '#ff99a4'
      ctx.lineWidth = 1
      ctx.strokeRect(legendStartX + 100, legendY - 6, 20, 12)
      ctx.fillStyle = '#333'
      ctx.fillText('원금 잔액', legendStartX + 125, legendY + 4)
      
      // 마우스 이벤트 리스너 추가 (한 번만)
      if (!skipEvents) {
        setupChartMouseEvents(canvas, padding, chartWidth, chartHeight, maxPayment, maxBalance)
      }
      
      setTimeout(() => {
        isDrawingChart.value = false
      }, 0)
    })
  }
  
  // 차트 마우스 이벤트 설정
  const setupChartMouseEvents = (
    canvas: HTMLCanvasElement,
    padding: { top: number; right: number; bottom: number; left: number },
    chartWidth: number,
    chartHeight: number,
    maxPayment: number,
    maxBalance: number
  ) => {
    // 기존 이벤트 리스너 제거
    if (mouseEventHandlers.move) {
      canvas.removeEventListener('mousemove', mouseEventHandlers.move)
    }
    if (mouseEventHandlers.leave) {
      canvas.removeEventListener('mouseleave', mouseEventHandlers.leave)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // 차트 영역 내에 있는지 확인
      if (mouseX < padding.left || mouseX > canvas.width - padding.right ||
          mouseY < padding.top || mouseY > padding.top + chartHeight) {
        tooltip.value = null
        highlightIndex.value = null
        drawChart(true)
        return
      }
      
      // 바 차트 너비 계산
      const barSpacing = chartWidth / chartData.value.length
      
      // 가장 가까운 데이터 포인트 찾기
      let closestIndex = 0
      let minDistance = Infinity
      
      chartData.value.forEach((d, i) => {
        const x = padding.left + barSpacing * i + barSpacing / 2
        const distance = Math.abs(mouseX - x)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = i
        }
      })
      
      // 마우스가 포인트 근처에 있는지 확인 (barSpacing의 절반 이내)
      const closestX = padding.left + barSpacing * closestIndex + barSpacing / 2
      if (Math.abs(mouseX - closestX) < barSpacing / 2) {
        const data = chartData.value[closestIndex]
        // 툴팁 위치 계산 (화면 밖으로 나가지 않도록)
        let tooltipX = e.clientX
        let tooltipY = e.clientY - 10
        
        // 화면 오른쪽 경계 체크
        if (tooltipX + 150 > window.innerWidth) {
          tooltipX = window.innerWidth - 160
        }
        
        // 화면 위쪽 경계 체크
        if (tooltipY - 100 < 0) {
          tooltipY = e.clientY + 20
        }
        
        tooltip.value = {
          show: true,
          x: tooltipX,
          y: tooltipY,
          month: data.month,
          monthlyPayment: data.monthlyPayment,
          remainingBalance: data.remainingBalance
        }
        
        // 하이라이트 업데이트
        if (highlightIndex.value !== closestIndex) {
          highlightIndex.value = closestIndex
          drawChart(true)
        }
      } else {
        tooltip.value = null
        highlightIndex.value = null
        drawChart(true)
      }
    }
    
    const handleMouseLeave = () => {
      tooltip.value = null
      highlightIndex.value = null
      drawChart(true)
    }
    
    // 이벤트 리스너 저장 및 추가
    mouseEventHandlers.move = handleMouseMove
    mouseEventHandlers.leave = handleMouseLeave
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
  }
  
  
  // 차트 데이터가 변경될 때 차트 다시 그리기
  const updateChart = () => {
    if (result.value && chartData.value.length > 0) {
      setTimeout(() => {
        drawChart()
      }, 100)
    }
  }
  
  // 구조화된 데이터 (JSON-LD) 추가
  const updateStructuredData = () => {
    const existingScript = document.querySelector('script[type="application/ld+json"][data-loan-calc]')
    if (existingScript) {
      existingScript.remove()
    }

    const currentUrl = window.location.origin + '/richplan/loanCalc'
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: '대출 상환 계산기',
      description: '대출 원금, 이자율, 상환 기간을 입력하면 원리금균등상환, 원금균등상환, 만기일시상환 방식별로 월별 상환액과 총 이자를 계산해드립니다.',
      url: currentUrl,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW'
      },
      featureList: [
        '원리금균등상환 계산',
        '원금균등상환 계산',
        '만기일시상환 계산',
        '월별 상환 내역 표',
        '상환 추세 차트',
        '한글 금액 표시'
      ],
      inLanguage: 'ko-KR',
      author: {
        '@type': 'Organization',
        name: 'Two Peas'
      }
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-loan-calc', 'true')
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)
  }

  // 윈도우 리사이즈 시 차트 다시 그리기
  onMounted(() => {
    // 구조화된 데이터 추가
    updateStructuredData()
    
    window.addEventListener('resize', () => {
      if (result.value && chartData.value.length > 0) {
        drawChart()
      }
    })
  })
  
  // 상환 기간 빠른 선택 함수 (현재 값에 더하기)
  const addLoanTerm = (years: number) => {
    loanTermYears.value = Number(loanTermYears.value) + years
  }
  </script>
  
  <template>
    <div class="landing palette-modern">
      <section class="hero" v-if="result">
        <div class="result-box">
          <h1 class="result-title">{{ result.methodName }} 결과</h1>
          <div class="result-summary">
            <div class="result-card">
              <div class="result-card-icon">💸</div>
              <div class="result-card-content">
                <div class="result-card-label">총 이자</div>
                <div class="result-card-value">
                  <span class="result-number">{{ result.totalInterest.toLocaleString() }}원</span>
                  <span class="korean-amount">({{ formatToKoreanCurrency(result.totalInterest) }})</span>
                </div>
              </div>
            </div>
            
            <div class="result-card result-card-primary">
              <div class="result-card-icon">💰</div>
              <div class="result-card-content">
                <div class="result-card-label">총 상환금액</div>
                <div class="result-card-value">
                  <span class="result-number">{{ result.totalAmount.toLocaleString() }}원</span>
                  <span class="korean-amount">({{ formatToKoreanCurrency(result.totalAmount) }})</span>
                </div>
              </div>
            </div>
            
            <div v-if="repaymentMethod !== 'principal'" class="result-card">
              <div class="result-card-icon">📅</div>
              <div class="result-card-content">
                <div class="result-card-label">월 상환액</div>
                <div class="result-card-value">
                  <span class="result-number">{{ result.monthlyPayment.toLocaleString() }}원</span>
                  <span class="korean-amount">({{ formatToKoreanCurrency(result.monthlyPayment) }})</span>
                </div>
              </div>
            </div>
            
            <div v-else class="result-card result-card-info">
              <div class="result-card-icon">ℹ️</div>
              <div class="result-card-content">
                <div class="result-card-label">월 상환액 안내</div>
                <div class="result-card-value">초회 상환액이 가장 높으며 점차 줄어듭니다.</div>
              </div>
            </div>
          </div>
          
          <!-- 원리금 상환 차트 -->
          <div v-if="chartData.length > 0" class="chart-container">
            <h3 class="chart-title">월별 상환액 및 원금 잔액 추세</h3>
            <div class="chart-wrapper">
              <canvas id="repaymentChart" class="repayment-chart"></canvas>
              <!-- 툴팁 -->
              <div 
                v-if="tooltip && tooltip.show" 
                class="chart-tooltip"
                :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
              >
                <div class="tooltip-content">
                  <div class="tooltip-header">{{ tooltip.month }}개월</div>
                  <div class="tooltip-item">
                    <span class="tooltip-label">월 상환액:</span>
                    <span class="tooltip-value interest">{{ tooltip.monthlyPayment.toLocaleString() }}원</span>
                  </div>
                  <div class="tooltip-item">
                    <span class="tooltip-label">원금 잔액:</span>
                    <span class="tooltip-value principal">{{ tooltip.remainingBalance.toLocaleString() }}원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 월별 상환 내역 표 -->
          <div v-if="result && monthlyDetails.length > 0" class="monthly-table-container">
            <h3 class="table-title">{{ result.methodName }} 월별 상환금</h3>
            <div class="table-wrapper">
              <table class="monthly-table">
                <thead>
                  <tr>
                    <th>회차</th>
                    <th>납입원금</th>
                    <th>대출이자</th>
                    <th>월상환금</th>
                    <th>대출잔금</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detail in monthlyDetails" :key="detail.month">
                    <td>{{ detail.month }}</td>
                    <td>{{ detail.principal.toLocaleString() }}원</td>
                    <td>{{ detail.interest.toLocaleString() }}원</td>
                    <td class="monthly-payment-cell">{{ detail.monthlyPayment.toLocaleString() }}원</td>
                    <td>{{ detail.remainingBalance.toLocaleString() }}원</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="reset-button-wrapper">
            <button @click="reset" class="reset-button">다시 계산하기</button>
          </div>
        </div>
      </section>
  
      <section class="hero" v-else>
        <div class="hero__intro center">
          <h1 class="hero__title">대출 상환 계산기</h1>
          <p class="hero__subtitle">원금과 이율을 입력하여 나에게 맞는 상환 방식을 찾아보세요.</p>
        </div>
  
        <form class="calc-form" @submit.prevent="calculateLoan">
          <div class="toggle-group">
            <label :class="{ 'toggle-button--active': repaymentMethod === 'level' }" class="toggle-button method-label-with-tooltip">
              <input type="radio" v-model="repaymentMethod" value="level" /> 원리금균등
              <span class="tooltip-text">매월 원금과 이자를 합한 금액이 동일하게 상환되는 방식입니다. 초기 상환액이 낮고 안정적입니다.</span>
            </label>
            <label :class="{ 'toggle-button--active': repaymentMethod === 'principal' }" class="toggle-button method-label-with-tooltip">
              <input type="radio" v-model="repaymentMethod" value="principal" /> 원금균등
              <span class="tooltip-text">매월 원금을 동일하게 상환하고, 이자는 남은 원금에 따라 계산됩니다. 초기 상환액이 높고 점차 줄어듭니다.</span>
            </label>
            <label :class="{ 'toggle-button--active': repaymentMethod === 'bullet' }" class="toggle-button method-label-with-tooltip">
              <input type="radio" v-model="repaymentMethod" value="bullet" /> 만기일시
              <span class="tooltip-text">만기까지 매월 이자만 상환하고, 만기에 원금을 일시에 상환하는 방식입니다. 매월 상환액이 가장 낮습니다.</span>
            </label>
          </div>
  
          <div class="field-group">
            <span class="field-label">💰 대출 원금</span>
            <div class="input-wrapper">
              <span class="korean-amount-text" v-if="koreanAmount">{{ koreanAmount }}</span>
              <input 
                :value="loanAmountDisplay" 
                @input="handleLoanAmountInput" 
                type="text" 
                inputmode="numeric" 
                pattern="[0-9,]*" 
                class="input-control" 
                :class="{ 'has-korean-text': koreanAmount }" 
                required 
              />
              <span class="input-unit">원</span>
            </div>
          </div>
  
          <div class="field-group">
            <span class="field-label">📈 연 이자율</span>
            <div class="input-wrapper">
              <input v-model="annualInterestRate" type="number" step="0.1" class="input-control" required />
              <span class="input-unit">%</span>
            </div>
          </div>
  
          <div class="field-group">
            <span class="field-label">📅 상환 기간</span>
            <div class="input-wrapper">
              <input v-model="loanTermYears" type="number" step="0.5" class="input-control" required />
              <span class="input-unit">년</span>
            </div>
            <div class="quick-select-buttons">
              <button type="button" @click="addLoanTerm(1)" class="quick-select-btn">+1년</button>
              <button type="button" @click="addLoanTerm(5)" class="quick-select-btn">+5년</button>
              <button type="button" @click="addLoanTerm(10)" class="quick-select-btn">+10년</button>
            </div>
          </div>
  
          <button class="cta-button" type="submit">계산하기</button>
        </form>
      </section>
    </div>
  </template>
  
  <style scoped>  
  .method-label-with-tooltip .tooltip-text {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 0.5rem;
    padding: 0.6rem 0.9rem;
    background: rgba(54, 69, 79, 0.95);
    color: #ffffff;
    font-size: 0.85rem;
    white-space: normal;
    width: 220px;
    border-radius: 8px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    line-height: 1.5;
    text-align: left;
  }
  
  .method-label-with-tooltip .tooltip-text::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(54, 69, 79, 0.95);
  }
  
  .method-label-with-tooltip:hover .tooltip-text {
    opacity: 1;
    visibility: visible;
  }
  
  /* 빠른 선택 버튼 스타일 */
  .quick-select-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .quick-select-btn {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 153, 164, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-text-primary);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .quick-select-btn:hover {
    background: rgba(255, 153, 164, 0.15);
    border-color: rgba(255, 153, 164, 0.5);
    transform: translateY(-1px);
  }
  
  .quick-select-btn.active {
    background: var(--color-main-pink);
    color: #ffffff;
    border-color: var(--color-main-pink);
    box-shadow: 0 2px 8px rgba(255, 153, 164, 0.3);
  }
  
  /* 한글 금액 표시 스타일 */
  .input-wrapper {
    position: relative;
  }
  
  .korean-amount-text {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 153, 164, 0.85);
    font-size: 0.9rem;
    font-weight: 600;
    pointer-events: none;
    z-index: 2;
    white-space: nowrap;
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .input-control.has-korean-text {
    padding-left: 8rem !important;
  }
  
  
  /* 차트 스타일 */
  .chart-container {
    margin: 30px 0;
    padding: 20px;
    background: #ffffff !important;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    opacity: 1;
    position: relative;
    z-index: 1;
  }
  
  .chart-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 20px;
    text-align: center;
  }
  
  .chart-wrapper {
    position: relative;
    width: 100%;
  }
  
  .repayment-chart {
    width: 100%;
    max-width: 100%;
    height: 350px;
    display: block;
    cursor: crosshair;
  }
  
  /* 차트 툴팁 스타일 */
  .chart-tooltip {
    position: fixed;
    pointer-events: none;
    z-index: 1000;
    transform: translate(-50%, -100%);
    margin-top: -10px;
  }
  
  .tooltip-content {
    background: rgba(54, 69, 79, 0.95);
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-size: 0.9rem;
    min-width: 150px;
  }
  
  .tooltip-content::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(54, 69, 79, 0.95);
  }
  
  .tooltip-header {
    font-weight: 700;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .tooltip-item {
    display: flex;
    justify-content: space-between;
    margin-top: 0.4rem;
    gap: 1rem;
  }
  
  .tooltip-label {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .tooltip-value {
    font-weight: 600;
  }
  
  .tooltip-value.principal {
    color: #ff99a4;
  }
  
  .tooltip-value.interest {
    color: #4CAF50;
  }
  
.result-box {
  margin: 2rem auto 0;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  text-align: center;
  background: #ffffff !important;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 153, 164, 0.15);
  max-width: 900px;
  opacity: 1;
  position: relative;
  z-index: 1;
}

.hero__intro .hero__image {
  margin-bottom: 1.5rem;
}

.result-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #ff99a4;
  text-align: center;
  margin: 0 0 30px 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.result-subtitle {
  font-size: 1.1rem;
  color: #36454f;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

/* 결과 요약 카드 스타일 */
.result-summary {
  display: grid;
  gap: 1rem;
  margin-bottom: 30px;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fff4f8 100%) !important;
  border-radius: 14px;
  border: 1px solid rgba(255, 153, 164, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  text-align: left;
  opacity: 1;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 153, 164, 0.15);
  border-color: rgba(255, 153, 164, 0.3);
}

.result-card-primary {
  background: linear-gradient(135deg, rgba(255, 153, 164, 0.15) 0%, #fff4f8 100%) !important;
  border-color: rgba(255, 153, 164, 0.3);
  box-shadow: 0 3px 10px rgba(255, 153, 164, 0.12);
  opacity: 1;
}

.result-card-info {
  background: linear-gradient(135deg, rgba(173, 216, 230, 0.15) 0%, #ffffff 100%) !important;
  border-color: rgba(173, 216, 230, 0.3);
  opacity: 1;
}

.result-card-icon {
  font-size: 2rem;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 153, 164, 0.1);
  border-radius: 12px;
}

.result-card-primary .result-card-icon {
  background: rgba(255, 153, 164, 0.15);
}

.result-card-info .result-card-icon {
  background: rgba(173, 216, 230, 0.15);
}

.result-card-content {
  flex: 1;
  min-width: 0;
}

.result-card-label {
  font-size: 0.9rem;
  color: rgba(54, 69, 79, 0.7);
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.result-card-value {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.result-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.result-card-primary .result-number {
  font-size: 1.7rem;
  color: #ff99a4;
}

.result-summary .korean-amount {
  color: rgba(54, 69, 79, 0.65);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
}
  
  /* 월별 상환 내역 표 스타일 */
  .monthly-table-container {
    margin: 30px 0;
    padding: 25px;
    background: #ffffff !important;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 153, 164, 0.2);
    position: relative;
    z-index: 2;
    opacity: 1;
  }

  .table-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .table-wrapper {
    overflow-x: auto;
    overflow-y: auto;
    max-height: 500px;
    border-radius: 12px;
    border: 1px solid rgba(255, 153, 164, 0.3);
    background: #ffffff !important;
    opacity: 1;
  }

  .monthly-table {
    width: 100%;
    border-collapse: collapse;
    background: #ffffff !important;
    font-size: 0.9rem;
    min-width: 600px;
    opacity: 1;
  }

  .monthly-table thead {
    background: linear-gradient(135deg, rgb(255, 153, 164) 0%, rgb(255, 244, 248) 100%) !important;
    position: sticky;
    top: 0;
    z-index: 10;
    opacity: 1;
  }

  .monthly-table th {
    padding: 1rem 0.8rem;
    text-align: center;
    font-weight: 700;
    color: var(--color-text-primary);
    border-bottom: 2px solid rgba(255, 153, 164, 0.4);
    white-space: nowrap;
    background: inherit !important;
    opacity: 1;
  }

  .monthly-table td {
    padding: 0.9rem 0.8rem;
    text-align: right;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    color: var(--color-text-primary);
    background: #ffffff !important;
    opacity: 1;
  }

  .monthly-table tbody tr:hover {
    background: rgba(255, 153, 164, 0.1) !important;
    opacity: 1;
  }

  .monthly-table tbody tr:last-child td {
    border-bottom: none;
  }

  .monthly-table td:first-child {
    text-align: center;
    font-weight: 600;
    color: rgba(54, 69, 79, 0.8);
  }

  .monthly-payment-cell {
    font-weight: 700;
    color: #4CAF50;
  }

  /* 다시 계산하기 버튼 중앙 정렬 */
  .reset-button-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .result-card {
      flex-direction: column;
      text-align: center;
      padding: 1.2rem;
    }

    .result-card-icon {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
    }

    .result-number {
      font-size: 1.3rem;
    }

    .result-card-primary .result-number {
      font-size: 1.4rem;
    }

    .result-card-value {
      align-items: center;
    }

    .result-summary {
      gap: 0.8rem;
    }

    .monthly-table-container {
      padding: 15px;
      margin: 20px 0;
    }

    .table-title {
      font-size: 1.1rem;
      margin-bottom: 15px;
    }

    .monthly-table {
      font-size: 0.85rem;
    }

    .monthly-table th,
    .monthly-table td {
      padding: 0.7rem 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .result-title {
      font-size: 1.8rem;
      margin-bottom: 20px;
    }

    .result-card {
      padding: 1rem;
    }

    .result-number {
      font-size: 1.1rem;
    }

    .result-card-primary .result-number {
      font-size: 1.2rem;
    }

    .korean-amount {
      font-size: 0.85rem;
    }
  }
  </style>