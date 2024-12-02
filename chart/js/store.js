const KEY_PREFIX = 'tvd_store_';


const getKey = (symbol) => {
    return (KEY_PREFIX + symbol).toLowerCase()
}

// 챠트 데이터를 localStorage 에 저장
export const saveChart = async (chartData, symbol) => {
    return new Promise((resolve) => {
        const stamp = new Date().getTime();
        if (!chartData.id) {
            chartData.id = stamp;
            chartData.timestamp = stamp / 1000;
        }
        if(navigator.userAgent.indexOf("APP_WISHROOM_Android")>-1){        
            window.android.saveChart(getKey(symbol), JSON.stringify(chartData))
        }else{
            localStorage.setItem(getKey(symbol), JSON.stringify(chartData));
        }        
        resolve(chartData.id)
    })
}

export const loadChart = async (symbol) => {
    return new Promise((resolve) => {
        var data = JSON.parse(localStorage.getItem(getKey(symbol)));
        if(navigator.userAgent.indexOf("APP_WISHROOM_Android")>-1){ 
            data = JSON.parse(window.android.loadChart(getKey(symbol)));
        }
        console.log('loadChart ==== data : ' + JSON.stringify(data));
        resolve(data);
    });
}

