import Location from './Location';

// Legacy
export default interface SoundClip {
    title: string,
    author: string,
    description: string,
    location: Location,
    date: Date,
    content: string,
    tags: string[],
    meta: Meta
}

export interface Meta {
    plays: Number,
    likes: Number
}