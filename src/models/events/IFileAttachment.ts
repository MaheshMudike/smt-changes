import INameAndId from '../INameAndId';

export interface IFileAttachment {
    contact: INameAndId;
    fileName: string;
    base64Content: string;
}
