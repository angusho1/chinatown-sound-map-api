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

export const generateShortName = (title: string) => {
    let splitStr = title.split(/(?:,|\.|-|_|\/|\\| )+/);
    splitStr.forEach(str => str.replace(/[^0-9a-z]/gi, ''));
    splitStr = splitStr.map(str => str.toLowerCase());
    splitStr = splitStr.filter(str => /\S/.test(str));
    return splitStr.join('-');
};
