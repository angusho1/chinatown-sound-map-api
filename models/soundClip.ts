import Location from './location';

export default interface SoundClip {
    title: string,
    author: string,
    description: string,
    location: Location,
    date: Date,
    categories: string[],
    meta: Meta
}

export interface Meta {
    plays: Number,
    likes: Number
}