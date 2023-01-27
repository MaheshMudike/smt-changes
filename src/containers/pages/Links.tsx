import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import translate from '../../utils/translate';
import { IGlobalState } from '../../models/globalState';
import {Link} from "../../models/configuration";
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

function TilesContainer(props: React.WithChildren) {
    return <div className='padding--std full-height scrollable'>{props.children}</div>
}

class Links extends React.Component<object & { links: Link[] ,closeMenu: typeof closeMenu }> {
    public componentDidMount(){
        if(isAndroid()) FirebasePlugin.setScreenName('Links Screen');
        this.props.closeMenu();
    }

    public render() {
        const { links } = this.props;
        const defaultLink = {
            "url": "https://teams.microsoft.com/l/channel/19%3a7351430657c844e59baaefdd9323439a%40thread.skype/General?groupId=ed2cf420-b3db-4d59-9c6d-ad045de23f97&tenantId=2bb82c64-2eb1-43f7-8862-fdc1d2333b50",
            "title": "SRM Teams",
            "description": "Communication and documentation"
        };
        const linksWithDefault = [defaultLink, ...(links == null ? [] : links)];
        const containerClass = cx('overview-details', 'padding--small', 'col-lg-4', 'col-sm-6', 'col-xs-12');

        return (
            <TilesContainer>
                <div className='overview-container'>
                    <div className='overview-container__title padding--std'>
                        {translate("links-page.title")}
                    </div>

                    <div className='padding-bottom--decreased padding-vertical--small'>
                        <div className='overview-container__body'>
                            <div className='clearfix'>
                                {linksWithDefault !== undefined && 
                                    linksWithDefault.map((link, index) => (
                                        <a href={link.url} target="_blank">
                                        <div className={containerClass} key={index}>
                                            <p className='list-item__title'>{link.title}</p>
                                            <p className='list-item__details'>{link.description}</p>
                                        </div>
                                        </a>
                                    ))
                                }
                                {
                                    linksWithDefault === undefined && (
                                        <div className='padding--small' >{translate("links-page.nolinks")}</div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </TilesContainer>
        )

    }
}

export default connect(
    (state: IGlobalState) => ({ 
        links: state.configuration.links
    }),
    {
        closeMenu, 
    },
)(Links);

