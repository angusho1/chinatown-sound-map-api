import SoundClip from './SoundClip';
import User from './User';

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