function min(type, tp) {
  this.mintype = type;
  this.o = 0;
  this.h = 0;
  this.l = 0;
  this.c = 0;
  this.vol = 0;
  this.futureResult = -1;
  this.futureResultNow = -1;
  this.pip = tp;
  this.tstr = "N";
  this.result = -1;
  this.pre = -1;
  this.count = 0;
  this.m = '';
  // this.firstToSecond = async function () {
  //   this.o2 = this.o;
  //   this.h2 = this.h;
  //   this.l2 = this.l;
  //   this.c2 = this.c;
  // };
  // this.firstToSecond();
  this.setOpenValue = function (o, h, l, c, rvol, v, ts) {
    //console.log('setval',o, h, l, c, rvol, v, ts);
    if(this.m === 'on') {
      this.o = v;
      this.h = v;
      this.l = v;
      this.c = v;
    } else {
      this.o = o;
      this.h = h;
      this.l = l;
      this.c = c;
    }
    this.vol = parseFloat(rvol);
    this.result = -1;
    this.tstr = ts;
    this.count++;
  };
  this.setHighLowCloseAndResultCompute = function (h, l, c, v, rvol) {
    if(this.m === 'on' && rvol === null) {
      if (v > this.h) {this.h = v;}
      if (v < this.l) {this.l = v;}
      this.c = v;
      //console.log('on m', v, 'h;',this.h,'l;',this.l);
    } else if(rvol !== null){
      if (h > this.h) {this.h = h;}
      if (l < this.l) {this.l = l;}
      this.c = c;
    }
    if(parseFloat(rvol) > 0) {
      this.vol = parseFloat(rvol);
    }
    // if (this.o + this.pip <= v && this.result == -1) {
    //   this.result = 0;
    //   return 1;
    // }
    // if (this.o - this.pip >= v && this.result == -1) {
    //   this.result = 1;
    //   return 1;
    // }
    return 0;
  };
  this.resetVal = function(data) {
    console.log('resetv',data);
    this.o = data.o;
    this.h = data.h;
    this.l = data.l;
    this.c = data.c;
    this.vol = parseFloat(data.v);
  }
  this.isMinChange = function (min) {
    if (this.pre != min && min % this.mintype == 0) {
      this.pre = min;
      //console.log('　　　 ====== min changed',new Date().toLocaleString());
      return true;
    }
    return false;
  };
}

var saveobj = null;
var siseobj = new Object();
siseobj.mytime = new Date();
siseobj.tstr = "N";
siseobj.data = {
  0: new min(1, 1),
  1: new min(1, 0.1),
  2: new min(1, 0.0001),
  3: new min(1, 0.00001),
  4: new min(1, 0.00001),
  5: new min(1, 0.01),
  6: new min(1, 0.0001),
  7: new min(1, 0.0001),
  8: new min(1, 0.001),
  9: new min(1, 0.001),
  10: new min(1, 0.00001),
  11: new min(1, 0.00001),
  12: new min(1, 0.01),
  13: new min(1, 0.00001),
  14: new min(1, 0.00001),
  15: new min(1, 0.001),
  16: new min(1, 0.1),
  17: new min(1, 0.00001),
  18: new min(1, 0.0001),
  19: new min(1, 0.0001),
  20: new min(1, 0.001),
  21: new min(1, 0.001),
  22: new min(1, 0.001),
  23: new min(1, 0.001),
  24: new min(1, 0.00001),
  25: new min(1, 0.00001),
  26: new min(1, 0.0000001),
  27: new min(1, 0.01),
  28: new min(1, 0.001),
  29: new min(1, 0.0001),
  30: new min(1, 0.001),
  31: new min(1, 0.000001),
  32: new min(1, 0.01),
  33: new min(1, 0.001),
  34: new min(1, 0.0001),
  35: new min(1, 0.01)
}; //##
var coin = { BTC: 0, ETH: 1, XRP: 2, TRX: 3, DOGE:4, LTC:5, SAND:6, ADA:7, GMT:8, APE:9, GALA:10, ROSE:11, KSM:12, DYDX:13, RVN:14, ETC:15, BCH:16, CELR:17, EOS:18, MATIC:19,
            SOL:20, QTUM:21, LINK:22, AVAX:23, CHZ:24, SHIB:25, PEPE:26, XMR:27, DOT:28, FTM:29, NEAR:30, BOME:31, ZEC:32, UNI:33, LDO:34, BNB:35}; //##

siseobj.setSaveobj = function (so) {
  saveobj = so;
};
siseobj.createTimeSTR = function (ctime, ttime) {
  this.tstr = new Date();
  this.mytime.setTime(parseInt(ctime)); // j.T
  let ktime = new Date();
  ktime.setTime(parseInt(ttime));
  this.tstr =
    "" +
    ktime.getFullYear() +
    "-" +
    ("0" + (ktime.getMonth() + 1)).substr(-2) +
    "-" +
    ("0" + ktime.getDate()).substr(-2) +
    "T" +
    ("0" + ktime.getHours()).substr(-2) +
    ":" +
    ("0" + ktime.getMinutes()).substr(-2) +
    ":" +
    ("0" + ktime.getSeconds()).substr(-2); // + "." + this.mytime.getMilliseconds();
  return this.tstr;
};
siseobj.computeCurrentSise = function (j, ctime) {
  if(j == undefined) {return}
  let sisymbol = j.s.replace("USDT", "");
  let sym = coin[sisymbol];
  this.createTimeSTR(ctime, j.t);
  let sise = parseFloat(j.c); //j.p
  let changert = 0;
  if ( siseobj.data[`${sym}`].futureResult != -1 && siseobj.data[`${sym}`].futureResultNow == -1
  ) {
    if (siseobj.data[`${sym}`].futureResult == 0) {
      console.log(
        sise +
          "==핍 변경 적용됨==>" +
          (siseobj.data[`${sym}`].o + siseobj.data[`${sym}`].pip * 1.2)
      );
      sise = siseobj.data[`${sym}`].o + siseobj.data[`${sym}`].pip * 1.2;
    } else if (siseobj.data[`${sym}`].futureResult == 1) {
      console.log(
        sise +
          "==핍 변경 적용됨==>" +
          (siseobj.data[`${sym}`].o - siseobj.data[`${sym}`].pip * 1.3)
      );
      sise = siseobj.data[`${sym}`].o - siseobj.data[`${sym}`].pip * 1.3;
    }
    siseobj.data[`${sym}`].futureResult = -1;
  }
  //await chartobj.getData(sise, ctime, j.s); // j.T
    if (
      siseobj.data[`${sym}`].isMinChange(j.t) == true
    ) {
      siseobj.data[`${sym}`].futureResultNow = -1;
      if (siseobj.data[`${sym}`].count > 1) {
        // if (siseobj.data[`${sym}`].result == -1) {
        //   //미진행처리
        //   console.log(
        //     "미진행 " +
        //       siseobj.data[`${sym}`].mintype +
        //       " type " +
        //       siseobj.data[`${sym}`].tstr +
        //       " 결과:" +
        //       siseobj.data[`${sym}`].result +
        //       " 시가:" +
        //       siseobj.data[`${sym}`].o
        //   );
        // }
        //고가,저가, 종가 DB 기록
        // await saveobj.updateCloseData(
        //   siseobj.data[`${sym}`].h,
        //   siseobj.data[`${sym}`].l,
        //   siseobj.data[`${sym}`].c,
        //   siseobj.data[`${sym}`].tstr,
        //   siseobj.data[`${sym}`].mintype,
        //   sym,
        //   siseobj.data[`${sym}`].vol
        // );
        //siseobj.data[`${sym}`].firstToSecond();
        /*if (siseobj.data[`${sym}`].mintype == 1)
          console.log(
            siseobj.data[`${sym}`].mintype +
              " type " +
              siseobj.data[`${sym}`].tstr +
              // " 결과:" +
              // siseobj.data[`${sym}`].result +
              " 시가:" +
              siseobj.data[`${sym}`].o +
              " H:" +
              siseobj.data[`${sym}`].h +
              " L:" +
              siseobj.data[`${sym}`].l +
              " c:" +
              siseobj.data[`${sym}`].c
          );*/
      }
      siseobj.data[`${sym}`].setOpenValue(j.o, j.h, j.l, j.c, j.v, sise, this.tstr);
      if (siseobj.data[`${sym}`].count >= 1) {
      //   await saveobj.createOpenData(
      //     this.tstr,
      //     siseobj.data[`${sym}`].mintype,
      //     siseobj.data[`${sym}`].o,
      //     siseobj.data[`${sym}`].h,
      //     siseobj.data[`${sym}`].l,
      //     siseobj.data[`${sym}`].c,
      //     sym
      //   );
      }
    }
    saveobj.updateCloseData(
      siseobj.data[`${sym}`].o,
      siseobj.data[`${sym}`].h,
      siseobj.data[`${sym}`].l,
      siseobj.data[`${sym}`].c,
      siseobj.data[`${sym}`].tstr,
      siseobj.data[`${sym}`].mintype,
      sym,
      siseobj.data[`${sym}`].vol
    );
    if (siseobj.data[`${sym}`].setHighLowCloseAndResultCompute(j.h, j.l, j.c, sise, j.v) == 1) {
      //결과가 변경되었으면 db에 기록
      // saveobj.updateResultData(
      //   siseobj.data[`${sym}`].result,
      //   siseobj.data[`${sym}`].tstr,
      //   siseobj.data[`${sym}`].mintype,
      //   sym,
      //   siseobj.data[`${sym}`].o
      // );
      changert += j;
    }
  return changert;
};
siseobj.getTimeStr = function () {
  return this.tstr;
};

module.exports = siseobj;

process.on("uncaughtException", function (err) {
  console.error("futurebinancedata ss uncaughtException :", err);
  // process.exit();
});