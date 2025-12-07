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

// [강화된 로직] 04시 기준 날짜 계산
export function getStatisticalDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return dateStr;

    // 시간을 10진수 숫자로 확실하게 변환
    const hh = parseInt(timeStr.split(':')[0], 10);
    
    // 04시 미만(0, 1, 2, 3시)인 경우 전날로 계산
    if (hh < 4) {
        const parts = dateStr.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 월은 0부터 시작하므로 -1
        const d = parseInt(parts[2], 10);
        
        // 정오(12시) 기준으로 설정하여 날짜 변경 시 시차 문제 원천 차단
        const dateObj = new Date(y, m, d, 12, 0, 0);
        dateObj.setDate(dateObj.getDate() - 1); // 하루 뺌
        
        const newY = dateObj.getFullYear();
        const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
        const newD = String(dateObj.getDate()).padStart(2, '0');
        
        return `${newY}-${newM}-${newD}`;
    }
    
    // 04시 00분부터는 원래 날짜 그대로 사용
    return dateStr;
}