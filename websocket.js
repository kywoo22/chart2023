const	WebSocket = require('ws');
const request = require('request');
const e = require('express');
var siseobj = require('./sisemodule');
const { sendMsg } = require('./askbidmodule');

var coinList = { BTC: 0, ETH: 1, XRP: 2, TRX: 3, DOGE:4, LTC:5, SAND:6, ADA:7, GMT:8, APE:9, GALA:10, ROSE:11, KSM:12, DYDX:13, RVN:14, ETC:15, BCH:16, CELR:17, EOS:18, MATIC:19,
			SOL:20, QTUM:21, LINK:22, AVAX:23, CHZ:24, SHIB:25, PEPE:26, XMR:27, DOT:28, FTM:29, NEAR:30, BOME:31, ZEC:32, UNI:33, LDO:34, BNB:35}; //##
var mlist = ['BTC','ETH','XRP','TRX','DOGE','LTC','SAND','ADA','GMT','APE','GALA','ROSE','KSM','DYDX','RVN','ETC', 'BCH', 'CELR', 'EOS', 'MATIC', 
			'SOL','QTUM','LINK','AVAX','CHZ','SHIB','PEPE','XMR','DOT','FTM','NEAR','BOME','ZEC','UNI','LDO','BNB']; //##
var coLimit = { BTC: 2, ETH: 2, XRP: 4, TRX: 5, DOGE:5, LTC:2, SAND:4, ADA:4, APE:3, DYDX:3, GALA:5, GMT:5, KSM:2, ROSE:5, RVN:5, ETC:3, BCH:1, CELR:5, EOS:4, MATIC:4,
			SOL:3, QTUM:3, LINK:3, AVAX:3, CHZ:5, SHIB:5, PEPE:7, XMR:2, DOT:3, FTM:4, NEAR:3, BOME:6, ZEC:2, UNI:3, LDO:4, BNB:2}; //##

// 거래소구분 
//var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','ltcusdt','sandusdt','adausdt','apeusdt','dydxusdt','galausdt','gmtusdt','ksmusdt','roseusdt','rvnusdt','etcusdt']; //##
//var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','sandusdt','adausdt','gmtusdt','etcusdt','bchusdt']; //## 비트센터
// var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt']; //## 글로빗 
// var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','ltcusdt','sandusdt','adausdt','rvnusdt','etcusdt']; //## 벡스라임
// var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','ltcusdt','sandusdt','adausdt','etcusdt','bchusdt']; //## 비트오션,에어렉스
// var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','ltcusdt','sandusdt','adausdt','gmtusdt','etcusdt']; //## 위빗
var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','ltcusdt','adausdt','etcusdt','eosusdt','bchusdt','solusdt','linkusdt','dotusdt','bnbusdt']; //## coinx
// var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','ltcusdt','adausdt','etcusdt','bchusdt','maticusdt','linkusdt','xmrusdt','dotusdt','ftmusdt','nearusdt']; //## BTC
// var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','solusdt','chzusdt', 'bomeusdt', 'zecusdt', 'uniusdt', 'ldousdt',]; //## FLONANCIAL
// var coin = ['btcusdt','ethusdt','xrpusdt','trxusdt','dogeusdt','bchusdt','bchusdt','solusdt','qtumusdt','linkusdt']; //## 비트팟,bixbitx
//월드비트,베타비트,비스타빗,코어빗 의 경우 밸런스조작 기능 사용으로 인해 구 차트 사용중.

var cnt = 4;
var binanceobj = {};
binanceobj.init = () => {
	console.log('bobj init');
	binanceobj.currPrice= {};
	binanceobj.currData = {};
	binanceobj.priceData = {};
	binanceobj.tDate = {};
	binanceobj.prevPrice= {};
	binanceobj.mdata = {};
	for(let i=0; i<mlist.length; i++) {
		binanceobj.currData[mlist[i]] = {o:null,h:null,l:null,c:null,v:null};
		binanceobj.priceData[mlist[i]] = [];
		binanceobj.tDate[mlist[i]] = [];
		binanceobj.mdata[mlist[i]] = new manip(mlist[i]);
	}
	binanceobj.stream();
	// binanceobj.spstream();
	binanceobj.exchange();
}
binanceobj.onData =async function(j){	console.log("event callback:"+j);}
binanceobj.onFData =async function(j){	console.log("event callback:"+j);}
binanceobj.onTData =async function(j){	console.log("event callback:"+j);}
binanceobj.onPData =async function(j){	console.log("event callback:"+j);}
binanceobj.onCData =async function(j){	console.log("event callback:"+j);}
binanceobj.onSData =async function(j){	console.log("event callback:"+j);}
binanceobj.onAskBid =async function(j){	console.log("event callback:"+j);}
binanceobj.onSise =async function(j){	console.log("event callback:"+j);}
binanceobj.setFPrice =async function(j){	console.log("event callback:"+j);}
binanceobj.getMData =async function(j){	console.log("event callback:"+j);}
binanceobj.checkM =async function(j){	console.log("event callback:"+j);}

var ws=null;
var baseurl = 'wss://fstream.binance.com/stream?streams=';
//호가창
binanceobj.orderbook = function(data)
{
	if(data.a.length < 1 || !data.a[0][0] || data.b.length < 1 || !data.b[0][0]) {return}
	let mVal = 0;
	let dsym = data.s.replace('USDT','');
	let fnum = getSymbolFixedNum(dsym);
	if (binanceobj.mdata[dsym].run === true && binanceobj.mdata[dsym].c === cnt) {
		mVal = binanceobj.mdata[dsym].idv;
		for(var k in data.a) {
			data.a[k][0] = (parseFloat(data.a[k][0])+mVal).toFixed(fnum);
		}
		for(var k in data.b) {
			//console.log('before bid', data.b[k][0]);
			data.b[k][0] = (parseFloat(data.b[k][0])+mVal).toFixed(fnum);
			//console.log('after bid', data.b[k][0]);
		}
	}
	var bidarr = [];
	var askarr = [];
	for(let i=0; i<data.a.length; i++) {
		if(askarr.length > 9) {
			continue;
		}
		let aobj = {};
		aobj.price = data.a[i][0];
		aobj.amount = parseFloat(data.a[i][1]);
		askarr.push(aobj);
	}
	for(let i=0; i<data.b.length; i++) {
		if(bidarr.length > 9) {
			continue;
		}
		let bobj = {};
		bobj.price = data.b[i][0];
		bobj.amount = parseFloat(data.b[i][1]);
		bidarr.push(bobj);
	}
	sendSise(askarr, bidarr, coinList[dsym]);
}

//펀딩률
binanceobj.fundingrate = function(data)
{
	var frate = parseFloat(data.r);
	binanceobj.onFData(symToCoinNum(data.s), frate);
}

//최저가 최고가 
binanceobj.lowhigh = function (data) {
	let type = symToCoinNum(data['s']);
	binanceobj.onPData(type, data.l, data.h, data.P, data.p);
}

//현재가
binanceobj.kline = async function(sym, data, time)
{
	let symbol = sym.replace('USDT','');
	// console.timeEnd('kline');
	// console.time('kline');
	//let clen = binanceobj.currPrice[symbol].length;
	// if (binanceobj.currPrice[symbol][clen-1] !== data.c) {
		binanceobj.currPrice[symbol] = data.c;
		binanceobj.currData[symbol].c = data.c;
		binanceobj.currData[symbol].o = data.o;
		binanceobj.currData[symbol].h = data.h;
		binanceobj.currData[symbol].l = data.l;
		binanceobj.currData[symbol].v = data.v;
	// }
	if(binanceobj.priceData[symbol].length === 10) { //필요 없을거 같은데?
		binanceobj.priceData[symbol].shift();
	}
	if(binanceobj.tDate[symbol].length === 10) {//필요 없을거 같은데?
		binanceobj.tDate[symbol].shift();
	}
	if (binanceobj.mdata[symbol].run === true ) { // fx때 쓰려고 만들었던 잔재 같음. 
		if (binanceobj.mdata[symbol].c === cnt) {
			await binanceobj.mdata[symbol].prgM(parseFloat(data.c), symbol, time);
			// console.timeLog('kline','prg');
			// console.log(symbol, 'before price', data.c, siseobj.data[`${coinList[symbol]}`].m);
			data.c = binanceobj.mdata[symbol].pr;
			// console.log(symbol, 'after price', data.c, siseobj.data[`${coinList[symbol]}`].m);
			await siseobj.data[`${coinList[symbol]}`].setHighLowCloseAndResultCompute(null, null, null, data.c, null);
			// console.timeLog('kline','sethnl');
		} else {
			binanceobj.mdata[symbol].c += 1;
		}
	}
	binanceobj.priceData[symbol].push(parseFloat(data.c));
	if (time !== undefined) {
		binanceobj.tDate[symbol].push(time);
		siseobj.computeCurrentSise(data, time);
		//console.timeLog('kline','compsise');
	}
	binanceobj.onData(sym, time, data.c, data.v); ////
	//console.timeLog('kline','---------------------');
}

binanceobj.setMData = async function(d) {
	if(d.gap == 0 || d.price == 0) {return}
	binanceobj.mdata[d.symbol].setM(d.symbol, parseFloat(d.gap), parseFloat(d.price));
	let mobj = {};
	mobj.protocol = 'startM';
	mobj.s = d.symbol;
	mobj.p = parseFloat(d.price);
	mobj.g = parseFloat(d.gap);
	mobj.t = binanceobj.tDate[d.symbol];
	mobj.a = binanceobj.mdata[d.symbol].ind;
	mobj.pm = binanceobj.mdata[d.symbol].idv;
	console.log('startM :', d.symbol, new Date().toLocaleString());
	sendMsg(mobj);
}

binanceobj.stopM = function() {
	for(let i=0; i<mlist.length; i++) {
		binanceobj.mdata[mlist[i]].run = false;
	}
	console.log('stop m');
}

binanceobj.chkM = function(sym) {
	if(binanceobj.mdata[sym].run) {
		let mobj = {};
		mobj.protocol = 'reM';
		mobj.s = sym;
		mobj.p = parseFloat(binanceobj.mdata[sym].t);
		mobj.g = parseFloat(binanceobj.mdata[sym].ind);
		mobj.t = binanceobj.tDate[sym];
		mobj.a = binanceobj.mdata[sym].ind;
		mobj.pm = binanceobj.mdata[sym].idv;
		mobj.r = binanceobj.mdata[sym].re;
		return mobj;
	}else {
		return 'f';
	}
}
binanceobj.autore=true;
binanceobj.reconnectFstream=async function(){
	binanceobj.autore= false;
	console.log("binanceobj.autore set false");
	await ws.close();
	binanceobj.stream();
}
//전체데이터를 가져와서 각 함수로 전송(0.25초 마다)
binanceobj.stream = function() {
	// let coin = mlist[c].toLowerCase()+'usdt'
	let wsUrl = baseurl;
	for(let c=0; c<coin.length; c++) {
		var slash = '/';
		if(c === 0) {
			slash = '';
		}
		let urlCoin = coin[c];
		// wsUrl += slash+coin[c]+'@markPrice@1s/'+coin[c]+'@depth20/'+coin[c]+'@ticker/'+coin[c]+'@kline_1m';
		wsUrl += slash+urlCoin+'@markPrice@1s/'+urlCoin+'@kline_1m';
	}
	ws = new WebSocket(wsUrl);
	ws.on('message', function(payload) {
		let json = JSON.parse(payload),stream = json.stream, jdata = json.data;
		if(jdata === null || jdata === undefined) {
			binanceobj.init();
		}

		if (stream.slice(-8) === '@depth20') {
			try {
				binanceobj.orderbook(jdata);
			}catch(e) {
				console.log(stream," orderbook err",e);
			}
		} else if (stream.slice(-13) === '@markPrice@1s') {
			try {
				binanceobj.fundingrate(jdata);
			}catch(e) {
				console.log(stream, " mark price err",e);
			}
		} else if (stream.slice(-7) === '@ticker') {
			try{
				binanceobj.lowhigh(jdata);
			}catch(e) {
				console.log(stream, " ticker err",e);
			}
		} else if (stream.slice(-9) === '@kline_1m') {
			try{
				// if(jdata['s'] === 'ROSEUSDT') {console.log('[websocket] p :', jdata['k'].c, ' v : ' ,jdata['k'].v, ' t : ', new Date().toLocaleString(), new Date().getMilliseconds());}
				binanceobj.kline(jdata['s'], jdata['k'], jdata['E']);
			}catch(e) {
				console.log(stream, " kline err",e);
			}
		}
	}
	);
	ws.on('error', function(payload) { 
		console.log("binance 에러..."+binanceobj.autore);
	});
	ws.on('close', function(payload) { 
		if( binanceobj.autore){
			console.log("binance 끊김, 재연결 시도..."+binanceobj.autore);	
			setTimeout(function() {
				binanceobj.stream();
			}, 1000);
		}		
	});
	ws.on('open',function(){
		console.log("binance open");
		binanceobj.autore= true;
	})
}

binanceobj.spstream = function()
{	
	let wsUrl = 'wss://stream.binance.com:9443/stream?streams=';
	for(let c=0; c<coin.length; c++) {
		var slash = '/';
		if(c === 0) {
			slash = '';
		}
		wsUrl += slash+coin[c]+'@ticker';
	}
	spws = new WebSocket(wsUrl);
	spws.on('message', function(payload) {
		let json = JSON.parse(payload),stream = json.stream, jdata = json.data;
		if(jdata === null || jdata === undefined) {
			binanceobj.init();
		}
		if (stream.slice(-7) === '@ticker') {
			try{
				binanceobj.onSData(coinList[jdata.s.split('USDT')[0]], parseFloat(jdata.c).toFixed(getSymbolFixedNum(jdata.s)));
			}catch(e) {
				console.log(stream, " ticker err",e);
			}
		}
	}
	);
	spws.on('error', function(payload) {		console.log("binance 에러s...");	binanceobj.spstream();});
	spws.on('close', function(payload) {		console.log("binance 끊김s...");	binanceobj.spstream();});
}

//환율
binanceobj.exchange = () => {
	request.get('https://api.exchangerate-api.com/v4/latest/USD', (error, response, body) => {
        if (!error && response.statusCode == 200) {
            try {
                const json = JSON.parse(body);
                const exRate = json.rates.KRW;
                binanceobj.onEData(exRate);
            } catch (e) {
                console.error('get eRate err', e);
            }
        } else {
            console.error('API request error', error);
        }
    });
	setTimeout(binanceobj.exchange, 300000);
}

binanceobj.resetVal = () => {
	var clist = Object.keys(binanceobj.currData);
	console.log('clll',clist);
	for(c in clist) {
		console.log('c:::',c, siseobj.data[`${c}`]);
		siseobj.data[`${c}`].resetVal(binanceobj.currData[clist[c]]);
	}
}

function send(a,b, sym, tick) {
	if (Object.keys(a).length === 10 && Object.keys(b).length === 10) {
		let obj = {
				size: 10,
				bids: b,
				asks: a
		}
		obj.symbol = coinNumToSym(sym);
		binanceobj.onAskBid(sym, obj, tick);
	}
}

function sendSise(aArr, bArr, sym) {
	let obj = {
			size: 10,
			bids: bArr,
			asks: aArr
	}
	obj.symbol = coinNumToSym(sym);
	binanceobj.onSise(sym, obj);
}

function symToCoinNum (symbol) {
	let sym;
	try {
		if(symbol) {
			sym = symbol.replace('USDT', '');
		}
	} catch(e) {
		// console.log('symToCoinNum err', e);
	}
	let type = coinList[sym];
	return type;
}

function coinNumToSym (num) {
	for (var cn in coinList) {
		if (coinList[cn] === num) {
			return cn+'USDT';
		}
	}
}

function manip(sy) {
	this.t = 0;
	this.idv = 0;
	this.ind = 0;
	this.s = sy;
	this.re = false;
	this.run = false;
	this.f = false;
	this.c = 0;
  this.setM = function (sb, ind, tp) {
    this.t = tp;
		if (binanceobj.currPrice[sb] < tp) {
			this.ind = ind;
		} else if (binanceobj.currPrice[sb] > tp) {
			this.ind = ind*(-1);
		}
    this.idv = 0;
		this.re = false;
		this.run = true;
		this.c = 0;
		siseobj.data[`${coinList[sb]}`].m = 'on';
  };
  this.prgM = function (p, sym, time) {
		this.pr = p;
		if( this.run === false || this.s !== sym ) {return}
		if( this.re === false){
      if( this.ind < 0 ){
					this.idv += this.ind;
          if( this.pr + this.idv < this.t ){
            this.re = true;
          }
      }else{
        this.idv += this.ind;
        if( this.pr + this.idv > this.t ){
          this.re = true;
        }
      }
			if(this.pr + this.idv >= this.t) {
				
			}
    } else{
      this.idv += this.ind *-1;
      if( this.ind < 0 && this.idv > 0 ) {
				this.run = false;
				this.f = true;
      }else if( this.ind > 0 && this.idv < 0 )  {
				this.run = false;
				this.f = true;
      }
    }
		// console.log(this.pr, this.ind, this.idv, this.re, new Date(time).toLocaleString(), new Date(time).getMilliseconds());
    this.pr = this.pr + this.idv;
		if(this.run === false && this.f === true){
			this.f = false;
			siseobj.data[`${coinList[sym]}`].m = '';
			console.log(sym, 'return m ', siseobj.data[`${coinList[sym]}`].m, new Date().toLocaleString());
			endM(this.s);
		}
		// console.log(sym, 'run m at', this.pr);
		let fnum = getSymbolFixedNum(sym);
    this.pr = parseFloat((this.pr).toFixed(fnum));
  };
}

function getSymbolFixedNum(sym) {
	sym.length > 5 ? sym = sym.replace('USDT','') : '';
	for (var key in coLimit) {
		if (key.indexOf(sym) !== -1) {
			return coLimit[key];
		}
	}
}

function endM(sym) {
	let mobj = {};
	mobj.protocol = 'endM';
	mobj.symbol = sym;
	console.log('endM :',sym, new Date().toLocaleString());
	sendMsg(mobj);
}

process.on("uncaughtException", function (err) {
  console.error("futurebinancedata ws uncaughtException :", err);
	// process.exit();
});

module.exports = binanceobj;