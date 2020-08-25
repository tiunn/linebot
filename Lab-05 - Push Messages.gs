var CHANNEL_ACCESS_TOKEN = '你的 Channel access token';
var sheetName = '你的Friend工作表名稱';
var cellName = '訊息格';

function doPush() {

  var CHANNEL_ACCESS_TOKEN = '你的 Channel access token';

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var toID = sheet.getRange(cellName).getValue();
  
  sheet = spreadsheet.getSheetByName('Price');
  var price = sheet.getRange("a2").getValue();
  
  var userMessage = price;


  var url = 'https://api.line.me/v2/bot/message/push';
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
