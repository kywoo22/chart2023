const KEY = 'tvd_studies';

// 현재 활성화된 챠트를 가져옵니다.
const getChart = () => {
    return window.tvWidget.activeChart();
}

// 챠트에서 변경된 템플릿 정보를 가져와서 localstorage 에 저장 
export const autoSaveStudies = () => {
    // console.log('autoSaveStudies....')

    const templates = getChart().createStudyTemplate({ saveInterval: false });
    localStorage.setItem(KEY, JSON.stringify(templates));
}

// localstorage 에서 템플릿을 가져와서 챠트에 적용
export const loadStudies = () => {
    const data = localStorage.getItem(KEY);
    if (data) {
        const templates = JSON.parse(data);
        getChart().applyStudyTemplate(templates);
    }
}