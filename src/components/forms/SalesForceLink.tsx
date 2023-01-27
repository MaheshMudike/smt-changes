import * as React from 'react';

import { openObjectInSalesforce } from '../../services/externalApps';
import { HashLink as Link } from 'react-router-hash-link';

class ButtonLink extends React.Component<{ onClick: () => void }> {
    public render() {
        return (
            <button className='relative link-wrapper--full-width' onClick={this.props.onClick}>
                {this.props.children}
            </button>
        );
    }
}

class SalesForceLink extends React.Component<{ id: string } & React.WithChildren, object> {

    public render() {
        return (
            <ButtonLink onClick={() => openObjectInSalesforce(this.props.id)}>
                { this.props.children }
            </ButtonLink>
        );
    }
}

export const buttonLinkWrapper = (onClick: () => void) => (props: React.WithChildren) => 
    <ButtonLink onClick={onClick}>{props.children}</ButtonLink>;

export const SalesForceLinkWrapper = (props: React.WithChildren & { target: { id: string } }) => (
    <SalesForceLink id={ props.target == null ? null : props.target.id }>
        {props.children}
    </SalesForceLink>
);

export const salesForceLinkWrapper = (target: { id: string }) => (props: React.WithChildren) => (
    <SalesForceLinkWrapper target={ target }>
        {props.children}
    </SalesForceLinkWrapper>
);

export const hashLink = (id: string, content: string) => {
    return <Link to={{ hash: `#${id}` }} >{ content }</Link>
}