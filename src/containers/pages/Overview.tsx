import * as React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import OverviewDetailsBlock from '../../components/overview/OverviewDetailsBlock';
import { customerTiles, operationsTiles, myOpenActivitiesTiles, myCustomersOpenActivitiesTiles, myTechnicianOpenActivitiesTiles, salesTiles } from '../../models/overview/tiles';
import { Tile, TileVisibility } from '../../models/overview/tile';
//import { getGroupedOverviewItems } from '../../selectors';
import translate from '../../utils/translate';

import { IGlobalState, activeInFSMFromState, plannerGroupIdFromState, localeFromState } from '../../models/globalState';
import { Layout } from '../../models/configuration';
import openLinkExternally from '../../utils/openLinkExternally';
import { connection } from '../../actions/http/jsforceCore';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

function TilesContainer(props: React.WithChildren) {
    return <div className='padding--std full-height scrollable'>{props.children}</div>
}

class Overview extends React.Component<ReturnType<typeof OverviewStateProps> & { replace: typeof replace, closeMenu: typeof closeMenu }, object> {

    private replaceString(string: String) {
        return string.replace('${ connection.instanceUrl }', connection.instanceUrl).replace('${ ServiceTerritoryId }', this.props.serviceTerritoryId)
    }

    public componentDidMount(){
        if(isAndroid()) FirebasePlugin.setScreenName('OverView Screen');
        this.props.closeMenu();
    }

    public render() {
        return this.props.config.content.layout !== Layout.ACTIVITIES ?
            <TilesContainer>
                {this.renderTiles('overview-page.customer-overview', customerTiles)}
                {this.renderTiles('overview-page.operations-overview', operationsTiles)}
                {this.renderTiles('overview-page.or-repairs-funnel', salesTiles)}
            </TilesContainer>
            :
            <TilesContainer>
                {this.renderTiles('overview-page.my-open-activities', myOpenActivitiesTiles)}
                {this.renderTiles('overview-page.my-customers-open-activities', myCustomersOpenActivitiesTiles)}
                {this.renderTiles('overview-page.my-technicians-open-activities', myTechnicianOpenActivitiesTiles)}
            </TilesContainer>
        ;
    }

    private renderTiles(title: string, tiles: Tile[]) {
        if (this.props.metrics == null) return null;        
        const activeInFSM = this.props.activeInFSM;
        const visibleTiles = tiles.filter(
            tile => {
                const fsmVisible = activeInFSM && tile.visibility != TileVisibility.NON_FSM || !activeInFSM && tile.visibility != TileVisibility.FSM

                const hiddenByConfig = tile.visibilityKey != null && this.props.config.content != null && this.props.config.content[tile.visibilityKey + 'Active'] === false;

                return fsmVisible && !hiddenByConfig;
            }
        );
        return <div className='overview-container'>
            <div className='overview-container__title padding--std'>
                {translate(title)}
            </div>
            <div className='padding-bottom--decreased padding-vertical--small'>
                <div className='overview-container__body'>
                    <div className='clearfix'>
                    {
                        visibleTiles.map(tile => 
                            <OverviewDetailsBlock key={tile.getName()} icon={tile.icon}
                                name={translate(tile.getName())} value={tile.getValue(this.props.metrics)}
                                clickHandler={tile.isNavigatable ? (tile.isAbsolutePath ? () => openLinkExternally(this.replaceString(tile.getPath())) : () => this.props.replace(tile.getPath())) : null}
                                isImplemented={tile.isImplemented}
                                locale={this.props.locale}
                                currencyIsoCode={this.props.currencyIsoCode}
                            />
                        )
                    }
                    </div>
                </div>
            </div>
        </div>;        
    }
}

//TODO put a selector here
const OverviewStateProps = (state: IGlobalState) => ({ 
    metrics: state.metrics.data,
    config: state.configuration,
    activeInFSM: activeInFSMFromState(state),
    serviceTerritoryId: plannerGroupIdFromState(state),
    locale: localeFromState(state),
    currencyIsoCode: state.authentication && state.authentication.currentUser && state.authentication.currentUser.defaultCurrencyIsoCode,
})

export default connect(OverviewStateProps, { replace , closeMenu })(Overview);

