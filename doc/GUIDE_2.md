# 시세를 골드로 변경하는 방법

* 현재 작업된 소스를 기준으로 설명합니다.


1. 일단 골드 시세를 라이브레이츠에서 지원하는지 찾아봐야 합니다.

- 실시간 업데이트를 지원하는 목록 확인
https://live-rates.com/api/rates?key=e15e545da9
* XAU_USD 를 지원하고 있습니다.

- 히스토리를 지원하는 목록 확인
https://www.live-rates.com/historical/list?key=a1ea04e8d3
* 골드의 경우, XAU 와 USD 가 히스토리를 지원합니다.
* 히스토리는 BASE 와 Symbol 로 비교할 화폐를 쌍으로 전달해주어야 합니다.




2. main.js 에서 symbol 값을 XAU_USD 로 변경합니다.

- symbol: 'LiveRates:BTC_USD' => symbol: 'LiveRates:XAU_USD' 
( 예: exchange:symbol)

변경 시, 코드에서 자동으로 아래와 같이 호출하게 됩니다.
예: https://live-rates.com/historical/series?base=XAU&start=2022-11-29&end=2022-12-27&symbols=USD&key=e15e545da9




3. 변경이 완료되었습니다.
