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

// [핵심] 04시 기준 통계용 날짜 계산 함수
export function getStatisticalDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return dateStr;

    const [hh, mm] = timeStr.split(':').map(Number);
    
    // 04시 미만(00:00 ~ 03:59)인 경우 전날로 취급
    if (hh < 4) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        dateObj.setDate(dateObj.getDate() - 1); // 하루 뺌
        
        const newY = dateObj.getFullYear();
        const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
        const newD = String(dateObj.getDate()).padStart(2, '0');
        return `${newY}-${newM}-${newD}`;
    }
    
    // 04시 00분부터는 원래 날짜 그대로
    return dateStr;
}