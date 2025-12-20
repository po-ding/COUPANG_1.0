export const getTodayString = () => new Date().toISOString().split('T')[0];
export const getCurrentTimeString = () => new Date().toTimeString().slice(0, 5);
export const formatToManwon = (val) => isNaN(val) ? '0' : Math.round(val / 10000).toLocaleString();

export function showToast(msg) {
    const t = document.getElementById('toast-notification');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

export function getStatisticalDate(dateStr, timeStr) {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 4) return dateStr;
    const d = new Date(dateStr); d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}