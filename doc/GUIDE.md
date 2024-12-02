# 저장 / 불러오기 기능 

- localstorage 를 사용하여 로컬 브라우저에 저장합니다.

- saveLoadAdapter.js 파일로 작업되었으며,
main.js 의 save_load_adapter 에서 호출됩니다.





# Live Rates 시세로 변경

* 작업된 js 파일별로 설명하였습니다. 해당 파일과 함께 보시면 될 것 같습니다.


## datafeed.js ( 히스토리 생성 )

0. 히스토리를 그리기 위해 필요한 함수는 아래와 같습니다.
- getAllSymbols
- getBars

1. getAllSymbols()
- 지원되는 모든 거래소 심볼을 조회 
- 챠트의 최초 로딩시 입력한 심볼 또는, 심볼을 검색할 때 호출됩니다.
- 리턴 값은 아래와 같이 만들어주시면 됩니다.

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


2. getBars()
- 히스토리 바를 그릴 때 호출됩니다.
- 아래 인자들이 함수로 전달되며, 해당 데이터를 사용하여 히스토리 API 를 호출하여 결과 값을 만드시면 됩니다.


 symbolInfo =>
 	선택된 심볼에 대한 정보를 담고 있습니다.

 resolution => 
 	챠트에서 선택된 날짜 구간입니다. ( interval ), 기본값은 1D

 periodParams => 
 	from: (unix timestamp), 가장 왼쪽에 있는 필수 막대 시간
 	to: (unix timestamp), 가장 오른쪽 필수 막대 시간
 	firstDataRequest: 히스토리 데이터가 부족할 때, 여러번 호출될 수 있습니다. 이 때 최초 호출 여부를 식별합니다.


- 기본적으로 라이브레이츠에서 전달하는 심볼명을 히스토리 API 를 호출할 수 있게 가공합니다.
=> 
BTC_USD 를 BTC, USD 로 각각 분리하고,
조회 날짜를 지정하여 호출합니다. ( 라이브레이츠>히스토리 API 는 최대 30일 이전까지만 호출이 허용됩니다. )

예시 호출 URL) https://live-rates.com/historical/series?base=BTC&start=2022-11-26&end=2022-12-25&symbols=USD&key=e15e545da9


- 결과 리턴 구조는 아래와 같으며, onHistoryCallback 에 전달합니다.
( * 데이터가 앖을 경우에, noData: true 를 전달합니다. )

// API 에서 제공하지 않는 값들은 임의의 랜덤 값으로 대체하였습니다.
[
	{
	    "time": 1669334400000,
	    "low": 16572.569770367598,
	    "high": 16577.101818777875,
	    "open": 16491.637455822183,
	    "close": 16454.829929,
	    "volume": 181326981.23724735,
	},
	...
]




## streaming.js ( 실시간 데이터 )


실시간 데이터를 그리기 위해 필요한 함수는 아래와 같습니다.
- subscribeOnStream
- unsubscribeFromStream


1. subscribeOnStream()
- 심볼에 대한 실시간 업데이트를 수신하고자 할 때 호출됩니다.
- 전달 받은 symbolInfo 를 가지고 웹소켓의 해당 채널을 수신하면 됩니다.

- 예를 들어 아래와 같이 동작합니다.
1) 심볼 정보(symbolInfo) 수신
2) symbolInfo.name 정보를 파싱하여, 라이브레이츠 웹소켓에 보낼 instruments 키를 만든다.
3) 해당 키는 channelToSubscription 에 저장합니다.
4) 소켓이 연결될 때, "socket.emit('instruments', instruments);" 와 같이 호출되어 채널을 수신하게 됩니다.


2. unsubscribeFromStream()
- 구독 중인 심볼이 변경되었을 때, 이전 심볼의 채널 구독을 해지하기 위해 호출됩니다.



3. 웹소켓에서 메시지 수신 시에, 아래와 같이 bar 객체를 전달해주면 됩니다.

{
    "time": 1669334400000,
    "low": 16572.569770367598,
    "high": 16577.101818777875,
    "open": 16491.637455822183,
    "close": 16454.829929,
    "volume": 181326981.23724735,
}

전체 구조는 위와 같으며, 새로운 bar 객체를 만들 때 or 업데이트가 필요할 때에 맞게
데이터를 전달해주면 됩니다.






# 챠트 분할선 사용

- 챠트 상단의 Indicators 를 선택하여 생성할 스크립트를 선택하면 됩니다.
* 하단이 생기는 스크립트 들이 있으며, 'Volume Oscillator' 를 선택한 모습입니다.
( indicators.png 참고 )
