import * as cx from 'classnames';
import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import * as _ from 'lodash';

const pathToImages = require.context('../../images', true);
const pathToImages2 = require.context('./', false, /\.(png|jpe?g|svg)$/);

//TODO this is just so webpack bundles the svgs
function importAll(r: __WebpackModuleApi.RequireContext) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}
export const images = importAll(pathToImages);

export function Icon(props: IIconProps) {
    var imageName = `icon-${ _.kebabCase(SvgIcon[props.svg]) }.svg`;
    var iconPath = images[imageName];
    return (
        <img src={iconPath} className={cx('icon', props.className)} onClick={props.onClick} />
    );
}

export function SmallIcon(props: IIconProps) {
    const augmentedProps = { ...props, className: `${ props.className || '' } icon--small` };
    return (<Icon {...augmentedProps} />);
}

interface IIconProps {
    className?: string;
    svg: SvgIcon;
    alt?: string;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<any>) => void;
}
