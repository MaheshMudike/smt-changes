import * as cx from 'classnames';
import * as _ from 'lodash';
import * as React from 'react';

export class FileLoader extends React.Component<IFileLoaderProps, {}> {
    public refs: {
        fileInput: HTMLInputElement;
        [key: string]: HTMLInputElement;
    };

    public render() {
        return (
            <input ref='fileInput' type='file' onChange={this.loadFile} accept={this.props.accept}
                className={cx('cover-all transparent full-size', this.props.className)} 
            />
        );
    }

    private loadFile = (evt: React.FormEvent<any>) => {
        if (this.refs.fileInput.files.length !== 1) {
            return;
        }
        const file = this.refs.fileInput.files[0];

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.props.onLoad({
                base64Content: _.split(e.target.result, 'base64,')[1],
                fileName: file.name,
            });
        };
        reader.readAsDataURL(file);
        this.refs.fileInput.value = null;
    };
}

export interface IFile {
    fileName: string;
    base64Content: string;
}

interface IFileLoaderProps {
    accept: string;
    onLoad: (f: IFile) => void;
    className?: string;
}
