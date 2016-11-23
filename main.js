var gmail;


function refresh(f) {
  if( (/in/.test(document.readyState)) || (typeof Gmail === undefined) ) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}


var main = function(){
  // NOTE: Always use the latest version of gmail.js from
  // https://github.com/KartikTalwar/gmail.js
  gmail = new Gmail();
  console.log('Hello,', gmail.get.user_email())

  gmail.observe.on('save_draft', function(id, url, body, xhr) {
    console.log("saved a draft2");
    console.log(body.body);


    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://deepbreath-149920.appspot.com/feels", true);

    var params = "content=" + encodeURIComponent(body.body);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log("SENDING A MESSAGE2");
    xhr.onreadystatechange = function() {//Call a function when the state
      // changes.
      if(xhr.readyState == 4 && xhr.status == 200) {


        splitText = xhr.responseText.split(" ");
        console.log("ugg ", splitText);
        sentiment = parseFloat(splitText[0]);
        magnitude = parseFloat(splitText[1]);

        console.log("GOT IT sentiment", sentiment);
        console.log("GOT IT magnitude", magnitude);

        if (sentiment < -0.4 && magnitude > 0.5) {
          alert("Careful! This email is getting pretty negative.");
        }
      }
    };
    console.log("SENDING A MESSAGE");
    xhr.send(params);
  });

};


refresh(main);
