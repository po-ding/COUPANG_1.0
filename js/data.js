export let MEM_RECORDS = [];
export let MEM_LOCATIONS = {};
export let MEM_CENTERS = [];

// 분석 기반 상차지 빈도순 권역 필터
export const REGION_GROUPS = {
    northwest: ["MNYJ2", "고양1.CFC", "남양주4", "남양주3", "MGMP", "남양주(이패A,B)", "구리3", "고양3", "남양주4(토평)", "남양주1"],
    incheon: ["인천31.32.41.42", "인천26,28", "인천45", "인천16", "인천4", "인천13", "인천14"],
    siheung: ["XRC13", "XRC10", "시흥3", "시흥2", "안산1(SH)", "안산2", "시흥1", "시흥2(SH)", "안산3", "군포1"],
    southeast: ["안성5", "용인5", "곤지암2", "이천2", "서초1(SH)", "곤지암1", "안성4", "여주1", "이천3", "경광주4", "경광주3", "서초.양재B"],
    chung: ["XRC12.성환", "목천1", "XRC11.세종", "XHM5.천안", "XRC06.성거", "천안2", "천안6", "천안8", "M아산1"]
};

export function loadAllData() {
    MEM_RECORDS = JSON.parse(localStorage.getItem('records')) || [];
    MEM_LOCATIONS = JSON.parse(localStorage.getItem('saved_locations')) || {};
    MEM_CENTERS = JSON.parse(localStorage.getItem('logistics_centers')) || [];
}

export function saveData() {
    localStorage.setItem('records', JSON.stringify(MEM_RECORDS));
    localStorage.setItem('saved_locations', JSON.stringify(MEM_LOCATIONS));
    localStorage.setItem('logistics_centers', JSON.stringify(MEM_CENTERS));
}