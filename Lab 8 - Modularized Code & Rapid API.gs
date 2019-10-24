var CHANNEL_ACCESS_TOKEN = '';
var baseURL = 'https://api.line.me/v2/bot/message/';
var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

var rapidAPIToken = '';
var rapidAPIXlateURL = 'https://microsoft-azure-translation-v1.p.rapidapi.com/';

var rapidAPIYahooURL = 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-quotes?region=US&lang=en&symbols=';

function doPost(e) {
  var msg= JSON.parse(e.postData.contents);
  console.log(msg);
  
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;
  var keyword = userMessage.toLowerCase().split(":");
  var help = "gas\t\t\t\t油價預估\nid\t\t\t\t帳號ID\nxlate:{f},{t}:{str}翻譯\nc2e:{string}\t中翻英\ne2c:{string}\t英翻中\nlangs\t\t\t語言代碼\nq:{q}\t\t\t\股價查詢";
  
  switch (keyword[0]) {
    case 'gas':
      userMessage = getGasPrice();
      break;
    case 'id':
      var userID = msg.events[0].source.userId;
      userMessage = userID;
      break;
    case 'q':
      var symbols = keyword[1];
      userMessage = getQuote(symbols);
      break;
    case 'xlate':
      var xlate = keyword[1].split(",");
      var from = xlate[0];
      var to = xlate[1];
      var string = keyword[2];
      userMessage = xlateString(from, to, string);
      break;
    case 'c2e':
      var from = 'zh-CHT';
      var to = 'en';
      var string = keyword[1];
      userMessage = xlateString(from, to, string);
      break;
    case 'e2c':
      var from = 'en';
      var to = 'zh-CHT';
      var string = keyword[1];
      userMessage = xlateString(from, to, string);
      break;
    case 'langs':
      userMessage = getXlateLangs();
      break;
    case 'help':
      userMessage = help;
      break;
    default:
      return;
  }
  if (typeof replyToken === 'undefined') {
    return;
  }  

  sendMessage('reply', replyToken, userMessage);
}

function doPush() {
  var sheet = spreadsheet.getSheetByName('Friends');
  var toID = sheet.getRange("a1").getValue();
  
  sendMessage('push', toID, getGasPrice());
}

function doMulticast() {
  sendMessage('multicast', getFriends(), getGasPrice());
}

function gmailToLINE() {
  var toArray = getFriends();
  var label = GmailApp.getUserLabelByName('ToLINE');
  var messages = [];
  var threads = label.getThreads();
  
  if (threads.length == 0) return;
  
  for (var i = 0; i < threads.length; i++) {
    messages = messages.concat(threads[i].getMessages())
  }

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    var userMessage = '*New Email*';
    userMessage += '\n*from:* ' + message.getFrom();
    userMessage += '\n*to:* ' + message.getTo();
    userMessage += '\n*cc:* ' + message.getCc();
    userMessage += '\n*date:* ' + message.getDate();
    userMessage += '\n*subject:* ' + message.getSubject();
    //userMessage += '\n*body:* ' + message.getPlainBody();
    var response = sendMessage('multicast', toArray, userMessage);
    if (response.getResponseCode() == 200) {
      label.removeFromThreads(threads);
    }
  }
}

function sendMessage(sendType, destination, text) {
  var url = baseURL + sendType;
  var payload = {
    'to': destination,
    'messages': [{
      'type': 'text',
      'text': text,
      }],
  };
  
  if (sendType == 'reply') {
    payload.replyToken = destination;
    delete payload.to;
  }
  var response = UrlFetchApp.fetch(url, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
     },
    'method': 'post',
    'payload': JSON.stringify(payload),
  });

  return response;
}

function getQuote(symbols) {
  var url = rapidAPIYahooURL + symbols;
  var options = {
    headers: {
      'X-RapidAPI-Key' : rapidAPIToken,
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


function getGasPrice() {
  var sheet = spreadsheet.getSheetByName('Price');
  var price = sheet.getRange("a2").getValue();
  return price;
}

function getFriends() {
  var sheet = spreadsheet.getSheetByName('Friends');
  var numFriends = sheet.getLastRow();
  var toArray = [];
  
  for (var i = 1; i <= numFriends; i++) {
    toArray.push(sheet.getRange(i, 1).getValue());
  }
  return toArray;
}

function doGet(e) {
}
