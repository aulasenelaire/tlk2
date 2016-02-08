// var showPageAction = function(tabId) {
//   chrome.browserAction.show(tabId);
// }

// Show page action on each page update
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // console.log('chrome.browserAction', chrome.browserAction);
  // showPageAction(tabId)
// });

// if (chrome.pageAction) {
//   chrome.pageAction.onClicked.addListener(function(tab) {
//     // No tabs or host permissions needed!
//     console.log('Turning ' + tab.url + ' red!');
//     chrome.tabs.executeScript({
//       code: 'document.body.style.backgroundColor="red"'
//     });
//     chrome.pageAction.setPopup('')
//   });
// }

  // // Send a message to the active tab
  // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //   var activeTab = tabs[0];
  //   console.log('onActiveTab', activeTab.id);
  //   chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  // });

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
//     debugger;
//     console.log(tabs[0])
//     chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
//   })
// });
