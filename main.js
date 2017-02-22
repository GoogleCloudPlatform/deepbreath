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

var API_KEY = 'your-api-key'

function refresh(f) {
  if( (/in/.test(document.readyState)) || (typeof Gmail === undefined) ) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

// Don't warn twice for the same draft
var warned = {};

var main = function(){
  gmail = new Gmail();

  gmail.observe.on('save_draft', function(id, url, body, xhr) {
    var draftId = url['permmsgid'];

    var nlpreq = new XMLHttpRequest();
    nlpreq.open("POST", "https://language.googleapis.com/v1beta1/documents:analyzeSentiment?key=" + API_KEY, true);

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
          if (!warned[draftId]) {
            warned[draftId] = true;
            alert("Careful! This email is getting pretty negative.");
          }
        }
      }
    }
  });
};


refresh(main);
