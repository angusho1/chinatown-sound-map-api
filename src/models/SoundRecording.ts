import Location from './Location';

export default interface SoundRecording {
    id: string,
    title: string,
    author?: string,
    description?: string,
    location: Location,
    dateRecorded?: Date,
    fileLocation: string,
    imageFiles?: string[]
}