function gmailToLINE() {

  var CHANNEL_ACCESS_TOKEN = '你的 Channel access token';

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Friends');
  var numFriends = sheet.getLastRow();  
  var toArray = [];

  for (var i = 1; i <= numFriends; i++) {
    toArray.push(sheet.getRange(i, 1).getValue());
  }

  var label = GmailApp.getUserLabelByName('ToLINE');
  var messages = [];
  var threads = label.getThreads();
  
  if (threads.length == 0) return;
  
  for (var i = 0; i < threads.length; i++) {
    messages = messages.concat(threads[i].getMessages())
  }

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    var output = '*New Email*';
    output += '\n*from:* ' + message.getFrom();
    output += '\n*to:* ' + message.getTo();
    output += '\n*cc:* ' + message.getCc();
    output += '\n*date:* ' + message.getDate();
    output += '\n*subject:* ' + message.getSubject();
  }

  var userMessage = output;

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
  label.removeFromThreads(threads);
}
