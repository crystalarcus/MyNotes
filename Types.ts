type Note = {
    title?: string,
    content?: string,
    starred: boolean,
    date: string,
    fullDate: string,
    timeCreated: string,
    modified: string,
    modifiedKey: number,
    key: number,
    groups: string[],
    voiceNotes?:VoiceNoteType[]
}

type VoiceNoteType = {
    title: string,
    uri: string,
    date: string,
    key: number,
    type: "voice",
    durationMili: number,
    durationString: string,
}