const path = require("path");
var askbidobj = require("./askbidmodule");
var saveobj = require('./savemodule');
var wsobj = require('./websocket');
const options = {};

var serviceobj = {};
serviceobj.coin;
serviceobj.sdata = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {}, 12: {}, 13: {}, 14: {}, 15: {}, 16: {}, 17: {}, 18: {}, 19: {}, 20:{}, 21:{}, 22:{}, 23:{}, 24:{}, 25:{}, 26:{}, 27:{}, 28:{}, 29:{}, 30:{}, 31:{}, 32:{}, 33:{}, 34:{}, 35:{}}; //##
serviceobj.cdata = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {}, 12: {}, 13: {}, 14: {}, 15: {}, 16: {}, 17: {}, 18: {}, 19: {}, 20:{}, 21:{}, 22:{}, 23:{}, 24:{}, 25:{}, 26:{}, 27:{}, 28:{}, 29:{}, 30:{}, 31:{}, 32:{}, 33:{}, 34:{}, 35:{}}; //##
serviceobj.chartData = {};
var sym = "";
var typ = "";
serviceobj.connection = null;
serviceobj.setData = function (d) {
  this.siseobj = d;
};
serviceobj.tdata = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {}, 12: {}, 13: {}, 14: {}, 15: {}, 16: {}, 17: {}, 18: {}, 19: {}, 20:{}, 21:{}, 22:{}, 23:{}, 24:{}, 25:{}, 26:{}, 27:{}, 28:{}, 29:{}, 30:{}, 31:{}, 32:{}, 33:{}, 34:{}, 35:{}}; //##
var tarr = [];
var clients = [];
var userIdx = null;
const WebSocketServer = require("websocket").server;
const https = require("https");
const http = require("http");
var fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


var router = express.Router();
app.use(cors());
app.use("/", router);

const port = 2053; //포트 https
const port2 = 2052; //포트 http
//////////////////////////////////////////////////////
////////////////////////////////////////////////////////server ------ https
app.use(express.static(path.join(__dirname, './chart')));

router.get('/', function (req, res, next) {
  let tBCup = "#22AB94";
  let tBCdown = "#F7525F";
  let tEname = "exchange";
  let tBcColor = "#FFFFFF";
  let tMiniChart="0";
  
  if( req.query.exchangename != undefined) tEname = req.query.exchangename;
  if( req.query.bcup != undefined)    tBCup = req.query.bcup;
  if( req.query.bcdown != undefined)    tBCdown = req.query.bcdown;
  if( req.query.bccolor != undefined)    tBcColor = req.query.bccolor;
  if( req.query.minichart != undefined)    tMiniChart = req.query.minichart
   
  tBCup = tBCup.replace('_','#');
  tBCdown = tBCdown.replace('_','#');
  tBcColor = tBcColor.replace('_','#');

  let tlineColor = "#000000";
  let tlineTextColor = "#000000";
  if(tBcColor!="#FFFFFF"){
    tlineColor = "#363C4E";
    tlineTextColor = "#BBBBBB";
  }

  res.render('index', { title: 'TV_LIVE_RATES' ,
                      userIdx:req.query.userIdx,
                      server:req.query.server,
                      exchangename:tEname,
                      BCup:tBCup,
                      BCdown:tBCdown,
                      theme:req.query.theme,
                      symbol:req.query.symbol,
                      bcColor:tBcColor,
                      miniChart:tMiniChart,
                      lineColor:tlineColor,
                      lineTextColor:tlineTextColor
                     });
});


var https_options = {
 	ca: fs.readFileSync('C:/Apache24/conf/ssl.pem'),
 	key: fs.readFileSync('C:/Apache24/conf/new.key'),
 	cert: fs.readFileSync('C:/Apache24/conf/ssl.crt')
 };
 const server = https.createServer(https_options, app);
 const server2 = http.createServer(app); //local
 //////////////////////////////////////////////////
 server2.listen(port2, function () {
  console.log(new Date() + " http Server is listening on port " + port2);
});
const wsServer2 = new WebSocketServer({
  //웹소켓 서버 생성
  httpServer: server2,
  autoAcceptConnections: false,
});

 server.listen(port, function () {
   console.log(new Date() + "https Server is listening on port " + port);
 });
const wsServer = new WebSocketServer({
  //웹소켓 서버 생성
  httpServer: server,
  autoAcceptConnections: false,
});


wsServer2.on("request", async function (request) {
  OnRequest(request);
});
wsServer.on("request", async function (request) {
  OnRequest(request);
});


function OnRequest(request){
  let nowclient = request.accept();
  if(!clients.find((el) => el["client"] === this)){
    clients.push({ userIdx:null, data:null, coin:null, trade:null, client:nowclient });
  }
  serviceobj.connection = nowclient;
  //console.log(new Date().toLocaleString() + " 클라이언트가 차트에 접속 sv Connection accepted.");
  nowclient.on("message", async function (message) {
    if (message.type === "utf8") {
      let objData = JSON.parse(message.utf8Data);
      // if(objData.protocol == 'exit'){
      // 	console.log("receive EXIT CODE:"+message.utf8Data+" :"+(new Date()) );
      // 	process.exit();
      // }
      if (objData.protocol === "chart") {
        nowclient.trade = objData.trade;
        nowclient.coin = objData.coin.replace('USDT', '');
        console.log("nowclient.coin:",nowclient.coin)
        await serviceobj.getChartData(objData, this);
      }
    } else if (message.type === "binary") {
      //      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      //    connection.sendBytes(message.binaryData);
    }
    // console.log("serviceobj.onmsg timecheck "+  ((new Date()).getTime() - starttime2)  );
  });
  nowclient.on("close", async function (reasonCode, description) {
    clients = clients.filter((u) => u["client"] != this);
  });
  // console.log("serviceobj wsServer.on timecheck "+  ((new Date()).getTime() - starttime)  );
}

serviceobj.getData = async function (time, type, sym, data, v) {
  try {
    //var at = new Date().getTime() / 1000;
    var at = time / 1000;
    serviceobj.sdata[`${type}`] =
      "0~" +
      "~" +
      sym +
      "~USDT~1~138988470~" +
      at +
      "~0.01606~" +
      data +
      "~" +
      v +
      "~" +
      at +
      "~779000000~297000000~1bf";
    // if(sym === 'BTC') {
      // console.log(sym, data, new Date(time).toLocaleString(), new Date(time).getMilliseconds());
    // }

    await serviceobj.sendSym(serviceobj.sdata,sym, type);
  } catch (err) {
    console.log("sv getdata err", err);
  }
};

serviceobj.getChartData = async function (data, client) {
  var userIdx;
  data.userIdx ? (userIdx = parseInt(data.userIdx)) : (userIdx = null);
  var tr = 'usdt';
  data.trade ? data.trade === 'inverse'? tr = 'usd' : '' : '';
  for(var i in clients){
    if( clients[i].client === client){
      clients[i].userIdx = userIdx;
      clients[i].trade = tr;
      clients[i].coin = data.coin.replace('USDT', '');
    }
  }
  await askbidobj.sendUserData(data);
};

serviceobj.getLData = async function (data) {
  //console.log(data.protocol, " received at sv", data);
  var tr = 'usdt';
  if (data.symbol.slice(-3) === 'USD') {tr = 'usd';}
  var u = clients.filter((el) => el["userIdx"] === data.userIdx && el["trade"] === tr && data.symbol.includes(el["coin"]));
  if (!u.length) {
    //console.log(new Date(),'client not found');
    return;
  }
  for (let i = 0; i < u.length; i++) {
    u[i]["client"].sendUTF(JSON.stringify(data));
  }
};

serviceobj.initLine = function (data) {
  if (!data.glist) {
    //console.log(new Date(),'init data not found');
    return;
  }
  try {
    var uidx = data.glist[0].userIdx;
  } catch (e) {
    // console.log(new Date(), 'init uidx not found');
    return;
  }
  var tr = 'usdt';
  if (data.symbol.slice(-3) === 'USD') {tr = 'usd';}
  // if(!uidx) {console.log(new Date(), 'init uidx not found'); return}
  var u = clients.filter((el) => el["userIdx"] === uidx && el["trade"] === tr && data.symbol.includes(el["coin"]));
  if (!u.length) {
    return;
  }
  var glen = data.glist.length;
  for (let i = 0; i < u.length; i++) {
    var dsec = 150;
    for (let j = 0; j < glen; j++) {
      var rsec = 100 + Math.floor(Math.random() * 51);
      dsec += rsec;
      if (data.protocol === "initPosition") {
        data.glist[j].protocol = "position set";
      } else if (data.protocol === "initOrder") {
        data.glist[j].protocol = "order set";
      } else if (data.protocol === "cancelAllOrder") {
        data.glist[j].protocol = "order remove";
      }
      try {
        setTimeout(function () {
          u[i]["client"].sendUTF(JSON.stringify(data.glist[j]));
        }, dsec);
      } catch (e) {
        console.log("sv send init / cancel data err ", e);
      }
    }
  }
  // console.log("serviceobj.initLine timecheck "+  ((new Date()).getTime() - starttime)  );
};

serviceobj.initLineOrderAndPosition = function (data) {
	var uidx = data.userIdx;
  var tr = 'usdt';
  if (data.symbol.slice(-3) === 'USD') {tr = 'usd';}
  var u = clients.filter((el) => el["userIdx"] === uidx && el["trade"] === tr && data.symbol.includes(el["coin"]));
  //console.log("initLineOrderAndPosition clients:", clients);
  if (!u.length) {
    return;
  }
  for (let i = 0; i < u.length; i++) {
    // console.log("initLineOrderAndPosition Send "+i+":"+u[i].userIdx);
    u[i]["client"].sendUTF(JSON.stringify(data));
  }
};

router.get("/sym/:type/getdata", async function (req, resp) {
  //현재 가상화폐 가격
  typ = req.params.type;
  resp.send(serviceobj.sdata[`${typ}`]);
});


router.get("/history/:sym", async function (req, resp) {
  //분당 시가, 고가, 저가, 종가
  let sym = req.params.sym;
  //saveobj.selectData(sym).then((d) => resp.send(d)).catch(e => {console.log('get history err',e)});
  resp.send(await serviceobj.getHistory(sym));
});

router.get("/reset", async function (req, resp) {
  console.log('reset chart', new Date().toLocaleString());
  await serviceobj.stopM('');
  wsobj.resetVal();
  resp.send(saveobj.reset());
});

serviceobj.sendAll = async function (obj) {
  if(clients.length < 1) {
    return;
  }
  for (let u = 0; u < clients.length; u++) {
    await clients[u]["client"].sendUTF(JSON.stringify(obj));
  }
};
serviceobj.sendSym = async function (obj,sym,type) {
  if(clients.length < 1) {
    return;
  }
  for (let u = 0; u < clients.length; u++) {
    if( clients[u].coin == sym){
      await clients[u]["client"].sendUTF( '{"sise":"'+obj[type] +'"}' );
    }
  }
};

serviceobj.getHistory = async function (j) {
  console.log("event callback:" + j);
};

serviceobj.stopM = async function (j) {
  console.log("event callback:" + j);
};

process.on("uncaughtException", function (err) {
  console.error("futurebinancedata sv uncaughtException :", err);
  // process.exit();
});

module.exports = serviceobj;
