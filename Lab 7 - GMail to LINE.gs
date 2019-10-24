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
    var userMessage = '*New Email*';
    userMessage += '\n*from:* ' + message.getFrom();
    userMessage += '\n*to:* ' + message.getTo();
    userMessage += '\n*cc:* ' + message.getCc();
    userMessage += '\n*date:* ' + message.getDate();
    userMessage += '\n*subject:* ' + message.getSubject();

    
    var response = sendMessage('multicast', toArray, userMessage);
    if (response.getResponseCode() == 200) {
      label.removeFromThreads(threads);
    }
  }
}
