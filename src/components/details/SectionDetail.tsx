import * as React from 'react';

import Subheader from '../layout/Subheader';

const SectionDetail = (props: ISectionDetailProps) => (
    <section>
        <Subheader noTopSeparator={props.first}>
            {props.label}
        </Subheader>
        <div className='padding-top--small padding-bottom--small'>
            {props.children || null}
        </div>
    </section>
);

interface ISectionDetailProps extends React.WithChildren {
    first?: boolean;
    label: string;
}

export default SectionDetail;
