import Datafeed from './datafeed.js';
import saveLoadAdapter from './saveLoadAdapter.js';
import { loadStudies, autoSaveStudies } from './event.js';
import { saveChart, loadChart } from './store.js';

// 거래소마다 다른값은 > 거래소구분 < 단어 추가해둠 
// https://stackoverflow.com/questions/65940103/how-to-override-the-studies-of-the-tradingview-widget 트뷰 위젯 옵션 알아서 찾아쓰세요
// 전체 참고 https://github.com/serdimoa/charting 
// https://github.com/landoyjx/charting_library_wiki/blob/master/Chart-Methods.md

const isMiniChart = miniChart === "1";
window.tvWidget = new TradingView.widget({
    fullscreen: true, // 미니 차트일 경우 전체 화면 비활성화
    symbol: exchangename+':'+_sym+'USDT',
    interval: '1',
    locale: "en",
    container: 'tv_chart_container',
    datafeed: Datafeed,
    library_path: '../charting_library/',
    save_load_adapter: saveLoadAdapter,
    theme: _theme , // theme : dark / light    
    allow_symbol_change: !isMiniChart, // 미니 차트에서는 심볼 변경 비활성화
    disabled_features: isMiniChart ? [ // 미니 차트에서 비활성화할 기능들
        "header_widget",         // 상단 헤더 숨기기
        "left_toolbar",          // 왼쪽 도구 모음 숨기기
        "save_chart_properties_to_local_storage", 
        "volume_force_overlay",
        "context_menus",         // 마우스 우클릭 메뉴 숨기기
        "control_bar",           // 하단 제어 바 숨기기
        "timeframes_toolbar",    // 시간대 도구 모음 숨기기
        "edit_buttons_in_legend",
        "legend_context_menu"
    ] : [
        "save_chart_properties_to_local_storage", 
        "volume_force_overlay"
        // , "header_saveload" // save 버튼 숨기기 (거래소구분 FEEX,위파이,글로빗만 - 비트오션,에어렉스/벡스라임 등 은 주석하고 올려야함 )        
    ],
    enabled_features: isMiniChart ? [] : [
        "move_logo_to_main_pane"
        // ,"hide_left_toolbar_by_default" // 도구선 숨기기 (거래소구분 비트오션,에어렉스만 - 나머지는 주석하고 올려야함)
    ],
    timezone: 'Asia/Seoul',
    overrides: {// https://github.com/serdimoa/charting/blob/master/Overrides.md
        "mainSeriesProperties.style":1, 
        "mainSeriesProperties.candleStyle.upColor": BCup, //업칼라
        "mainSeriesProperties.candleStyle.downColor": BCdown,//다운칼라
        "mainSeriesProperties.candleStyle.borderUpColor": BCupborder, // 분봉 border (초록색)
        "mainSeriesProperties.candleStyle.borderDownColor": BCdownborder, // 분봉 border (빨간색)
        "mainSeriesProperties.candleStyle.wickUpColor": BCuptail,    // 꼬리 (초록색)
        "mainSeriesProperties.candleStyle.wickDownColor": BCdowntail, // 꼬리 (빨간색)
        "volumePaneSize": "tiny"// supported values: large, medium, small, tiny (거래소구분 볼륨 차트 높이 - 비트오션,에어렉스 medium / 나머지(=기본) tiny)
        ,"paneProperties.legendProperties.showLegend": false  // indicator 접기 / 보이기 (거래소구분 비트오션,에어렉스,비트팟, coinX false / 나머지 true)
        ,"paneProperties.background": bcColor
        ,"paneProperties.backgroundType": "solid"
        ,"scalesProperties.textColor": lineTextColor, 
        "scalesProperties.lineColor": lineColor

    },
    studies_overrides: { // https://github.com/serdimoa/charting/blob/master/Studies-Overrides.md
        "volume.inputs.length": 2,
        "volume.volume.transparency": 0,
        "volume.volume ma.color": "#FF0000",
        "volume.volume ma.transparency": 30,
        "volume.volume ma.linewidth": 1,
        "volume.volume ma.visible": true, // 거래소구분 볼륨 선 보이기 안보이기  // BTC,위빗,글로빗, coinX만 false , 나머지는 true
        "bollinger bands.median.color": "#33FF88",
        "bollinger bands.upper.linewidth": 1,
        "volume.volume.color.0": BCdown, // 빨강
        "volume.volume.color.1": BCup, // 초록         
    },
    debug: false,
    auto_save_delay: 0.5/* 사용자의 조작이 발생한 후 자동 저장되는 딜레이를 조절(0.5초) */
});



// 챠트에 indicator(study) 가 추가될 때 발생하는 이벤트.
window.tvWidget.subscribe('study', autoSaveStudies);
// indicator 템플릿이 로드되었을 때 발생하는 이벤트
window.tvWidget.subscribe('load_study', autoSaveStudies);
// indicator 속성이 변경될 때 발생하는 이벤트
window.tvWidget.subscribe('study_properties_changed', autoSaveStudies);
// 사용자의 조작으로 챠트가 변경될 때 발생하는 이벤트
window.tvWidget.subscribe('onAutoSaveNeeded', () => {
    autoSaveStudies();
    const symbol = window.tvWidget.activeChart().symbol()
    window.tvWidget.save((data) => saveChart(data, symbol))
});

// 챠트가 생성된 후 호출됨
window.tvWidget.onChartReady(async () => {
    // localstorage 에서 템플릿을 가져와서 챠트에 적용
    loadStudies();
    //거래소구분 BTC, 글로빗, 비트팟, coinX만
    const symbol = window.tvWidget.activeChart().symbol()
    const data = await loadChart(symbol)
    if (data) {
        window.tvWidget.load(data);
        window.tvWidget.applyOverrides({
            "paneProperties.background": bcColor,
            "paneProperties.backgroundType": "solid",
            "scalesProperties.textColor": lineTextColor, 
            "scalesProperties.lineColor": lineColor
        });
    }

    // 거래소구분 BTC만 하고 다른 거래소는 주석처리  ====
        // volume price 숨기기 ===
        // const templates = window.tvWidget.chart().createStudyTemplate({ saveInterval: false });
        // templates.panes[1].sources[0].state.showLabelsOnPriceScale = false;    
        // window.tvWidget.chart().applyStudyTemplate(templates);
        // === volume price 숨기기 

    // ==== 그랩톡만 하고 다른 거래소는 주석처리 필수


    // // 거래소구분 이건 비트오션,에어렉스,  다른 거래소는 주석처리======
    //     // ma선 표시 ===================
        // setTimeout(function(){ 
            
        //     // moving average         
        //     var iframeName = document.querySelector("#tv_chart_container > iframe").id;
        //     // 차트 분,시,일,주.달 버튼 찾아서 현재 선택된 텍스트 가져오기
        //     let selectList = document.querySelector("#"+iframeName+"").contentWindow.document.querySelectorAll(".title-1WIwNaDF.descTitle-1WIwNaDF");
        //     console.log(selectList.length);
        //     let addMa = ",";
        //     for(var i=0; i<selectList.length; i++){
        //         let txt = selectList[i].textContent;            
        //         if(txt.includes("close") || txt.includes("9 26")){
        //             addMa += txt + ",";                
        //         }            
        //     }

        //     if(!addMa.includes(",5 close 0 SAM 9")){
        //         window.tvWidget.chart().createStudy('Moving Average', false, false, ["", 5, "close" , 0 , "SAM",9]);            
        //     }
        //     if(!addMa.includes(",10 close 0 SAM 9")){
        //         window.tvWidget.chart().createStudy('Moving Average', false, false, ["", 10, "close" , 0 , "SAM",9]);
        //     }
        //     if(!addMa.includes(",15 close 0 SAM 9")){
        //         window.tvWidget.chart().createStudy('Moving Average', false, false, ["", 15, "close" , 0 , "SAM",9]);
        //     }
        //     // 비트오션 , 에어렉스만 =============================================
        //     // if(!addMa.includes(",30 close 0 SAM 9")){
        //     //     window.tvWidget.chart().createStudy('Moving Average', false, false, ["", 30, "close" , 0 , "SAM",9]);
        //     // }            
        //     // ============================================= 비트오션 , 에어렉스만

        //     // 거래소구분 비트팟만(사용안함) =============================================
        //     if(!addMa.includes("9 26")){
        //         window.tvWidget.chart().createStudy('EMA Cross', false, false, [9,26]);
        //     }  
        //     // ============================================= 비트팟만

        //     // 거래소구분 비트팟은 제외 ========================================
        //     // scale lines 설정 
        //     let line = document.querySelector("#"+iframeName+"").contentWindow.document.querySelector(".pane-separator");
        //     line.style.backgroundColor = '#505050';
        //     line.style.height = '3px';
        //     // ======================================== 비트팟은 제외


        // } , 1000)
        // // ========= ma선 표시

        // // ma price label 숨기기 ===========
        // setTimeout(function(){            
        //     const templates = window.tvWidget.chart().createStudyTemplate({ saveInterval: false });
        //     templates.panes[0].sources[1].state.showLabelsOnPriceScale = false; // 5
        //     templates.panes[0].sources[2].state.showLabelsOnPriceScale = false; // 10
        //     templates.panes[0].sources[3].state.showLabelsOnPriceScale = false; // 15
        //     templates.panes[0].sources[4].state.showLabelsOnPriceScale = false; // 30 
        //     window.tvWidget.chart().applyStudyTemplate(templates);
        // } , 1005)
        // // ============= ma price label 숨기기

    // // ======이건 비트오션,에어렉스,비트팟만 해야함 , 다른 차트는 없애야함 


    
	
});