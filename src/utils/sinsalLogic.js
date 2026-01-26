import { Solar, Lunar } from 'lunar-javascript';

/**
 * 기초 사주 데이터 추출 (Pillars)
 */
export function getSajuPillars(dateStr, hour, minute, calendarType) {
  try {
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6));
    const day = parseInt(dateStr.slice(6, 8));

    let solar;
    if (calendarType === '양력') {
      solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    } else {
      const isLeap = calendarType === '음력(윤달)';
      const lunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
      solar = lunar.getSolar();
    }
    
    const lunar = solar.getLunar();

    return {
      yearGan: lunar.getYearGan(),
      yearJi: lunar.getYearZhi(),
      monthGan: lunar.getMonthGan(),
      monthJi: lunar.getMonthZhi(),
      dayGan: lunar.getDayGan(),
      dayJi: lunar.getDayZhi(),
      timeGan: lunar.getTimeGan(),
      timeJi: lunar.getTimeZhi(),
      yearPillar: lunar.getYearInGanZhi(),
      monthPillar: lunar.getMonthInGanZhi(),
      dayPillar: lunar.getDayInGanZhi(),
      timePillar: lunar.getTimeInGanZhi(),
    };
  } catch (e) {
    console.error("사주 계산 실패:", e);
    return null;
  }
}

// --- 개별 신살 판정 함수들 ---

function findYeokma(saju) {
  const samhapMap = {
    '申子辰': '寅',
    '寅午戌': '申',
    '巳酉丑': '亥',
    '亥卯未': '巳'
  };
  const allBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  const found = [];
  
  [saju.yearJi, saju.dayJi].forEach(standardJi => {
    for (const samhapKey in samhapMap) {
      if (samhapKey.includes(standardJi)) {
        const 충하는글자 = samhapMap[samhapKey];
        if (allBranches.includes(충하는글자)) {
          found.push(`${standardJi} 기준 ${충하는글자}`);
        }
      }
    }
  });
  return [...new Set(found)];
}

function findDowha(saju) {
  const samhapMap = {
    '申子辰': '酉',
    '寅午戌': '卯',
    '巳酉丑': '午',
    '亥卯未': '子'
  };
  const allBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  const found = [];
  
  [saju.yearJi, saju.dayJi].forEach(standardJi => {
    for (const samhapKey in samhapMap) {
      if (samhapKey.includes(standardJi)) {
        const 도화글자 = samhapMap[samhapKey];
        if (allBranches.includes(도화글자)) {
          found.push(`${standardJi} 기준 ${도화글자}`);
        }
      }
    }
  });
  return [...new Set(found)];
}

function findHwagae(saju) {
  const samhapMap = {
    '申子辰': '辰',
    '寅午戌': '戌',
    '巳酉丑': '丑',
    '亥卯未': '未'
  };
  const allBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  const found = [];
  
  [saju.yearJi, saju.dayJi].forEach(standardJi => {
    for (const samhapKey in samhapMap) {
      if (samhapKey.includes(standardJi)) {
        const 화개글자 = samhapMap[samhapKey];
        if (allBranches.includes(화개글자)) {
          found.push(`${standardJi} 기준 ${화개글자}`);
        }
      }
    }
  });
  return [...new Set(found)];
}

function findMunchangGwiin(saju) {
  const munchangMap = { 
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', 
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' 
  };
  const allBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  const targetBranch = munchangMap[saju.dayGan];
  
  if (targetBranch && allBranches.includes(targetBranch)) {
    return [`일간 ${saju.dayGan} 기준 지지 ${targetBranch}`];
  }
  return [];
}

function findGwegang(saju) {
  const gwegangPillars = ['庚辰', '庚戌', '壬辰', '壬戌', '戊辰', '戊戌'];
  if (gwegangPillars.includes(saju.dayPillar)) {
    return [saju.dayPillar];
  }
  return [];
}

function findBaekho(saju) {
  const baekhoPillars = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.timePillar];
  return pillars.filter(p => baekhoPillars.includes(p));
}

function findHyeonchim(saju) {
  const hyeonchimChars = ['甲', '申', '卯', '午', '辛'];
  const allChars = [saju.yearGan, saju.yearJi, saju.monthGan, saju.monthJi, saju.dayGan, saju.dayJi, saju.timeGan, saju.timeJi];
  return allChars.filter(char => hyeonchimChars.includes(char));
}

function findGoran(saju) {
  const goranPillars = ['甲寅', '乙巳', '丁巳', '戊申', '辛亥'];
  if (goranPillars.includes(saju.dayPillar)) {
    return [saju.dayPillar];
  }
  return [];
}

function findGwimunGwansal(saju) {
  const pairs = [['子', '酉'], ['丑', '午'], ['寅', '未'], ['卯', '申'], ['辰', '亥'], ['巳', '戌']];
  const allBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  const foundCombinations = [];

  for (let i = 0; i < allBranches.length; i++) {
    for (let j = i + 1; j < allBranches.length; j++) {
      const b1 = allBranches[i];
      const b2 = allBranches[j];
      if (pairs.some(p => (p[0] === b1 && p[1] === b2) || (p[0] === b2 && p[1] === b1))) {
        foundCombinations.push(`${b1}-${b2}`);
      }
    }
  }
  return [...new Set(foundCombinations)];
}

/**
 * 핵심 분석 함수
 */
export function checkSinsal(saju) {
  if (!saju) return [];
  
  const results = [];
  
  const sinsalFunctions = {
    '역마살': findYeokma,
    '도화살': findDowha,
    '화개살': findHwagae,
    '문창귀인': findMunchangGwiin,
    '괴강살': findGwegang,
    '백호살': findBaekho,
    '현침살': findHyeonchim,
    '고란살': findGoran,
    '귀문관살': findGwimunGwansal,
  };

  for (const name in sinsalFunctions) {
    const foundReasons = sinsalFunctions[name](saju);
    results.push({
      name: name,
      present: foundReasons.length > 0,
      reason: foundReasons.join(', ')
    });
  }

  return results;
}