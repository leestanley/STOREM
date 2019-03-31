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
        console.log(user.displayName + " already has a profile created.");
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

$("#picSel").change(() => {
  var sel = window.document.getElementById("picSel");
  if (sel.files && sel.files[0]) {
    var img = new Image();
    img.onload = () => {
      if (img.naturalWidth == 128 && img.naturalHeight == 128) {
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

$("#newProfile").validate({
  submitHandler: function(form) {
    var sel = window.document.getElementById("picSel");
    if ((sel.files && sel.files[0])) {
      var user = firebase.auth().currentUser;
      var file = sel.files[0];
      var ext = file.name.replace(/^.*\./, "");
      var path = "users/" + user.uid + "/images/profile." + ext.toLowerCase();

      var stor = storage.ref();
      stor.child(path).getDownloadURL().then(() => {
        // already exists for some odd reason... so delete then create
        stor.child(path).delete(() => {
          stor.child(path).put(file);
        });
      }, () => {
        // file does not exist so let's get right into the creation
        stor.child(path).put(file);
      });

      $.ajax({
        type: "GET",
        url: "https://maps.googleapis.com/maps/api/geocode/json",
        data: {
          address: $("#paddress").val(),
          key: "AIzaSyCELpzMAiytdH3mON0Sq9NImFblgK1U_Rs"
        },
        dataType: "json",
        success: (data) => {
          var item = data.results[0];
          var address = item.formatted_address;
          var lat = item.geometry.location.lat;
          var lng = item.geometry.location.lng;

          database.ref("/users/" + user.uid).set({
            name: user.displayName,
            email: user.email,
            address: address,
            lat: lat,
            long: lng,
            size: Number($("#pft").val()),
            phone: $("#pnum").val(),
            profile: path,
            uid: user.uid,
            role: $("input[name=role]:checked", "#newProfile").val()
          });
        },
        error: (xhr, statusCode, e) => {
          alert(e);
        }
      });

      $("#newProfile").hide();
      alert("Welcome " + user.displayName + "!");
    } else {
      alert("Please fill out every item in the form!");
    }
  }
});