var CHANNEL_ACCESS_TOKEN = '你的 Channel access token';
var sheetName = '你的Friend工作表名稱';
var cellName = '訊息格';

function doMulticast() {

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var numFriends = sheet.getLastRow();
  var toArray = [];
  
  for (var i = 1; i <= numFriends; i++) {
    toArray.push(sheet.getRange(i, 1).getValue());
  }

  sheet = spreadsheet.getSheetByName('Price');
  var price = sheet.getRange(cellName).getValue();
  
  var userMessage = price;

  var url = 'https://api.line.me/v2/bot/message/multicast';
  UrlFetchApp.fetch(url, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': toArray,
      'messages': [{
        'type': 'text',
        'text': userMessage,
      }],
    }),
  });
}
