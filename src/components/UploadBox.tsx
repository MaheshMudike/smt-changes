import * as React from 'react';

import { SvgIcon } from '../constants/SvgIcon';
import translate from '../utils/translate';
import { FileLoader, IFile } from './FileLoader';
import { Icon } from './layout/Icon';

export class UploadBox extends React.Component<IUploadBoxProps, IFile> {

    public render() {
        return (
            <div className='upload-box relative'>
                <FileLoader accept={this.props.accept} onLoad={this.onLoad} className='upload-box__input' />
                <div className='container--centered cover-all'>
                    <div className='container--vertical'>
                        <div className='container--centered padding-bottom--small'>
                            <Icon className='icon--large' svg={SvgIcon.Upload} />
                        </div>
                        <div>{this.getLabel()}</div>
                    </div>
                </div>
            </div>
        );
    }

    private getLabel() {
        return this.state == null ? translate('generic.choose-a-file') : this.state.fileName;        
    };

    private onLoad = (f: IFile) => {
        this.props.onLoad(f);
        this.setState(f);
    }
}

interface IUploadBoxProps {
    onLoad: (f: IFile) => void;
    accept: string;
}
