var serviceobj = require('./servicemodule');
var websocket = require('./websocket');
var askbidobj = require('./askbidmodule');
var saveobj = require('./savemodule');
var siseobj = require('./sisemodule');

askbidobj.SetSocket(websocket);

var coinList = { BTC: 0, ETH: 1, XRP: 2, TRX: 3, DOGE:4, LTC:5, SAND:6, ADA:7, GMT:8, APE:9, GALA:10, ROSE:11, KSM:12, DYDX:13, RVN:14, ETC:15, BCH:16, CELR:17, EOS:18, MATIC:19, 
				SOL:20, QTUM:21, LINK:22, AVAX:23, CHZ:24, SHIB:25, PEPE:26, XMR:27, DOT:28, FTM:29, NEAR:30, BOME:31, ZEC:32, UNI:33, LDO:34, BNB:35}; //##
websocket.init();
siseobj.setSaveobj(saveobj);
websocket.onData =function( symbol, time, price, volume ){
	var sym = symbol.replace('USDT', '');
	//if(sym == 'BTC') console.time('ondata');
	var type = coinList[sym];
	serviceobj.getData(time, type, sym, price, volume);
	//if(sym == 'BTC') console.timeLog('ondata','///');
	askbidobj.getPData(type, price);
	//if(sym == 'BTC') {console.timeEnd('ondata');console.log('=================')}
}

websocket.onFData =function( sym, fundingRate ){
	askbidobj.getFData(sym, fundingRate);
}

websocket.onTData =function( sym, t ){	
	askbidobj.getTData(sym, t);
}

websocket.onAskBid =function( sym, a, tick ){
	askbidobj.getData(sym, a, tick);
}

websocket.onSise =function(sym, obj ){
	askbidobj.getSise(sym, obj);
}

websocket.onPData = function(sym, low, high, per, price) {
	askbidobj.getLowHigh(sym, low, high, per, price);
}

websocket.onEData =function(rate){
	askbidobj.getEData(rate);
}

websocket.onCData =function(sym, cPrice){
	askbidobj.getCData(sym, cPrice);
}

websocket.setFPrice =function(sym, price){
	askbidobj.setFPrice(sym, price);
}

websocket.onSData = function (sym, price) {
	askbidobj.getSData(sym, price);
}

askbidobj.checkM = function (client, sym) {
	let res = websocket.chkM(sym);
	return res;
}

askbidobj.onLineData = function (data) {
	serviceobj.getLData(data);
}

askbidobj.initLine = function (data) {
	serviceobj.initLine(data);
}

askbidobj.initLineOrderAndPosition = function (data) {
	serviceobj.initLineOrderAndPosition(data);
}

askbidobj.cancelOrders = function (data) {
	serviceobj.cancelOrders(data);
}

askbidobj.manipulation = function (data) {
	websocket.setMData(data);
}

serviceobj.getHistory = function (data) {
	return saveobj.getHistory(data);
}

serviceobj.stopM = function (data) {
	websocket.stopM();
}

sendAll = function (data) {
	askbidobj.sendAll(data);
}