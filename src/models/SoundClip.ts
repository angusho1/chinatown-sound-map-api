import Location from './Location';

export default interface SoundClip {
    title: string,
    author: string,
    description: string,
    location: Location,
    date: Date,
    content: string,
    categories: string[],
    meta: Meta
}

export interface Meta {
    plays: Number,
    likes: Number
}