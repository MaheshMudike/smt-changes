export default function normalizeNameAndId(optionalObj: { Id: string, Name: string }) {
    return optionalObj == null ? {
        id: null,
        name: null,
    } : {
        id: optionalObj.Id || null,
        name: optionalObj.Name || null,
    }
}
