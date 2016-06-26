// The MIT License (MIT)
// 
// Copyright (c) 2016 Timotheos Samartzidis
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    var title = tab.title;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    console.assert(typeof title == 'string', 'tab.title should be a string');
    callback(url, title);
  });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

function getPublishingDate(url, title, callback, errorCallback) {
  var searchUrl = 'http://web.archive.org/cdx/search/cdx?fl=timestamp&limit=1&output=json&matchType=exact&url=' + url;
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  x.responseType = 'json';
  x.onload = function() {
    var response = x.response;
    if (!response || !response[1] || !response[1][0] || !response[1][0].length >6 ) {
      errorCallback(url, title);
      return;
    }
    console.dir(response);
    var timestamp = response[1][0];
    console.assert(typeof timestamp == 'string', 'Unexpected respose from the Google Image Search API!');
    var year = '';
    var month = '';
    if(timestamp.length>6){
      year=timestamp.substr(0,4);
      month=timestamp.substr(4,2);
    }
    callback(url,title,year,month);
  };
  x.onerror = function() {
    errorCallback(url, title);
  };
  x.send();
} 

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url, title) {
    getPublishingDate(url, title, function(url, title, year, month){
      var currentdate = new Date();
      var bta = title.replace(/[^A-Z0-9]/ig, ''); //strip spaces and special characters
      var titleclean = title.replace(/[^\w\s]/gi, ''); // strip special characters from title
      if(bta.length > 5){ // take the first 5 letters from abbreviated title string
        bta = bta.substr(0,5);
      }/**/
      renderStatus("BibTex Me copied to clipboard!");
      copyTextToClipboard('@misc{' + bta + getRandomInt(1000000,9999999) + ':online,\n author = {},\n title = {' + titleclean + '},\n howpublished = {\\url{' + url + '}},\n month = {' + month + '},\n year = {' + year + '},\n note = {(Zugriff am ' + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ')}\n },');
    }, function(url, title){
	console.log("Hello");
      var currentdate = new Date();
      var bta = title.replace(/[^A-Z0-9]/ig, ''); //strip spaces and special characters
      var titleclean = title.replace(/[^\w\s]/gi, ''); // strip special characters from title
      if(bta.length > 5){ // take the first 5 letters from abbreviated title string
        bta = bta.substr(0,5);
      }/**/
      renderStatus("BibTex Me copied to clipboard!");
      copyTextToClipboard('@misc{' + bta + getRandomInt(1000000,9999999) + ':online,\n author = {},\n title = {' + titleclean + '},\n howpublished = {\\url{' + url + '}},\n month = {},\n year = {},\n note = {(Zugriff am ' + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ')}\n },');
    });
  });
});
