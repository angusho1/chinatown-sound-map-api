import SoundRecording from './SoundRecording';

export default interface Submission {
    id: string,
    soundRecording: SoundRecording,
    email: string,
    dateCreated: Date,
    status: SubmissionStatus,
}

export enum SubmissionStatus {
    Pending,
    Approved,
    Rejected
}

export const SubmissionStatusMap = {
    [SubmissionStatus.Pending]: 'Pending',
    [SubmissionStatus.Approved]: 'Approved',
    [SubmissionStatus.Rejected]: 'Rejected'
}