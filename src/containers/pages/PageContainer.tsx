import * as React from 'react';

export default function PageContainer(props: React.WithChildren) {
    return <div className="page-container">{props.children}</div>;
}