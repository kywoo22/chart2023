//const mysql = require("mysql2/promise");

// const pool = mysql.createPool({
//   host: "localhost",
//   port: 3306,
//   user: "bmbit",
//   password: "qldpaqltrhdiddl@rnlduqek!1108",
//   database: "bmbit",
//   connectionLimit: 50,
// });

var saveobj = {};
saveobj.tData = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [], 13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: [], 24: [], 25: [], 26: [], 27: [], 28: [], 29: [], 30: [], 31: [], 32: [], 33: [], 34: [], 35: []}; //##
saveobj.chData = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {}, 12: {}, 13: {} , 14: {}, 15: {}, 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: [], 24: [], 25: [], 26: [], 27: [], 28: [], 29: [], 30: [], 31: [], 32: [], 33: [], 34: [], 35: []}; //##
saveobj.sendResult = function (j) {
  // console.log("event callback:" + j);
};

saveobj.selectData = function (sym) {
  var yesterday = new Date() - 24 * 60 * 60;
	var back = new Date();
  back.setTime(parseInt(yesterday));
  saveobj.tData[`${sym}`] = saveobj.tData[`${sym}`].filter(e => new Date().getTime(e.time) > back);
  dataform(saveobj.tData[`${sym}`], sym);
};

saveobj.updateCloseData = function (o, h, l, c, tstr, mintype, sym, v) {
  let ts = tstr.split(":");
  let startTime = ts[0].concat(":") + ts[1].concat(":") + "00";
  let cres = (saveobj.tData[`${sym}`]).find(e => e.rtime === startTime);
  if(!cres) {
    let cobj = {};
    cobj.rtime = startTime;
    cobj.ropen = o;
    cobj.rhigh = h;
    cobj.rlow = l;
    cobj.rclose = c;
    cobj.rvol = v;
    cobj.result = null;
    saveobj.tData[`${sym}`].push(cobj);
    saveobj.selectData(sym);
  } else {
    cres.rhigh = h;
    cres.rlow = l;
    cres.rclose = c;
    cres.rvol = v;
    saveobj.selectData(sym);
  }
};
saveobj.updateResultData = function (result, tstr, mintype, sym, o) {
    let ts = tstr.split(":");
    if (ts.length < 2) {
      return;
    } else {
      let startTime = ts[0].concat(":") + ts[1].concat(":") + "00";
      let cres = saveobj.tData[`${sym}`].find(e => e.rtime === startTime);
      if(cres) {
        cres.result = result;
        saveobj.selectData(sym);
      }
  }
};
saveobj.createOpenData = function (tstr, mintype, sise, sym) {
    let ts = tstr.split(":");
    let startTime = ts[0].concat(":") + ts[1].concat(":") + "00";
    let cres = (saveobj.tData[`${sym}`]).find(e => e.rtime === startTime);
    if(!cres) {
      let cobj = {};
      cobj.rtime = startTime;
      cobj.ropen = sise;
      cobj.rhigh = sise;
      cobj.rlow = sise;
      cobj.rclose = sise;
      cobj.rvol = 0;
      cobj.result = null;
      saveobj.tData[`${sym}`].push(cobj);
      saveobj.selectData(sym);
    }
};

saveobj.getHistory = function (sym) {
  return saveobj.chData[`${sym}`];
}

saveobj.reset = function () {
  saveobj.tData = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [], 13: [], 14: [], 15: [], 16: [], 17: [] , 18: [], 19: [], 20: [], 21: [], 22: [], 23: [], 24: [], 25: [], 26: [], 27: [], 28: [], 29: [], 30: [], 31: [], 32: [], 33: [], 34: [], 35: []}; //##
  saveobj.chData = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {}, 12: {}, 13: {}, 14: {}, 15: {}, 16: {}, 17: {}, 18: {}, 19: {}, 20: {}, 21: {}, 22: {}, 23: {}, 24: {}, 25: {}, 26: {}, 27: {}, 28: {}, 29: {}, 30: {}, 31: {}, 32: {}, 33: {}, 34: {}, 35: {}}; //##
  return 'ok';
}

function dataform(darray, sym) {
  var farr = darray;
  //var farr = darray.filter(i => Math.floor(parseInt(new Date(i.rtime)/1000)/10)*10 % 60 === 0 && i.rkind === 1 && i.rhigh !== i.rlow);
  let obj = new Object();
  try {
    obj.FirstValueInArray = true;
    obj.HasWarning = false;
    obj.RateLimit = new Object();
    obj.Type = 100;
    obj.TimeFrom = new Date(farr[0].rtime).getTime() / 1000;
    obj.TimeTo = new Date(farr[farr.length - 1].rtime).getTime() / 1000;
    obj.Aggregated = false;
    obj.ConversionType = new Object();
    obj.ConversionType.conversionSymbol = "";
    obj.ConversionType.type = "force_direct";
    obj.Data = new Array();
    for (let i = 0; i < farr.length; i++) {
      obj.Data[i] = new Object();
      obj.Data[i].high = farr[i].rhigh;
      obj.Data[i].low = farr[i].rlow;
      obj.Data[i].open = farr[i].ropen;
      obj.Data[i].close = farr[i].rclose;
      obj.Data[i].time =
        Math.floor(parseInt(new Date(farr[i].rtime) / 1000) / 10) * 10;
      obj.Data[i].volumefrom = farr[i].rvol;
      obj.Data[i].volumeto = "";
    }
    saveobj.chData[`${sym}`] = obj;
    return obj;
  }catch(e) {
    return null;
  }
}

//================ export part
module.exports = saveobj;

process.on("uncaughtException", function (err) {
  console.error("futurebinancedata save uncaughtException :", err);
  // process.exit();
});
