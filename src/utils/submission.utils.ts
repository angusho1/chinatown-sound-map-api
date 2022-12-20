import { SubmissionStatus, SubmissionStatusMap } from "../models/Submission"

export const getSubmissionStatusFromString = (status: string): SubmissionStatus => {
    console.log(status)
    switch (status) {
        case SubmissionStatusMap[SubmissionStatus.Pending]:
            return SubmissionStatus.Pending;
        case SubmissionStatusMap[SubmissionStatus.Approved]:
            return SubmissionStatus.Approved;
        case SubmissionStatusMap[SubmissionStatus.Rejected]:
            return SubmissionStatus.Rejected;
        default:
            throw new Error('Invalid submission status');
    }
}