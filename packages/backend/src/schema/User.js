import { Schema } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true, index: true, unique: true },
  unfinishedAccount: { type: Boolean, default: true },
  reddit: {
    uid: { type: String, index: true },
    username: { type: String },
    accessToken: String,
    accessTokenExpiration: Date,
  },
  slack: {
    uid: { type: String, index: true },
    username: { type: String },
    accessToken: String,
    accessTokenExpiration: Date,
  },
  github: {
    uid: { type: String, index: true },
    username: { type: String },
    accessToken: String,
    accessTokenExpiration: Date,
  },
  gitlab: {
    uid: { type: String, index: true },
    username: { type: String },
    accessToken: String,
    accessTokenExpiration: Date,
  },
});

module.exports = userSchema;
