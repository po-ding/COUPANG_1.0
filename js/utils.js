export const getTodayString = () => new Date().toISOString().split('T')[0];
export const getCurrentTimeString = () => new Date().toTimeString().slice(0, 5);
export const formatToManwon = (val) => isNaN(val) ? '0' : Math.round(val / 10000).toLocaleString();

export function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// 04:00 AM 기준 날짜 통계 로직
export function getStatisticalDate(dateStr, timeStr) {
    if (!timeStr) return dateStr;
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 4) return dateStr;
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}