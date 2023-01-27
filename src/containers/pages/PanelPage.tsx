import * as React from 'react';

export default function PanelPage(props: React.WithChildren) {
    return <div className="full-height" style={{backgroundColor: "white"}}>{/*<div className="card card--std full-height">*/}
            <div className='card__content padding-vertical--large padding-bottom--std full-height container--vertical'>
                {props.children}
            </div>
        </div>;
}