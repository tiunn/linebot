function doPost(e) {

  var CHANNEL_ACCESS_TOKEN = '你的 Channel access token';
  var msg = JSON.parse(e.postData.contents);
  console.log(msg);

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Price');
  var price = sheet.getRange("a2").getValue();


  // 取出 replayToken 和發送的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;

  if (typeof replyToken === 'undefined') {
    return;
  }
  
  switch (userMessage.toLowerCase()) {
    case 'gas':
      userMessage = price;
      break;
    default:
      return;
  }

  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': userMessage,
      }],
    }),
  });
}