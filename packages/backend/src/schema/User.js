import mongoose, { Schema } from 'mongoose';

const { Types } = Schema;

const userSchema = new Schema({
  username: { type: String, required: true, index: true, unique: true },
});
