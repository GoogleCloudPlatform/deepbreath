// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var gmail;

function refresh(f) {
  if( (/in/.test(document.readyState)) || (typeof Gmail === undefined) ) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

// extension  option
var googleApiKey = ''
var wordsToAvoid = []

// Keep track of warned drafts so we don't warn twice for the same draft.
var warned = {};

// Regex/separators
var sentenceRegex = new RegExp("([.]) +([A-Z])", "g");
var sentenceSeparator = "__SENTENCE SEPARATOR__";

// Load our words to avoid into an array
chrome.storage.sync.get({
  wordsToAvoid: '',
  googleApiKey: ''
}, function(items) {
  googleApiKey = items.googleApiKey
  wordsToAvoid = items.wordsToAvoid.split(',').map(function(word) {
    return word.trim();
  }).filter(function (word) {
    return word != "";
  })
})

var main = function(){
  gmail = new Gmail();

  gmail.observe.on('save_draft', function(id, url, body, xhr) {
    var draftId = url['permmsgid'];
    // Don't warn twice for the same draft
    if (warned[draftId]) {
      return;
    }
    // Check for specific words
    if (wordsToAvoid.length > 0) {
      var textToSearch = body.body
      var modifiedText = textToSearch.replace(sentenceRegex, "$1" + sentenceSeparator + "$2")

      modifiedText.split(sentenceSeparator).forEach(function(sentence) {
        words.forEach(keyword => {
          var keywordRegex = new RegExp("(^| +)" + keyword + "( +|[.])", "i");
          if (keywordRegex.test(sentence)) {
            warned[draftId] = true;
            alert("Your email contains a word you want to avoid: "  + keyword);
            return;
          }
        })
      });
    }

    // Check for general sentiment
    if (items.googleApiKey) {
      var nlpreq = new XMLHttpRequest();
      nlpreq.open("POST", "https://language.googleapis.com/v1beta1/documents:analyzeSentiment?key=" + items.googleApiKey, true);

      nlpreq.setRequestHeader("Content-type", "application/json");

      var request = {
        document: {
          type: "PLAIN_TEXT",
          content: body.body
        },
        encodingType: "UTF8"
      };
      nlpreq.send(JSON.stringify(request));

      nlpreq.onreadystatechange = function() {
        if(nlpreq.readyState == 4 && nlpreq.status == 200) {

          response = JSON.parse(nlpreq.responseText);

          sentiment = parseFloat(response['documentSentiment']['score']);
          magnitude = parseFloat(response['documentSentiment']['magnitude']);

          if (sentiment < -0.4 && magnitude > 0.5) {
            warned[draftId] = true;
            alert("Careful! This email is getting pretty negative.");
          }
        }
      }
    }
  });
};

refresh(main);
