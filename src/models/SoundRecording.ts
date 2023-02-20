import Location from './Location';
import SoundRecordingTag from './SoundRecordingTag';

export default interface SoundRecording {
    id: string;
    title: string;
    shortName: string;
    author?: string;
    description?: string;
    location: Location;
    dateRecorded?: Date;
    fileLocation: string;
    imageFiles?: string[];
    tags?: SoundRecordingTag[];
}