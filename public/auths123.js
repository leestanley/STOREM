var database = firebase.database();

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("O");
    $("#login").hide();
    console.log("ZZZZZZZZZLOGGED IN AS " + user.displayName.toUpperCase());
    database.ref("/users/" + user.uid).once("value").then((shot) => {
      var newUser = (shot.val() == null);
      if (newUser) {
        $("#pname").attr("value", user.displayName);
        $("#pemail").attr("value", user.email);
        $("#newProfile").show();
      } else {
        console.log(user.displayName + " already has a profile created");
      }
    });
  } else {
    // No user is signed in.
    $("#login").show();
  }
});

$("#login").click(() => {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
    //var token = result.credential.accessToken;
    //var user = result.user;
    //console.log("JUST LOGGED IN AS " + user.displayName.toUpperCase());
    //console.log(firebase.auth().currentUser);
    //console.log(user);
    //user.uid
  });
});

function validateForm() {
  var isValid = true;
  $("#newProfile").each(function() {
    if ($(this).val() === '') {
      isValid = false;
      return false;
    }
  });

  return isValid;
}

$("#picSel").change(() => {
  var sel = window.document.getElementById("picSel");
  if (sel.files && sel.files[0]) {
    // one selected only
    var img = new Image();
    img.onload = () => {
      if (this.naturalWidth == 128 && this.naturalHeight == 128) {
        window.URL.revokeObjectURL(img.src);
        var reader = new FileReader();
        reader.onload = function(e) {
          $("#previewPic").attr("src", e.target.result);
        }

        reader.readAsDataURL(sel.files[0]);
      } else {
        $("#picSel").val("");
        $("#previewPic").attr("src", "");
        alert("Dimensions of profile picture must be 128x128.");
      }
    };
    img.src = window.URL.createObjectURL(sel.files[0]);
  }
});

$("#submit").click(function() {
  var sel = window.document.getElementById("picSel");
  if (validateForm() && (sel.files && sel.files[0])) {
    
  } else {
    alert("Please fill out every item in the form!");
  }
});