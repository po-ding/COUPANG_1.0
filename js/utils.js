export const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const formatToManwon = (val) => isNaN(val) ? '0' : Math.round(val / 10000).toLocaleString('ko-KR');

export function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    if(toast){
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
    }
}

export function copyTextToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => showToast(msg))
    .catch(err => console.log('복사 실패:', err));
}

// [완벽 수정] 04시 기준 날짜 계산 (타임스탬프 기반 안전 연산)
export function getStatisticalDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return dateStr;

    // 시간을 숫자로 변환
    const hh = parseInt(timeStr.split(':')[0], 10);
    
    // 04시 미만(0, 1, 2, 3시)인 경우 전날로 계산
    if (hh < 4) {
        // "YYYY-MM-DD" 문자열을 Date 객체로 변환 (기본 09:00 KST or 00:00 UTC)
        // 여기서는 시간을 명시적으로 "12:00:00"으로 주어 시차 문제 방지
        const d = new Date(`${dateStr}T12:00:00`);
        
        // 하루(24시간 * 60분 * 60초 * 1000밀리초)를 뺌
        d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
        
        // 다시 YYYY-MM-DD 문자열로 포맷팅
        const newY = d.getFullYear();
        const newM = String(d.getMonth() + 1).padStart(2, '0');
        const newD = String(d.getDate()).padStart(2, '0');
        
        return `${newY}-${newM}-${newD}`;
    }
    
    // 04시 이상이면 원래 날짜 그대로
    return dateStr;
}