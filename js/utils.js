export const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getCurrentTimeString = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatToManwon = (val) => {
    const num = parseInt(val) || 0;
    return Math.round(num / 10000).toLocaleString('ko-KR');
};

export function showToast(msg) {
    const t = document.getElementById('toast-notification');
    if(t) {
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 1500);
    }
}

/** 04시 기준 날짜 계산 로직 (수정 금지) */
export function getStatisticalDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return dateStr;
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 4) return dateStr;
    const parts = dateStr.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    dateObj.setDate(dateObj.getDate() - 1);
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
}

export function copyTextToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => showToast(msg || '복사되었습니다.'));
}