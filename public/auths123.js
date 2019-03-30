var database = firebase.database();
var storage = firebase.storage();

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    $("#login").hide();
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
  $("#newProfile").each(() => {
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

$("#submit").click(() => {
  var sel = window.document.getElementById("picSel");
  if (validateForm() && (sel.files && sel.files[0])) {
    var user = firebase.auth().currentUser;
    var file = sel.files[0];
    var ext = file.name.replace(/^.*\./, "");
    file.name = "pic." + ext.toLowerCase();
    var path = "users/" + user.uid + "/profilePic/";

    var storage = storage.ref(path);
    storage.child(path + file.name).getDownloadURL().then(() => {
      // already exists so delete then create
      storage.child(path + file.name).delete(() => {
        storage.child(path + file.name).put(file);
      });
    }, () => {
      // file does not exist so let's get right into the creation
      storage.child(path + file.name).put(file);
    });

    database.ref("/users/" + user.uid).set({
      name: user.displayName,
      email: user.email,
      address: $("#paddress").val(),
      size: $("#pft").val(),
      phone: $("#pnum").val(),
      profile: path,
      uid: user.uid
    });
    alert("Welcome " + user.displayName + "!");
  } else {
    alert("Please fill out every item in the form!");
  }
});