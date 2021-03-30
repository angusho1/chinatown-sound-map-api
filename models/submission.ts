import SoundClip from './soundClip';
import User from './user';

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