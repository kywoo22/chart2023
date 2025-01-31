import {
    makeApiRequest,
    makeApiRequestByUrl,
    randomInRange,
} from './helpers.js';
import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';


const lastBarsCache = new Map();

// 챠트 설정 
const configurationData = {
    supported_resolutions: ['1','3','5', '15', '30','1h','4h','6h','1D','1W','1M'],
    exchanges: [ /* Symbol Search */
        {
            value: exchangename,
            name: exchangename,
            desc: exchangename,
        }
    ],
    symbols_types: [
        {
            name: 'forex',
            // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
            value: 'forex',
        }
    ],
};

/*
  지원되는 모든 거래소 심볼을 조회 
    리턴 구조 :
    [
        {
            "description":"BTC_USD",
            "exchange":"LiveRates",
            "full_name":"LiveRates:BTC_USD",
            "symbol":"BTC_USD",
            "type":"forex"
        },
        ....
    ]
*/
async function getAllSymbols() {
//    const list = await makeApiRequest(`api/rates?key=${API_KEY}`);
    let list=[
        {currency:"BTCUSDT"}
        ,{currency:"ETHUSDT"}
        ,{currency:"TRXUSDT"}
        ,{currency:"XRPUSDT"}
        ,{currency:"DOGEUSDT"}
        ,{currency:"LTCUSDT"}
        ,{currency:"SANDUSDT"}
        ,{currency:"ADAUSDT"}
        // 거래소구분 비트오션,에어렉스은 아래 다 주석처리하고 나머지 거래소들은 주석해제
        ,{currency:"GMTUSDT"}
        ,{currency:"APEUSDT"}
        ,{currency:"GALAUSDT"}
        ,{currency:"ROSEUSDT"}
        ,{currency:"KSMUSDT"}
        ,{currency:"DYDXUSDT"}
        ,{currency:"RVNUSDT"}
        ,{currency:"ETCUSDT"}
        ,{currency:"BCHUSDT"}
        ,{currency:"CELRUSDT"}
        ,{currency:"EOSUSDT"}
        ,{currency:"MATICUSDT"}
        ,{currency:"SOLUSDT"}
        ,{currency:"QTUMUSDT"}
        ,{currency:"LINKUSDT"}
        ,{currency:"AVAXUSDT"}
        ,{currency:"CHZUSDT"}
        ,{currency:"SHIBUSDT"}
        ,{currency:"PEPEUSDT"}
        ,{currency:"XMRUSDT"}
        ,{currency:"DOTUSDT"}
        ,{currency:"FTMUSDT"}
        ,{currency:"NEARUSDT"}
        ,{currency:"BOMEUSDT"}
        ,{currency:"ZECUSDT"}
        ,{currency:"UNIUSDT"}
        ,{currency:"LDOUSDT"}
        ,{currency:"BNBUSDT"}
    ];
    console.log("getAllSymbols:",list)
    const allSymbols = list.map(d => {
        return {
            description: d.currency,
            exchange: exchangename,
            full_name: exchangename+":" + d.currency,
            symbol: d.currency,
            type: "forex"
        }
    });

    return allSymbols;
}
const history = {};
var eTime;
var prevResolution;
var prevData;

var ct=0;
function toTS(gt) {
    if ( gt == null) return "null"
    gt = parseInt(gt)
    if( (gt/1000) < 10000000  ) gt = gt*1000;
    let tt = new Date(gt);
    return "[ "+(tt.getMonth()+1)+"-"+(tt.getDay())+"_"+tt.getHours()+":"+tt.getMinutes()+"] "
}

function getPriceScale(symbol){
    switch(symbol){
        case "BCHUSDT":
            return 10; 
        case "BTCUSDT": 
        case "ETHUSDT": 
        case "LTCUSDT": 
        case "XMRUSDT": 
        case "ZECUSDT": 
        case "BNBUSDT": 
            return 100;
        case "APEUSDT": 
        case "KSMUSDT": 
        case "DYDXUSDT": 
        case "ETCUSDT": 
        case "SOLUSDT": 
        case "QTUMUSDT": 
        case "LINKUSDT": 
        case "AVAXUSDT": 
        case "DOTUSDT": 
        case "NEARUSDT": 
        case "UNIUSDT": 
            return 1000;
        case "XRPUSDT": 
        case "SANDUSDT": 
        case "ADAUSDT": 
        case "GMTUSDT": 
        case "EOSUSDT": 
        case "MATICUSDT": 
        case "FTMUSDT": 
        case "LDOUSDT": 
            return 10000;
        case "TRXUSDT": 
        case "DOGEUSDT": 
        case "GALAUSDT": 
        case "ROSEUSDT": 
        case "RVNUSDT": 
        case "CELRUSDT": 
        case "CHZUSDT": 
            return 100000;
        case "BOMEUSDT": 
            return 1000000;
        case "PEPEUSDT": 
            return 10000000;
    }
}

export default {
    history:history,
    // 챠트가 최초 로딩될 때 
    onReady: (callback) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },
    // Symbol Search 시에 호출
    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback,
    ) => {
        console.log('[searchSymbols]: Method call userInput[' + userInput + '] exchange[' + exchange + '] symbolType[' + symbolType + ']');
        const symbols = await getAllSymbols();
        const newSymbols = symbols.filter(symbol => {
            const isExchangeValid = exchange === '' || symbol.exchange === exchange;
            const isFullSymbolContainsInput = symbol.full_name
                .toLowerCase()
                .indexOf(userInput.toLowerCase()) !== -1;
            return isExchangeValid && isFullSymbolContainsInput;
        });
        // 검색 결과 전달 
        onResultReadyCallback(newSymbols);
    },
    // 심볼 정보를 가져올 때 호출 
    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
        extension
    ) => {
        console.log('[resolveSymbol]: Method call', symbolName);
        const symbols = await getAllSymbols();
        const symbolItem = symbols.find(({
            full_name,
        }) => full_name === symbolName);
        if (!symbolItem) {
            console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
            onResolveErrorCallback('cannot resolve symbol');
            return;
        }
        const symbolInfo = {
            ticker: symbolItem.full_name,
            name: symbolItem.symbol,
            description: symbolItem.description,
            type: symbolItem.type,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: symbolItem.exchange,
            minmov: 1,
            pricescale: getPriceScale(symbolItem.symbol),
            has_intraday: true,
            has_no_volume: false,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    },

    // 챠트의 바를 그릴 때 호출
    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        let { from, to, firstDataRequest } = periodParams;
		prevResolution === null ? prevResolution = resolution : '';
		if (prevResolution !== resolution || resolution === '1M') {
			//to = null;
		}
        const symbol = symbolInfo.name;
        var rs;

        switch (resolution) {
			case '3':rs = '3m'; break;			    case '5':rs = '5m'; break;
			case '15':rs = '15m'; break;			case '30':rs = '30m'; break;
			case '60':rs = '1h'; break;			    case '120':rs = '2h'; break;
			case '240':	rs = '4h'; break;			case '360':	rs = '6h'; break;
			case '480':	rs = '8h'; break;			case '720':	rs = '12h'; break;
            case '1440':rs = '1d'; break;			case '3D':rs = '3d'; break;
            case '10080':rs = '1w'; break;			case '144000':rs = '1M'; break;
			case '1':rs = '1m'; break;
		}


        let pr = (to-from)/3600;        
        let endTime = null;

		if (firstDataRequest === false && eTime !== 1567382400000) {
			endTime = eTime || null; //<== 왜그런지 모르지만 이거 없으면 과거데이터 불러올때 구멍 생김.
            console.log("=====> etime",eTime)

            ct++;
            if(pr>3000 && ct>3 ){
                ct=0;
                onHistoryCallback([], {
                    noData: true,
                });
                return;
                }
		} //해당 코드가 있어야 과거 데이터들도 불러옴

        // makeApiRequestByUrl
        // return rp({ //바이낸스에서 값을 받아오는 코드
        //     url: `${api_root}`,
        //     qs,
        //   })
        //     .then((data) => {
                 try {
                        // const apiUrl = `http://localhost:2052/api/history?symbol=${symbol}&from=${from}&to=${to}&resolution=${resolution}&limit=1000`;
                        // const datas = await makeApiRequestByUrl(apiUrl);
                        // if (datas.length === 0) {
                        //     console.log('ERROR [historical API] data=>', datas);
                        //     onHistoryCallback([], {
                        //         noData: true,
                        //     });
                        //     return;
                        // }

                        let limit = 499;
                        let min = 1000*60;

                        // 8/25일 이전 차트 안나오게  (거래소구분 : FEEX만 주석 풀기)
                        // if(symbol == "CELRUSDT"){
                        //     switch (resolution) {
                        //         case '3':min = 1000*180; break;			    
                        //         case '5':min = 1000*300; break;
                        //         case '15':min = 1000*900; break;			
                        //         case '30':min = 1000*1800; break;
                        //         case '60':min = 1000*3600; break;			    
                        //         case '120':min = 1000*3600*2; break;
                        //         case '240':	min = 1000*3600*4; break;			
                        //         case '360':	min = 1000*3600*6; break;
                        //         case '480':	min = 1000*3600*8; break;			
                        //         case '720':	min = 1000*3600*12; break;
                        //         case '1440':min = 1000*3600*24; break;			
                        //         case '3D':min = 1000*3600*24*3; break;
                        //         case '10080':min = 1000*3600*24*7; break;			
                        //         case '144000':min = 1000*3600*24*30; break;
                        //         case '1':min = 1000*60; break;
                        //     }
                        //     if(to*1000 > 1692802800000 && (to*1000 - 499*min) < 1692802800000){
                        //         limit = parseInt((to*1000 - 1692802800000)/ (min)) < 0 ? 0 : parseInt((to*1000 - 1692802800000)/ (min));
                        //     } 
                        //     if(limit == 499 && from*1000 < 1692802800000) {
                        //         limit = 0;
                        //         onHistoryCallback([], {
                        //             noData: true,
                        //         });
                        //         return;            
                        //     }
                        //     console.log('limit : ' + limit);
                        // }
                        // === 8/25일 이전 차트 안나오게 

                        if(endTime == null)
                            endTime = "";
                        
                        const apiUrl = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&limit=${limit}&interval=${rs}&endTime=${endTime}`;
                        //const apiUrl = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&limit=499&interval=${rs}&endTime=1692932400000`;
                        console.log('apiURl : ' + apiUrl);
                        console.log("history check limit : " + limit + " , endTime :" + toTS(endTime) + " , from : " + toTS(from) + " , to : " + toTS(to) + " , etime : " + toTS(eTime) );
                        const datas = await makeApiRequestByUrl(apiUrl);
                        if (datas.length === 0) {
                            console.log('ERROR [historical API] data=>', datas);
                            onHistoryCallback([], {
                                noData: true,
                            });
                            return;
                        }
                        if (datas.length > 1 && to !== datas[0][0]) {
                            eTime = datas[0][0];                            
                            console.log("eTime<datas00:",eTime)
                        }
                        const bars = datas.map(el => {
                            return {
                                time: el[0], //TradingView requires bar time in ms
                                low: parseFloat(el[3]),
                                high: parseFloat(el[2]),
                                open: parseFloat(el[1]),
                                close: parseFloat(el[4]),
                                volume: parseFloat(el[5]), //el.volumefrom,
                                };
                        })

                        if (firstDataRequest) {
                            lastBarsCache.set(symbolInfo.full_name, {
                                ...bars[bars.length - 1],
                            });
                        }
                        if (firstDataRequest) {
                            var lastBar = bars[bars.length - 1];
                            history[symbolInfo.name] = { lastBar: lastBar };
                          }
                          else {
                              eTime = bars[0].time;
                          }
                        console.log(`[getBars]: returned ${bars.length} bar(s)`);
                        onHistoryCallback(bars, {
                            noData: false,
                        });
                    } catch (error) {
                        console.log('[getBars]: Get error', error);
                        onErrorCallback(error);
                    }
                // })
    },

    // 심볼 실시간 업데이트 
    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
    ) => {
        //console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        // 채널 구독
        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            lastBarsCache.get(symbolInfo.full_name),
        );
    },

    unsubscribeBars: (subscriberUID) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        unsubscribeFromStream(subscriberUID);
    },
};