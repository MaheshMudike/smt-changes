import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import { MenuButton } from './MenuButton';

export class DropdownMenuLink extends React.Component<IDropdownMenuProps, IDropdownMenuState> {

    constructor(props: IDropdownMenuProps) {
        super(props);
        this.state = {
            isOpen: false,
        };
    }

    public render() {
        return (
            <div>
                <MenuButton
                    icon={this.props.icon}
                    label={this.props.label}
                    onClick={() => this.toggle()}
                />
                {this.state.isOpen &&
                    <div>
                        {this.props.children}
                    </div>
                }
            </div>);
    }

    private toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }
}

interface IDropdownMenuState {
    isOpen: boolean;
}

export interface IDropdownMenuProps {
    label: string;
    icon: SvgIcon;
}
