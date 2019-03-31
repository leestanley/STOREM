export class User {
  constructor(name, email, address, long, lat, phone, uid, profile, role, size) {
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

    this.firebase = null;
    this.configured = false;
  }

  setupFirebase(firebase) {
    this.firebase = firebase;
    this.configured = true;
    this.loadDownloadLink();
  }

  loadDownloadLink() {
    if (this.configured && this.firebase) {
      this.profileLink = null;
      var storage = this.firebase.storage().ref();
      var obj = this; // keep a reference to when we go into the callback
      storage.child(this.profilePath).getDownloadURL().then(function(url) {
        obj.profileLink = url;
      });
    }
  }
}

export function loadUsers(firebase) {
  var list = [];
  var query = firebase.database().ref("users");
  query.once("value").then((snapshot) => {
    var info = snapshot.val();
    var user = new User(info.name, info.email, info.address,
                        info.long, info.lat, info.phone,
                        info.uid, info.profile,
                        info.role, info.size);
    user.setupFirebase(firebase);
    list.push(user);
  });

  return list;
}