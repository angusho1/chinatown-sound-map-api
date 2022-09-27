import { SubmissionStatus } from "../../models/Submission";

export type CreateSubmissionInput = {
    soundRecordingId: string;
    email: string;
    status: SubmissionStatus;
}

export type CreateSubmissionResult = {
    id: string;
    email: string;
    status: SubmissionStatus
}