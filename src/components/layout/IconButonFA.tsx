import * as React from 'react';
import { FontAwesomeIcon, Props } from "@fortawesome/react-fontawesome";

const IconButtonFA = (props: { onClick: (me: React.MouseEvent<any>) => void, className?: string } & Props) => {
    return (
        <button type='button' className={props.className} >
            <FontAwesomeIcon {...props} />
        </button>
    );
};

export default IconButtonFA;