var database = firebase.database();

$("#login").click(() => {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
    var token = result.credential.accessToken;
    var user = result.user;
    console.log("LOGGED IN AS " + user.displayName.toUpperCase());
    //console.log(user);
    //user.uid
  });
});