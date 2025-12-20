export const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const getCurrentTimeString = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const formatToManwon = (val) => isNaN(val) ? '0' : Math.round(val / 10000).toLocaleString();
export function showToast(msg) {
    const t = document.getElementById('toast-notification');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1500);
}
export function getStatisticalDate(dStr, tStr) {
    if (!dStr || !tStr) return dStr;
    const hour = parseInt(tStr.split(':')[0], 10);
    if (hour >= 4) return dStr;
    const d = new Date(dStr); d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}