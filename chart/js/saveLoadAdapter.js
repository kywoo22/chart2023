const KEY_PREFIX = 'tvd_';

const containsKey = (key) => {
    return localStorage.getItem(key) != null;
}

export default {
    getAllCharts: async () => {
        return new Promise((resolve) => {
            const list = []
            for (let key in localStorage) {
                if (key.startsWith(KEY_PREFIX)) {
                    const data = JSON.parse(localStorage.getItem(key));
                    delete data.content;
                    list.push(data);
                }
            }
            resolve(list);
        })
    },
    removeChart: async (chartId) => {
        return new Promise((resolve) => {
            localStorage.removeItem(KEY_PREFIX + chartId);
            resolve();
        })
    },
    saveChart: async (chartData) => {
        return new Promise((resolve) => {
            const stamp = new Date().getTime();
            if (!chartData.id) {
                chartData.id = stamp;
                chartData.timestamp = stamp / 1000;
            }
            if(navigator.userAgent.indexOf("APP_WISHROOM_Android")>-1){        
                window.android.saveChart(KEY_PREFIX + chartData.id, JSON.stringify(chartData))
            }else{
                localStorage.setItem(KEY_PREFIX + chartData.id, JSON.stringify(chartData));
            }        
    
            localStorage.setItem(KEY_PREFIX + chartData.id, JSON.stringify(chartData));
            resolve(chartData.id)
        })
    },
    getChartContent: async (chartId) => {
        return new Promise((resolve) => {
            var data = JSON.parse(localStorage.getItem(KEY_PREFIX + chartId));
            if(navigator.userAgent.indexOf("APP_WISHROOM_Android")>-1){        
                data = JSON.parse(window.android.loadChart(KEY_PREFIX + chartId));
            }    
            console.log('getChartContent ==== data : ' + JSON.stringify(data));
            //const data = JSON.parse(localStorage.getItem(KEY_PREFIX + chartId));
            resolve(data.content);
        });
    }
}