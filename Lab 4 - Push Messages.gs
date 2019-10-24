function doPush() {

  var CHANNEL_ACCESS_TOKEN = '你的 Channel access token';

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Friends');
  var toID = sheet.getRange("a1").getValue();
  
  sheet = spreadsheet.getSheetByName('Price');
  var price = sheet.getRange("a2").getValue();

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
      'to': toID,
      'messages': [{
        'type': 'text',
        'text': userMessage,
      }],
    }),
  });
}
