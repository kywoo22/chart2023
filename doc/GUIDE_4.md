# 보조지표 자동 저장 방법

* 완성된 예제는, 아래 링크 에서 확인 가능합니다.
- http://localhost:3000/auto_save


1. js_auto_save/main.js

1-1. 챠트 이벤트를 구독합니다.
* 챠트에서 발생하는 이벤트 명에 따라 동작을 구분할 수 있습니다.

- study : 챠트에 indicator(study) 가 추가될 때 발생하는 이벤트.
- load_study : indicator 템플릿이 로드되었을 때 발생하는 이벤트
- study_properties_changed : indicator 속성이 변경될 때 발생하는 이벤트
- onAutoSaveNeeded : 사용자의 조작으로 챠트가 변경될 때 발생하는 이벤트

* onAutoSaveNeeded 의 경우, 사용자의 조작이 발생한 후 자동 저장되는 딜레이를 조절할 수 있습니다.
( 예. auto_save_delay: 0.5 )


[ 코드 예시 ]

// 보조 지표와 관련된 이벤트를 수신하는 함수를 연결합니다.
window.tvWidget.subscribe('study', autoSaveStudies);
window.tvWidget.subscribe('load_study', autoSaveStudies);
window.tvWidget.subscribe('study_properties_changed', autoSaveStudies);
window.tvWidget.subscribe('onAutoSaveNeeded', autoSaveStudies);

// 챠트가 생성된 후, 저장된 템플릿을 불러옵니다.
window.tvWidget.onChartReady(() => {
    loadStudies()
});




2. js_auto_save/event.js

* indicator 변경과 관련된 이벤트가 있을 때마다 localstorage 에 템플릿을 저장합니다.

사용되는 함수는 아래와 같습니다.

// 현재 활성화된 챠트를 가져옵니다.
getChart()

// 챠트에서 변경된 템플릿 정보를 가져와서 localstorage 에 저장 
autoSaveStudies()

// localstorage 에서 템플릿을 가져와서 챠트에 적용
loadStudies()

