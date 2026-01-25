import { Solar } from 'lunar-javascript';

/**
 * 생년월일시를 기반으로 사주팔자 정보를 계산
 * @param {string} dateStr - 'YYYYMMDD' 형식의 생년월일
 * @param {string} timeStr - 'HHMM' 형식의 태어난 시각
 * @returns {object|null} 사주 정보 객체 또는 오류 시 null
 */
function getSajuPillars(dateStr, hour, minute) {
  try {
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6));
    const day = parseInt(dateStr.slice(6, 8));

    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
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
    console.error("Failed to calculate Saju pillars:", e);
    return null;
  }
}

/**
 * 도화살(桃花煞) 확인
 * @param {object} saju - 사주 정보 객체
 * @param {string} standard - 기준점 ('일지' 또는 '년지')
 * @returns {boolean} 해당 여부
 */
function isDowha(saju, standard = '일지') {
  const referenceBranch = standard === '일지' ? saju.dayJi : saju.yearJi;
  const otherBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  
  const samhap = {
    '해묘미': ['亥', '卯', '未'],
    '인오술': ['寅', '午', '戌'],
    '사유축': ['巳', '酉', '丑'],
    '신자진': ['申', '子', '辰'],
  };

  if (samhap.해묘미.includes(referenceBranch) && otherBranches.includes('子')) return true;
  if (samhap.인오술.includes(referenceBranch) && otherBranches.includes('卯')) return true;
  if (samhap.사유축.includes(referenceBranch) && otherBranches.includes('午')) return true;
  if (samhap.신자진.includes(referenceBranch) && otherBranches.includes('酉')) return true;

  return false;
}

/**
 * 역마살(驛馬煞) 확인
 * @param {object} saju - 사주 정보 객체
 * @param {string} standard - 기준점 ('일지' 또는 '년지')
 * @returns {boolean} 해당 여부
 */
function isYeokma(saju, standard = '일지') {
  const referenceBranch = standard === '일지' ? saju.dayJi : saju.yearJi;
  const otherBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];

  const samhap = {
    '해묘미': ['亥', '卯', '未'],
    '인오술': ['寅', '午', '戌'],
    '사유축': ['巳', '酉', '丑'],
    '신자진': ['申', '子', '辰'],
  };

  if (samhap.해묘미.includes(referenceBranch) && otherBranches.includes('巳')) return true;
  if (samhap.인오술.includes(referenceBranch) && otherBranches.includes('申')) return true;
  if (samhap.사유축.includes(referenceBranch) && otherBranches.includes('亥')) return true;
  if (samhap.신자진.includes(referenceBranch) && otherBranches.includes('寅')) return true;

  return false;
}

/**
 * 백호살(白虎煞) 확인
 * @param {object} saju - 사주 정보 객체
 * @returns {boolean} 해당 여부
 */
function isBaekho(saju) {
  const baekhoPillars = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
  const allPillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.timePillar];
  
  return allPillars.some(pillar => baekhoPillars.includes(pillar));
}


/**
 * 괴강살(魁罡煞) 확인
 * @param {object} saju - 사주 정보 객체
 * @returns {boolean} 해당 여부
 */
function isGwegang(saju) {
  const gwegangPillars = ['戊戌', '庚戌', '庚辰', '壬辰'];
  return gwegangPillars.includes(saju.dayPillar);
}

/**
 * 고란살(孤鸞煞) 확인
 * @param {object} saju - 사주 정보 객체
 * @returns {boolean} 해당 여부
 */
function isGoran(saju) {
  const goranPillars = ['甲寅', '乙巳', '丁巳', '庚申', '辛亥'];
  return goranPillars.includes(saju.dayPillar);
}

/**
 * 문창귀인(文昌貴人) 확인
 * @param {object} saju - 사주 정보 객체
 * @returns {boolean} 해당 여부
 */
function isMunchangGwiin(saju) {
  const munchangMap = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
  };
  const targetBranch = munchangMap[saju.dayGan];
  const allBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  return allBranches.includes(targetBranch);
}

/**
 * 현침살(懸針煞) 개수 세기
 * @param {object} saju - 사주 정보 객체
 * @returns {number} 현침살 글자 개수
 */
function countHyeonchim(saju) {
  const hyeonchimChars = ['甲', '申', '卯', '午', '未', '辛']; // 사용자 제공에 '辛' 없음, 일반적인 현침살에 포함되어 추가.
  const allChars = [
    saju.yearGan, saju.yearJi, saju.monthGan, saju.monthJi,
    saju.dayGan, saju.dayJi, saju.timeGan, saju.timeJi
  ];
  return allChars.filter(char => hyeonchimChars.includes(char)).length;
}

/**
 * 귀문관살(鬼門關殺) 확인
 * @param {object} saju - 사주 정보 객체
 * @returns {string[]} 발견된 귀문관살 쌍 목록 (예: ['子-未', '丑-午'])
 */
function isGwimunGwansal(saju) {
  const pairs = [
    ['子', '未'], ['丑', '午'], ['寅', '酉'],
    ['卯', '申'], ['辰', '亥'], ['巳', '戌']
  ];
  const allBranches = [saju.yearJi, saju.monthJi, saju.dayJi, saju.timeJi];
  let foundGwimun = [];

  for (let i = 0; i < allBranches.length; i++) {
    for (let j = i + 1; j < allBranches.length; j++) {
      const branch1 = allBranches[i];
      const branch2 = allBranches[j];
      
      // 정방향 또는 역방향으로 쌍이 일치하는지 확인
      const isMatch = pairs.some(pair => 
        (pair[0] === branch1 && pair[1] === branch2) ||
        (pair[0] === branch2 && pair[1] === branch1)
      );

      if (isMatch) {
        // 중복 방지를 위해 정렬된 문자열로 저장
        const sortedPair = [branch1, branch2].sort().join('-');
        if (!foundGwimun.includes(sortedPair)) {
          foundGwimun.push(sortedPair);
        }
      }
    }
  }
  return foundGwimun;
}


/**
 * 모든 신살을 종합적으로 체크
 * @param {string} dateStr - 'YYYYMMDD'
 * @param {number} hour - 0-23
 * @param {number} minute - 0-59
 * @returns {string[]} 발견된 신살 이름 목록
 */
export function checkSinsal(dateStr, hour, minute) {
  const saju = getSajuPillars(dateStr, hour, minute);
  if (!saju) return [];

  const foundSals = [];

  // TODO: 사용자가 기준(일지/년지)을 선택할 수 있게 되면 해당 값을 파라미터로 받아야 함
  const standard = '일지'; 

  if (isDowha(saju, standard)) {
    foundSals.push('도화살'); 
  }
  if (isYeokma(saju, standard)) {
    foundSals.push('역마살');
  }
  if (isBaekho(saju)) {
    foundSals.push('백호살');
  }
  if (isGwegang(saju)) {
    foundSals.push('괴강살');
  }
  if (isGoran(saju)) {
    foundSals.push('고란살');
  }
  if (isMunchangGwiin(saju)) {
    foundSals.push('문창귀인');
  }
  const hyeonchimCount = countHyeonchim(saju);
  if (hyeonchimCount > 0) {
    foundSals.push(`현침살 (${hyeonchimCount}개)`); // 개수도 함께 표시
  }
  const gwimunPairs = isGwimunGwansal(saju);
  if (gwimunPairs.length > 0) {
    gwimunPairs.forEach(pair => foundSals.push(`귀문관살 (${pair})`)); // 각 쌍을 별도로 표시
  }
  
  // 여기에 다른 신살 체크 함수들을 추가
  // if (isHwaGae(saju, standard)) {
  //   foundSals.push('화개살');
  // }

  return foundSals;
}
