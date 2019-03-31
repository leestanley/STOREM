class User {
	constructor(name, email, address, long, lat, phone, uid, profile, role, size, available) {
		this.name = name;
		this.email = email;
		this.address = address;
		this.long = long;
		this.lat = lat;
		this.phone = phone;
		this.uid = uid;
		this.profilePath = profile;
		this.role = role;
		this.size = size;
		this.available = available;
	}
}
var database = firebase.database();
var storage = firebase.storage();
var isNewUser = false;

function openProfileSettings() {
	if (firebase.auth().currentUser) {
		var user = firebase.auth().currentUser;
		$("#pname").val(user.displayName);
		$("#pemail").val(user.email);
		database.ref("/users/" + user.uid).once("value").then((shot) => {
			var data = shot.val();
			if (data) {
				$("#paddress").val(data.address);
				$("#pft").val(data.size);
				$("#pnum").val(data.phone);
				$("#picSel").val("");
				firebase.storage().ref().child(data.profile).getDownloadURL().then((u) => {
					$("#previewPic").attr("src", u);
				});
				$("#avail").prop("checked", data.available != false);
				if (!isNewUser) {
					$("#picSel").hide();
				} else {
					$("#picSel").show();
				}
			}
		});
		$("#toggle").hide();
		$("#rightBar").hide();
		$("#btnOptions").hide();
		$(".left-bar").addClass("plsslide");
		$("#profileD").show();
	} else {
		alert("You must be logged in to access your profile settings.");
	}
}

function hideProfileSettings() {
	$("#pname").val("");
	$("#pemail").val("");
	$("#paddress").val("");
	$("#pft").val("");
	$("#pnum").val("");
	$("#picSel").val("");
	$("#previewPic").attr("src", "");
	$("#profileD").hide();
	$(".left-bar").removeClass("plsslide");
	$("#toggle").show();
	$("#btnOptions").show();
  
  setTimeout(() => {
    $("#rightBar").show();
  }, 1000);
}

function openListing() {
	$("#toggle").hide();
	$("#rightBar").hide();
  $("#btnOptions").hide();
  
	$("#listPop").empty();
	var query = database.ref("users");
	query.once("value").then((snapshot) => {
		snapshot.forEach((shot) => {
			var info = shot.val();
			var user = new User(info.name, info.email, info.address, info.long, info.lat, info.phone, info.uid, info.profile, info.role, info.size, info.available);
			if (user.role == 0) {
        firebase.storage().ref().child(user.profilePath).getDownloadURL().then((u) => {
          var item = '<tr><td><img src="' + u + '" width="64" height="64" align="left" class="ml-2"> ' + user.name + '</td><td>' + user.address + '</td><td>' + user.email + ' (' + user.phone + ')</td><td>' + (user.available == false ? "NO (" : "YES (") + user.size + ')</td><td><input type="button" id="rent_' + user.uid + '" value="Rent"' + (user.available == false ? "disabled" : "") + '></td></tr>';
          $("#houseListings").append(item);
          $("#rent_" + user.uid).click(() => {
            if (firebase.auth().currentUser) {
              if (user.available != false) {
                console.log("handle the rent..");
                alert("Rented " + user.name + "'s house! [DEMO]");
              } else {
                alert("This is not available for rent! Contact the owner for questions.");
              }
            } else {
              alert("Please login to Storem before attempting to rent anything.");
            }
          });
        });
      }
		});
  });
  
	$(".left-bar").addClass("plsslide");
	$("#listingD").show();
}

function hideListing() {
	$("#listingD").hide();
	$(".left-bar").removeClass("plsslide");
	$("#toggle").show();
  $("#btnOptions").show();

  setTimeout(() => {
    $("#rightBar").show();
  }, 1000);
}
firebase.auth().onAuthStateChanged((user) => {
	if (user) {
		$("#classic").hide();
		$("#actual").show();
		database.ref("/users/" + user.uid).once("value").then((shot) => {
			var newUser = (shot.val() == null);
			isNewUser = newUser;
			if (newUser) {
				openProfileSettings();
			} else {
				var userData = shot.val();
				$("#displayName").text(user.displayName);
				firebase.storage().ref().child(userData.profile).getDownloadURL().then((u) => {
					$("#display").attr("src", u);
				});
				$("#role").text(userData.role == 0 ? "Host" : "Renter");
			}
		});
	} else {
		// No user is signed in.
		$("#classic").show();
		$("#actual").hide();
		$("#displayName").text("");
		$("#display").attr("src", "assets/images/pfp.png");
		$("#role").text("");
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
$("#logout").click(() => {
	firebase.auth().signOut().then(() => {
		alert("Signed out.");
	});
})
$("#picSel").change(() => {
	var sel = window.document.getElementById("picSel");
	if (sel.files && sel.files[0]) {
		var img = new Image();
		img.onload = () => {
			if (img.naturalWidth == 128 && img.naturalHeight == 128) {
				window.URL.revokeObjectURL(img.src);
				var reader = new FileReader();
				reader.onload = function (e) {
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
$("#editProfile").click(() => {
	if ($("#pname").val().trim().length > 0 && $("#paddress").val().trim().length > 0 && $("#pft").val() >= 0 && $("#pnum").val().trim().length > 0) {
		var sel = window.document.getElementById("picSel");
		if ((sel.files && sel.files[0]) || (!isNewUser) == true) {
			var user = firebase.auth().currentUser;
			var file = (isNewUser ? sel.files[0] : "");
			var ext = (isNewUser ? file.name.replace(/^.*\./, "") : "");
			var path = "users/" + user.uid + "/images/profile." + ext.toLowerCase();
			if (isNewUser) {
				var stor = storage.ref();
				stor.child(path).getDownloadURL().then(() => {
					// already exists for some odd reason... so delete then create
					//stor.child(path).delete().then(() => {
					stor.child(path).put(file);
					//});
				}, () => {
					// file does not exist so let's get right into the creation
					stor.child(path).put(file);
				});
			}
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
					if (isNewUser) {
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
							role: $("input[name=role]:checked", "#profileD").val(),
							available: $("#avail").is(':checked')
						});
					} else {
						database.ref("/users/" + user.uid).update({
							name: user.displayName,
							email: user.email,
							address: address,
							lat: lat,
							long: lng,
							size: Number($("#pft").val()),
							phone: $("#pnum").val(),
							uid: user.uid,
							role: $("input[name=role]:checked", "#profileD").val(),
							available: $("#avail").is(':checked')
						});
					}
					isNewUser = false;
					$("#displayName").text(user.displayName);
					database.ref("/users/" + user.uid).once("value").then((shot) => {
						var userData = shot.val();
						if (userData) {
							$("#role").text(userData.role == 0 ? "Host" : "Renter");
							firebase.storage().ref().child(userData.profile).getDownloadURL().then((u) => {
								$("#display").attr("src", u);
							});
						}
					});
					alert((isNewUser ? "Welcome " + user.displayName + "!" : "Saved profile settings!"));
					hideProfileSettings();
				},
				error: (xhr, statusCode, e) => {
					alert(e);
				}
			});
		} else {
			alert("Please fill out every item in the form!");
		}
	} else {
		alert("Please fill in all fields!");
	}
});

var toggleMainMap = true;
$("#toggle").click(() => {
	toggleMainMap = !toggleMainMap;
	if (toggleMainMap) {
		$("#map").show();
		$("#map1").hide();
	} else {
		$("#map").hide();
		$("#map1").show();
	}
});

$("#editProfileBtn").click(openProfileSettings);
$("#showListings").click(openListing);

$(".logo2").click(() => {
  if ($("#profileD").is(":visible")) {
    hideProfileSettings();
  } else if ($("#listingD").is(":visible")) {
    hideListing();
  }
});