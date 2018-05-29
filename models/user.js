"use strict";
"use strict";

const mongoose = require("mongoose");
const Shema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");
const UserShema = Shema({
  email: { type: String, unique: true, lowercase: true },
  username: { type: String, unique: true },
  nombre: String,
  password: String,
  singupDate: { type: Date, default: Date.now() },
  data: [
    {
      ecg: Number,
      pulso: Number,
      respirasion: Number,
      presion: Number,
      fecha: { type: Date, default: Date.now() }
    }
  ]
});

UserShema.methods.hash = function(password) {
  if (this.password != null) {
    return bcrypt.compareSync(password, this.password);
  } else {
    return false;
  }
};
UserShema.pre("save", function(next) {
  let user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(32, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("User", UserShema);
