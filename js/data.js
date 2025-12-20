export let MEM_RECORDS = [];
export let MEM_LOCATIONS = {};
export let MEM_CENTERS = [];

// 권역 매핑 (백업 데이터 분석 기반)
export const REGION_GROUPS = {
    northwest: ["남양주4", "고양1.CFC", "MNYJ2", "남양주3", "남양주(이패A,B)", "MGMP", "구리3", "남양주4(토평)"],
    siheung: ["시흥2", "안산1(SH)", "XRC13", "안산2", "시흥3", "시흥2(SH)", "시흥1", "XRC10"],
    incheon: ["인천31.32.41.42", "인천26,28", "인천45", "인천16", "인천4", "인천13"],
    southeast: ["안성5", "서초1(SH)", "곤지암1", "용인5", "곤지암2", "이천2", "안성4", "여주1"],
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