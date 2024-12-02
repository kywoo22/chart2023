//var binanceobj = require("./websocket");
var askbidobj = {};
askbidobj.fPrice = [];
askbidobj.pdata = {};
var mlist = ['BTC','ETH','XRP','TRX','DOGE','LTC','SAND','ADA','GMT','APE','GALA','ROSE','KSM','DYDX','RVN','ETC','BCH','CELR','EOS','MATIC','SOL','QTUM','LINK','AVAX','CHZ','SHIB','PEPE','XMR','DOT','FTM','NEAR','BOME','ZEC','UNI','LDO','BNB']; //##
var coinList = { BTC: 0, ETH: 1, XRP: 2, TRX: 3, DOGE:4, LTC:5, SAND:6, ADA:7, GMT:8, APE:9, GALA:10, ROSE:11, KSM:12, DYDX:13, RVN:14, ETC:15, BCH:16, CELR:17, EOS:18, MATIC:19,
                SOL:20, QTUM:21, LINK:22, AVAX:23, CHZ:24, SHIB:25, PEPE:26, XMR:27, DOT:28, FTM:29, NEAR:30, BOME:31, ZEC:32, UNI:33, LDO:34, BNB:35}; //##
for(let i=0; i<mlist.length; i++) {
  askbidobj.pdata[mlist[i]] = {};
  askbidobj.pdata[mlist[i]]['symbol'] = mlist[i]+'USDT';
}

function coinNumToSym (num) {
	for (var cn in coinList) {
		if (coinList[cn] === num) {
			return cn;
		}
	}
}

askbidobj.connection = null;
askbidobj.onLineData = async function (j) {
  console.log("event callback:" + j);
};
askbidobj.initLine = async function (j) {
  console.log("event callback:" + j);
};
askbidobj.initLineOrderAndPosition = async function (j) {
  console.log("event callback:" + j);
};
askbidobj.cancelOrders = async function (j) {
  console.log("event callback:" + j);
};

askbidobj.setData = function (d) {
  this.siseobj = d;
};
askbidobj.manipulation = async function (j) {
  console.log("event callback:" + j);
}

askbidobj.checkM = async function(client, sym) {
  console.log("event callback:");
}

var clients = [];
var stopM = false;

const WebSocketServer = require("websocket").server;
const https = require("https");
const http = require("http");
var fs = require("fs");
const express = require("express");
const cors = require("cors");
const app2 = express();
var router = express.Router();
app2.use(cors());
app2.use("/", router);

/////////////////////////////////////server https
const port2 = 8287;
const port = 8288;
var https_options = {
  ca: fs.readFileSync('C:/Apache24/conf/ssl.pem'),
  key: fs.readFileSync('C:/Apache24/conf/new.key'),
  cert: fs.readFileSync('C:/Apache24/conf/ssl.crt')
};
const server2 = https.createServer(https_options, app2);
server2.listen(port2, function () {
  //console.log(new Date() + " Server is listening on port " + port2);
});
const wsServer2 = new WebSocketServer({
  //웹소켓 서버 생성
  httpServer: server2,
  autoAcceptConnections: false,  
});
// wsServer2.on('request', async function(request) {
// 	OnRequest(request);
// });
///////////////////////////////////////////////////

// const port = 8287; //local
const server = http.createServer(app2);
//server.maxConnections = 2;
server.listen(port, function () {
  //console.log(new Date() + " Server is listening on port " + port);
});
const wsServer = new WebSocketServer({
  //웹소켓 서버 생성
  httpServer: server,
  autoAcceptConnections: false,
});

function OnRequest(request, isServer) {
  let starttime = new Date().getTime();
  let nowclient = request.accept();
  if (isServer == false) {
    nowclient.thisok = "ok";
    nowclient.symbol = "BTCUSDT";
    // nowclient.tick = "t001";
    let obj = { protocol: "RUOK" };
    nowclient.sendUTF(JSON.stringify(obj));
    console.log(new Date() + "클라이언트가 시세에 접속1 ab Connection accepted." + clients.length);
  } else if(isServer === true) {
    nowclient.userIdx = -1;
    let mobj = {};
    mobj.protocol = 'resetM';
    mobj.t = new Date().toLocaleString();
    nowclient.sendUTF(JSON.stringify(mobj));
    console.log('send reset m');
    let obj = { protocol: "RUOK" };
    nowclient.sendUTF(JSON.stringify(obj));
    console.log(new Date() + "클라이언트가 시세에 접속2 ab Connection accepted." + clients.length);
  }

  nowclient.on("message", async function (message) {
    //console.log("onMessage : " + message.utf8Data);
    //if(objData.protocol == 'exit'){
    //				console.log("receive EXIT CODE:"+message.utf8Data+" :"+(new Date()) );
    //			process.exit();
    //}
    if (message.type == "utf8") {
      let objData = JSON.parse(message.utf8Data);

      if (objData.protocol === "cancelAllOrder") {
        askbidobj.initLine(objData);
      } else if (objData.protocol === "initOrderAndPosition") {
        askbidobj.initLineOrderAndPosition(objData);
      } else if (
        objData.protocol === "order set" ||
        objData.protocol === "order remove" ||
        objData.protocol === "position set" ||
        objData.protocol === "remove Position"
      ) {       
        try {
          askbidobj.onLineData(objData);
        } catch (e) {
          console.log("ab send line err", e);
        }
      }
      // if (objData.protocol === "sendHoga") {
      //   //console.log("hoga00", objData)
      //   // if (objData.coinNum === 0) {
      //   binanceobj.set(objData);
      //   // }
      // }
      
      // if (objData.protocol === "sendUnitPacket") {
      //   this.tick = objData.unitv;
      // }
      else if (objData.protocol === "imok") {
        this.thisok = "ok";
        this.userIdx = objData.userIdx;
        this.locate = objData.locate;
        this.symbol = "BTCUSDT";
        let mr = await askbidobj.checkM(this, "BTC");
        if(mr !== 'f') {
          nowclient.sendUTF(JSON.stringify(mr));
        }
        if(!clients.find(e => e == this)) {
          clients.push(this);
        }
      } else if (objData.protocol === "changeCoin") {
        this.symbol = objData.coin;
        let mr = askbidobj.checkM(this, (objData.coin).replace('USDT',''));
        if(mr !== 'f') {
          nowclient.sendUTF(JSON.stringify(mr));
        }
      } else if (objData.protocol === "manipulateValue") {
        console.log('ab getmv', objData);
        askbidobj.manipulation(objData);
      }
    }
  });
  nowclient.on("close", async function (reasonCode, description) {
    clients = clients.filter((u) => u != this);
    console.log(new Date().toLocaleString()+"   ab onclose ; clients.length:::::", clients.length);
  });
}
wsServer.on("request", async function (request) {
  console.log("우리 서버가 손님으로 왔네요.");
  OnRequest(request, true);
});
wsServer2.on("request", async function (request) {
  OnRequest(request, false);
});
askbidobj.getData = async function (sym, data, tick) {
  if (sym === 0) {
    // askbidobj.bdata[`t${tick}`] = data;
    // await askbidobj.sendAll(askbidobj.bdata);
  } else if (sym === 1) {
    // askbidobj.edata[`t${tick}`] = data;
    // await askbidobj.sendAll(askbidobj.edata);
  } else if (sym === 2) {
    // askbidobj.xdata[`t${tick}`] = data;
    // await askbidobj.sendAll(askbidobj.xdata);
  } else if (sym === 3) {
    // askbidobj.tdata[`t${tick}`] = data;
    // await askbidobj.sendAll(askbidobj.tdata);
  } else if (sym === 4) {
    // askbidobj.ddata[`t${tick}`] = data;
    // await askbidobj.sendAll(askbidobj.ddata);
  }
};

askbidobj.getPData = async function (sym, data) {
  data = data.toString();
  let c = coinNumToSym(sym);
  askbidobj.pdata[c]["price"] = data;
  askbidobj.sendAll(askbidobj.pdata[c]);
};

askbidobj.getFData = async function (sym, data) {
  data = data.toString();
  let c = coinNumToSym(sym);
  try {
    askbidobj.pdata[c]["fundingRate"] = data;
  }catch(e) {

  }
};

askbidobj.getTData = async function (sym, data) {
  if (sym === 0) {
    // askbidobj.bdata["tradeList"] = data;
  } else if (sym === 1) {
    // askbidobj.edata["tradeList"] = data;
  }
};

askbidobj.getSise = async function (sym, obj) {
  let c = coinNumToSym(sym);
  askbidobj.pdata[c]["sise"] = obj;
};

askbidobj.getSData = async function (sym, data) {
  let c = coinNumToSym(sym);
  askbidobj.pdata[c]["sprice"] = data;
};

askbidobj.getEData = async function (data) {
  for(let i=0; i<mlist.length; i++) {
    try {
      askbidobj.pdata[mlist[i]]["exchangeRate"] = data.toString();
    }catch(e){

    }
  }
};

askbidobj.getCData = async function (sym, data) {
  if (sym === 0) {
    // askbidobj.bdata["fluctuation"] = data;
  } else if (sym === 1) {
    // askbidobj.edata["fluctuation"] = data;
  } else if (sym === 2) {
    // askbidobj.xdata["fluctuation"] = data;
  } else if (sym === 3) {
    // askbidobj.tdata["fluctuation"] = data;
  } else if (sym === 4) {
    // askbidobj.ddata["fluctuation"] = data;
  }
};

askbidobj.getLowHigh = async function (sym, low, high, per, price) {
  let c = coinNumToSym(sym);
  // console.log(c, sym, askbidobj.pdata[c]);
  try {
    askbidobj.pdata[c]["changePercent"] = per;
  }catch(e) {

  }
};
var bsocket = null;
askbidobj.SetSocket=function( obj){
  bsocket = obj;
}
askbidobj.sendUserData = async function (data) {

  let starttime = new Date().getTime();
  if (data.userIdx === null) {
    return;
  }
  data.protocol = "user connected";  

  for (let u = 0; u < clients.length; u++) {
    if (clients[u].userIdx == data.userIdx) {      
      clients[u].sendUTF(JSON.stringify(data));
    }
  }
  console.log(clients.length+') data.userIdx ::' , data.userIdx);
};

router.get("/btc", async function (req, resp) {
  //현재 가상화폐 가격
  resp.send(askbidobj.bdata);
});

router.get("/btc/:tick", async function (req, resp) {
  //현재 가상화폐 가격
  tick = req.params.tick;
  resp.send(askbidobj.bdata[`${tick}`]);
});

router.get("/eth", async function (req, resp) {
  //현재 가상화폐 가격
  resp.send(askbidobj.edata);
});

router.get("/eth/:tick", async function (req, resp) {
  //현재 가상화폐 가격
  tick = req.params.tick;
  resp.send(askbidobj.edata[`${tick}`]);
});

router.get("/xrp", async function (req, resp) {
  //현재 가상화폐 가격
  resp.send(askbidobj.xdata);
});

router.get("/trx", async function (req, resp) {
  //현재 가상화폐 가격
  resp.send(askbidobj.tdata);
});

router.get("/doge", async function (req, resp) {
  //현재 가상화폐 가격
  resp.send(askbidobj.ddata);
});



router.get("/reinit", async function (req, resp) {
  bsocket.reconnectFstream();
  resp.send('{"result":"suc"}');
});


askbidobj.sendMsg = async function (o) {
  await askbidobj.sendAll(o)
}

askbidobj.send = async function (client, obj) {
  if(!client || clients.length <= 0) {
    return;
  }
  for (let u = 0; u < clients.length; u++) {
    if (clients[u] == client){
      try {
        await clients[u].sendUTF(JSON.stringify(obj));
      }catch(e) {
        console.error('sendAll err'+new Date().toLocaleString()+new Date().getMilliseconds());
      }
    }
    // else if (  
    //       (clients[u].thisok == "ok" && clients[u].userIdx != -1 && clients[u].symbol == obj.symbol)
    //     || clients[u].locate == "wallet") {
    //   // console.log("b sendAll uidx:",clients[u].userIdx, clients[u].locate );
    //     await clients[u].sendUTF(JSON.stringify(obj));
    // }
  }
};

let queuedData = [];
let processInterval = 200;

function processQueue() {
  if (queuedData.length > 0) {
    let dataToSend = queuedData.reduce((acc, data) => {
      acc.push(data);
      return acc;
    }, []);

    queuedData = [];

    for (let u = 0; u < clients.length; u++) {
      if (clients[u].userIdx == -1 || clients[u].locate == "wallet" || !dataToSend.symbol) {
        try {
          clients[u].sendUTF(JSON.stringify(dataToSend));
        } catch (e) {
          console.error('sendAll err ' + new Date().toLocaleString() + ' ' + new Date().getMilliseconds());
        }
      }
    }
  }
}

setInterval(processQueue, processInterval);

askbidobj.sendAll = async function (obj) {
  queuedData.push(obj);
};

process.on("uncaughtException", function (err) {
  console.error("futurebinancedata ab uncaughtException :", err);
  // process.exit();
});

module.exports = askbidobj;
