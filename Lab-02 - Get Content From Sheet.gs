var CHANNEL_ACCESS_TOKEN = '你的 Channel access token';
var sheetName = '你的工作表名稱';
var cellName = '訊息格';

function doPost(e) {

  var msg = JSON.parse(e.postData.contents);
  console.log(msg);

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var price = sheet.getRange(cellName).getValue();


  // 取出 replayToken 和發送的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = price;

  if (typeof replyToken === 'undefined') {
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
