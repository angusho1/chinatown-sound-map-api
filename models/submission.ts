import mongoose from 'mongoose';
import SoundClip from './soundClip';
import User from './user';
const { Schema } = mongoose;

export default interface Submission {
    dateSubmitted: Date,
    dateApproved: Date,
    dateRejected: Date,
    soundClip: SoundClip,
    status: SubmissionStatus,
    user: User
}

export enum SubmissionStatus {
    Pending,
    Approved,
    Rejected
}

const submissionSchema = new Schema({
    dateSubmitted: Date,
    dateApproved: Date,
    dateRejected: Date,
    soundClip: Object,
    status: String,
    user: Object
});

export const submissionModel = mongoose.model('submission', submissionSchema);