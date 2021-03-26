import mongoose from 'mongoose';
import Location from './location';
const { Schema } = mongoose;

export default interface SoundClip {
    title: string,
    author: string,
    description: string,
    location: Location,
    submissionDate: Date,
    categories: string[],
    meta: any
}

const soundClipSchema = new Schema({
    title: String,
    author: String,
    description: String,
    location: {
        lat: Number,
        lng: Number
    },
    submissionDate: Date,
    categories: [String],
    meta: {
      views: Number,
      likes: Number
    }
});

export const SoundClipModel = mongoose.model('SoundClip', soundClipSchema);