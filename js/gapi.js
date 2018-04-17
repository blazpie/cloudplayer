// Client ID and API key from the Developer Console
var CLIENT_ID = '502910609103-nrlid5oo0b4472565f685hlmu2oelpb7.apps.googleusercontent.com';
var API_KEY = 'AIzaSyArgPQVtyJpRxLe-cW5pKXOaEzmjp5SK-U';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

var pages = [''];

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    getFiles();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print files.
 */
function getFiles(pageToken) {
    console.log(pageToken);
  gapi.client.drive.files.list({
    'pageSize': 10,
    'pageToken': pageToken || '',
    'fields': "nextPageToken, files(id, name, webContentLink)",
    'q': "mimeType contains 'audio/'"
  }).then(function(response) {
    pages.push(response.result.nextPageToken)
    console.log(pages);
    listFiles(response.result.files, response.result.nextPageToken)
  });
}

function listFiles(files, nextPageToken) {
    var app = document.getElementById("app")
    app.innerHTML = ''
    if (files.size !== 0) {
        var list = document.createElement("ul")
        list.id = 'file_list'
        var audio = document.createElement("audio")
        audio.id = 'audio'
        audio.controls = 'controls'
        app.appendChild(list)
        app.appendChild(audio)
        for (let file of files) {
            let elem = document.createElement("li")
            elem.className = "song"
            let a = document.createElement("a")
            a.onclick = () => {audio.src = file.webContentLink; audio.play()}
            a.appendChild(document.createTextNode(file.name))
            elem.appendChild(a)
            list.appendChild(elem)
        }

        if (pages.length > 2) {
            var prevPage = document.createElement("button")
            prevPage.appendChild(document.createTextNode('previous'))
            prevPage.onclick = () => {pages.splice(pages.length - 2, 2);getFiles(pages[pages.length - 1]);}
            app.appendChild(prevPage)
        }

        if (nextPageToken) {
            var nextPage = document.createElement("button")
            nextPage.appendChild(document.createTextNode('next'))
            nextPage.onclick = () => getFiles(nextPageToken)
            app.appendChild(nextPage)
        }
    }

}
