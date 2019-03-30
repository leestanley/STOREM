var database = firebase.database();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("O");
    $("#login").remove();
    console.log("ZZZZZZZZZLOGGED IN AS " + user.displayName.toUpperCase());
  } else {
    // No user is signed in.
    console.log(":(");
    $("#login").show();
  }
});

$("#login").click(() => {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
    var token = result.credential.accessToken;
    var user = result.user;
    console.log("JUST LOGGED IN AS " + user.displayName.toUpperCase());
    console.log(firebase.auth().currentUser);
    //console.log(user);
    //user.uid
  });
});