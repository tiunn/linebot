var rapidAPIToken = '7a60c45de2msh65686aa4f504f00p1438e6jsn0a621be8f87e';
var rapidAPIXlateURL = 'https://microsoft-azure-translation-v1.p.rapidapi.com/';
var rapidAPIYahooURL = 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-quotes?region=US&lang=en&symbols=';

function getQuote(symbols) {
  var url = rapidAPIYahooURL + symbols;
  var options = {
    headers: {
      'X-RapidAPI-Key' : '7a60c45de2msh65686aa4f504f00p1438e6jsn0a621be8f87e',
      'X-RapidAPI-Host' : 'apidojo-yahoo-finance-v1.p.rapidapi.com'
    }
  }
  do {
    var res = UrlFetchApp.fetch(url, options);
  } while (res.getResponseCode() != 200);
  var content = res.getContentText();
  var headers = res.getHeaders();
  var json = JSON.parse(content);
  var num = json["quoteResponse"]["result"].length;
  var api_remain = headers["x-ratelimit-requests-remaining"];
  var price = '';
  
  for (var i = 0; i < num; i++) {
    var Result = json["quoteResponse"]["result"][i];
    var marketPrice = Result["regularMarketPrice"];
    var previousPrice = Result["regularMarketPreviousClose"];
    var change = Result["regularMarketChange"];
    var symbol = Result["symbol"];
    price = price + symbol + '\n--------\n股價\t' + marketPrice + '\n前日\t' + previousPrice + '\n漲跌\t' + change + '\n\n';
  }
  //Logger.log(price + 'API餘額\t' + api_remain);
  return price + 'API餘額\t' + api_remain;
}

function xlateString(from, to, string) {
  var param = "?from=" + from + "&to=" + to + "&text=" + encodeURIComponent(string);
  var url = rapidAPIXlateURL + 'translate' + param;
  
  var response = UrlFetchApp.fetch(url, {
      'headers': {
      'x-rapidapi-host': 'microsoft-azure-translation-v1.p.rapidapi.com',
      'x-rapidapi-key': rapidAPIToken,
      'accept': 'application/json',
     },
    'method': 'get',
  });
  var apiRemain = response.getHeaders()['x-ratelimit-requests-remaining'];
  var document = XmlService.parse(response.getContentText());

  return document.getAllContent()[0].getValue() + '\nAPI remain: ' + apiRemain;
}

function getXlateLangs() {
  var param = "GetLanguagesForTranslate";
  var url = rapidAPIXlateURL + param;
  
  var response = UrlFetchApp.fetch(url, {
      'headers': {
      'x-rapidapi-host': 'microsoft-azure-translation-v1.p.rapidapi.com',
      'x-rapidapi-key': rapidAPIToken,
     },
    'method': 'get',
  });
  var apiRemain = response.getHeaders()['x-ratelimit-requests-remaining'];
  var document = XmlService.parse(response.getContentText());
  var langsArray = document.detachRootElement().getChildren();
  var langs = '';
  
  langsArray.forEach( function(e) { langs = langs + e.getValue() + ', '; });

  return langs + '\nAPI remain: ' + apiRemain;
}
