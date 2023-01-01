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

export type SubmissionSortField = 'dateCreated' | 'title' | 'author';

export type SortOption = {
    field: SubmissionSortField;
    directionDesc?: boolean;
}

export type GetSubmissionsOptions = {
    sort?: SortOption[];
}
