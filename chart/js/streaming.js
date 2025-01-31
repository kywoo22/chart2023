const channelToSubscription = new Map();

let line;
function drawLine (text, quantity, price , color , boxColor) {
    if (!window.tvWidget) {
        return;
    }
    return window.tvWidget.chart()	
        .createPositionLine()
            .setText(text)
            .setQuantity(quantity)
			.setQuantityBackgroundColor(boxColor)
			.setBodyBorderColor(boxColor)
			.setQuantityBorderColor(boxColor)
            .setPrice(price)
			.setLineStyle(2)
			.setExtendLeft(true)
			.setLineColor(color)
            .setLineLength(93);			
/*			.setExtendLeft(false)
			.setEditable(false)
			.setLineStyle(2)
			.setLineColor(color)
			.setBodyBackgroundColor('rgba(0, 0, 0, 0.8)')
			.setBodyTextColor(color)
			.setQuantityBackgroundColor(color)
			.setCancelButtonBorderColor(color)
			.setCancelButtonBackgroundColor('rgba(0, 0, 0, 0.8)')
			.setCancelButtonIconColor(color)	*/
}
function getUserIdx(){console.log("userIdx:",userIdx);return userIdx;}
function getCoin(){return _sym;}
function getTrade(){return "USDT";}

function findLine(obj){
	if(obj.protocol == "order remove"){
		return lineGroup.filter(e => e.orderNum == obj.orderNum);
	}else{
		console.log("alll:",lineGroup);
		return lineGroup.filter(e => ((e.kind == 'position' &&  e.type == obj.symbol) ||
									(e.kind == 'tp' && e.type == obj.symbol) ||
									(e.kind == 'sl' && e.type == obj.symbol))
									&& e.position == obj.position);
	}
}
function setLineObj(msg){
	console.log("setLineObj :" , msg);
	let newLineGroup = [...lineGroup];
	let ob = {};
	let name="order";	
	let lineColor = "";
	let boxColor = "";

	console.log("1 lineGroup size=",newLineGroup.length,newLineGroup);
	if (msg.protocol == "position set") {
		console.log("setLineObj position set", msg);
		let po = newLineGroup.filter(e => e.kind == 'position' || e.kind == 'tp' || e.kind == 'sl');
		po = po.filter(e => e.position == msg.position);
		if (po && po.length > 0) {
			po.forEach(item => {
				console.log(" item:", item);
				if (item.lineObj) {
					try {
						item.lineObj.remove();
					} catch (error) {
						console.error("Error removing item:", error);
					}
				}
			});
			newLineGroup = newLineGroup.filter(e => !po.includes(e));
		}
	}else if (msg.protocol == "order set") {
		console.log("setLineObj order set", msg);
		let po = newLineGroup.filter(e => e.kind == 'order');
		po = po.filter(e => e.orderNum == msg.orderNum);
		if (po && po.length > 0) {
			po.forEach(item => {
				console.log(" item:", item);
				if (item.lineObj) {
					try {
						item.lineObj.remove();
					} catch (error) {
						console.error("Error removing item:", error);
					}
				}
			});
			newLineGroup = newLineGroup.filter(e => !po.includes(e));
		}
	}
	if( msg.protocol=="position set"){
		ob.kind = 'position';
		name = "position";
	}else if(msg.protocol=="order set"){
		name = "order";
		ob.kind = 'order';
		ob.orderNum = msg.orderNum;
	}else{		
		ob.kind = msg.kind;
		if(ob.kind == 'order') ob.orderNum = msg.orderNum;
		name = msg.kind;
	}
	if(msg.position == 'long'){
		lineColor = BCup;
		boxColor = BCup;
	} else{
		lineColor = BCdown;
		boxColor = BCdown;
	} 
	ob.type= msg.symbol;
	ob.position = msg.position;
	let ln = drawLine(name+" ("+msg.buyQuantity+")" , msg.position, msg.entryPrice , lineColor , boxColor);
	ob.lineObj = ln;	
	newLineGroup.push(ob);	

	if(msg.TP != null){
		let tp = drawLine("TP ("+msg.buyQuantity+")" , msg.position, msg.TP , BCup , BCup);
		let tp_ob = {kind:'tp',type:msg.symbol,lineObj:tp,position:msg.position};
		newLineGroup.push(tp_ob);
	}
	if(msg.SL != null){
		let sl = drawLine("SL ("+msg.buyQuantity+")" , msg.position, msg.SL , BCdown , BCdown);
		let sl_ob = {kind:'sl',type:msg.symbol,lineObj:sl,position:msg.position};
		newLineGroup.push(sl_ob);
	}
	console.log("lineGroup size=",newLineGroup.length,newLineGroup);
	lineGroup = newLineGroup; 
}

var serverUrl = _server;
var wsurl; //server#####
if( _server == "localhost")
	wsurl = "ws://" + serverUrl + ":2052/port2053"; //server#####
else
	wsurl = "wss://" + serverUrl + ":2053/port2053"; //server#####

var ws=null;
var lineGroup=[];
var wsinit = () => {
	if (ws !== null) {
	  return;
	}
	ws = new WebSocket(wsurl);
	ws.onopen = function (e) {
		console.log('open 시작 -------(7)');
	  var obj = new Object();
	  obj.protocol = "chart";
	  obj.userIdx = parseInt(getUserIdx()) || null;
	  obj.coin = getCoin() || null;
	  obj.trade = getTrade() || 'usdt';
	  obj.sendTime = Date.now();
	  ws.send(JSON.stringify(obj));
	};
	ws.onmessage = async function (e) {
	  let msg = JSON.parse(e.data);
	  let data = JSON.parse(e.data)['sise'];
	  if (data) {
		//0~~BTC~USDT~1~138988470~1672471771.239~0.01606~16545.50~13.261~1672471771.239~779000000~297000000~1bf
		onData(data);
	  }
	  //console.log("filter :" ,msg.protocol);
	  if (msg.protocol === "initOrderAndPosition") {
		console.log('chart websocket onmsg initOrderAndPosition' , msg);
		console.log('olist : ' , msg.olist);
		console.log('plist : ' , msg.plist);
//		msg.kind=
		for( let i in msg.olist){
			msg.olist[i].kind="order";
			msg.olist[i].protocol="order set";
			console.log("olist : " , msg.olist[i]);
			setLineObj(msg.olist[i]);
		}
		for( let i in msg.plist){
			msg.plist[i].kind="position";
			msg.plist[i].protocol="position set";
			setLineObj(msg.plist[i]);
		}
	  }
	  if (msg.protocol === "order set" || msg.protocol === "position set") {
		setLineObj(msg);
	  } else if (
		msg.protocol === "order remove" ||
		msg.protocol === "remove Position"
	  ) {
		console.log('msg' , msg);
		let ob = findLine(msg);
		console.log("findLine result",ob);
		console.log(ob);
		// ob.lineObj.remove();
		ob.forEach(item => item.lineObj.remove());
		lineGroup = lineGroup.filter(e => !ob.includes(e));
	  }
	};
	ws.onclose = function (e) {	  setTimeout(wsinit, 2000);		};
	ws.onerror = function (e) {		};
  };

wsinit();

function onData(str)
{
   let pdata=str.split('~');
   //console.log("pdate:"+str)
    const data = {currency:pdata[2]+pdata[3],high:pdata[8],low:pdata[8],
		bid:pdata[8],timestamp:pdata[6],open:pdata[8],close:pdata[8],volume:pdata[9]};
    
    const channelString = data.currency;
    if (!channelString) {
        return;
    }
	
	const subscriptionItem = channelToSubscription.get(channelString);
	if (subscriptionItem === undefined) {
        console.log(`channelString[${channelString}] subscriptionItem=>`, subscriptionItem)
		return;
	}
		
    const high = parseFloat(data.high);
    const low = parseFloat(data.low);    
    const bid = parseFloat(data.bid);    
	const tradeTime = parseInt(data.timestamp)*1000;
	const volume=parseFloat(data.volume);

    // open 또는 close 값이 없는 경우, bid 로 대체
    const open = parseFloat(data.open) || bid;
    const close = parseFloat(data.close) || bid;
	
	const lastDailyBar = subscriptionItem.lastDailyBar;
	let resv = subscriptionItem.resv+"";
	
	// 차트 iframe 찾기
	var iframeName = document.querySelector("#tv_chart_container > iframe").id;
	// 차트 분,시,일,주.달 버튼 찾아서 현재 선택된 텍스트 가져오기
	var selectText = document.querySelector("#"+iframeName+"").contentWindow.document.querySelector(".value-2y-wa9jT").textContent;
	// 선택된 값에 따라 시간 변경해주기
	if(selectText.match(/m/) != null){
		subscriptionItem.resv = "1";
	} else if(selectText.match(/h/) != null){
		subscriptionItem.resv = "60";
	} else if(selectText.match(/D|W|M/) != null){
		subscriptionItem.resv = "1440";
	}
	// console.log("before subscriptionItem.resv ["+resv+"]" + "after subscriptionItem.resv ["+subscriptionItem.resv+"]");

	if(resv == "NaN" || subscriptionItem.resv == "NaN" || subscriptionItem.resv === null || subscriptionItem.resv === NaN || subscriptionItem.resv === undefined){
		subscriptionItem.resv = 1;
		console.log("catch err");
	}
	const nextDailyBarTime = getNextBarTime(lastDailyBar.time, subscriptionItem.resv);

	//console.log("tradeTime:",new Date(tradeTime),"nextDailyBarTime:",new Date(nextDailyBarTime) ,nextDailyBarTime);
	let bar;
	if (tradeTime >= nextDailyBarTime) {
		bar = {
			time: nextDailyBarTime,
			open: open,
			high: high,
			low: low,
			close: close,
			volume: volume
		}
		console.log('[socket] Generate new bar', bar);
	} else {
		bar = {
			...lastDailyBar,
			high: Math.max(lastDailyBar.high, high),
			low: Math.min(lastDailyBar.low, low),
			close: close,
			volume : volume
		};
		// console.log('[socket] Update the latest bar by price', close);
	}
	//console.log('bar.time ::: ' , bar.time + '  &&   tradeTime-bar.time :: ' , (tradeTime-bar.time));
	if( tradeTime-bar.time >=2*60*1000 ){// 이 부분을 아예 2분 이상 차이 날때만 바꾸는걸로 할까?
//		console.log("bar.time small:", new Date(bar.time), new Date(tradeTime))
		bar.time = tradeTime;
	}
	if( tradeTime-bar.time <=-2*60*1000 ){// 이 부분을 아예 2분 이상 차이 날때만 바꾸는걸로 할까?
		bar.time = tradeTime;
	}
						
//	console.log(subscriptionItem.resolution , subscriptionItem.resv,"resv","new bar",
//		(new Date(subscriptionItem.lastDailyBar.time)),(new Date(bar.time) ) );

	//console.log(JSON.stringify(bar));

	subscriptionItem.lastDailyBar = bar;

	// send data to every subscriber of that symbol
//	if( subscriptionItem.handlers.length != 1)console.log("manys ?",subscriptionItem.handlers.length)
//	subscriptionItem.handlers[0].callback(bar);
	subscriptionItem.handlers.forEach(handler => handler.callback(bar));
}

function getNextBarTime(barTime, resolution) {
    const nextTime = barTime + (parseInt(resolution) * (60 * 1000));
	const date = new Date(nextTime);
	return date.getTime();
}

function updateBar(data, sub) {
	var lastBar = sub.lastBar;
	let resolution = sub.resolution;
	if (resolution.includes("D")) {
	// 1 day in minutes === 1440
	resolution = 1440;
	} else if (resolution.includes("W")) {
	resolution = 10080;
	}
	var coeff = resolution * 60;
	var rounded = Math.floor(data.ts / coeff) * coeff;
	var lastBarSec = lastBar.time / 1000;
}


/*
    symbolInfo 를 전달받아, 웹소켓에서 수신할 채널명으로 변경합니다.    
    ex) BTC_USD => 웹소켓에서 채널명으로 사용되는 BTCUSD 로 변경
*/
function parseChannelString(symbolInfo) {
    return symbolInfo.name.replace('_', '');
}

/*
    심볼에 대한 실시간 업데이트를 수신하고자 할 때 호출됩니다.

    - 동일한 시간 범위일 때는 업데이트 되거나, 새 막대가 추가되려고 할 때 호출됩니다.
*/
function transr(v,re){
	switch(v){
		case '1':return 1;
		case '60':return 60;
		case '1d':case '1440':return 60*24;
		case '1w':case '10080':return 60*24*7;
		default:return parseInt(re);
	}
}
export function subscribeOnStream(
	symbolInfo,
	resolution,
	onRealtimeCallback,
	subscriberUID,
	onResetCacheNeededCallback,
	lastDailyBar,
) {
	const channelString = parseChannelString(symbolInfo)
	const handler = {
		id: subscriberUID,
		callback: onRealtimeCallback,
	};
	let subscriptionItem = channelToSubscription.get(channelString);
	console.log(`gogogo ===subscriptionItem `, subscriptionItem,resolution);
	if (subscriptionItem) {
		subscriptionItem.resv = transr(resolution);
		console.log("add handlers+++++++++++++++++++++",subscriptionItem.handlers.length);
		subscriptionItem.handlers.push(handler);
		return;
	}
	subscriptionItem = {
		subscriberUID,
		resolution,
		lastDailyBar,
		handlers: [handler],
	};
	subscriptionItem.resv = transr(resolution);
	channelToSubscription.set(channelString, subscriptionItem);
	console.log('[subscribeBars]: Subscribe to streaming. Channel:', channelString);
}

/**
 * 구독 중인 심볼이 변경되었을 때 호출됩니다.
 * 해당 subscriberUID(구독자 ID) 는 삭제합니다.
 * 
 * 예를 들어, 챠트에서 심볼을 변경하였을 때, 구독 중인 이전 심볼을 삭제하기 위하여 호출됩니다.
 */
export function unsubscribeFromStream(subscriberUID) {
	for (const channelString of channelToSubscription.keys()) {
		const subscriptionItem = channelToSubscription.get(channelString);
		const handlerIndex = subscriptionItem.handlers
			.findIndex(handler => handler.id === subscriberUID);

		if (handlerIndex !== -1) {
			subscriptionItem.handlers.splice(handlerIndex, 1);

			if (subscriptionItem.handlers.length === 0) {
				console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString);
				channelToSubscription.delete(channelString);
				break;
            }
		}
	}
}