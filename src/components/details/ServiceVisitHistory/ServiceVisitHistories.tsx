import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { IGlobalState, localeFromState } from '../../../models/globalState';
import { formatDateTime, joinOptionals } from '../../../utils/formatUtils';
import translate from '../../../utils/translate';
import { ListItemBody, listItemCssClasses } from '../../list/ListItem';
import { groupBy } from 'lodash';
import StatusContainer from '../../StatusContainer';
import * as cx from 'classnames';
import Subheader from '../../layout/Subheader';
import { ListBody } from 'src/components/list/ListBody';

type IServiceVisitHistoryProps = //typeof ServiceVisitHistoriesDispatch & 
    ReturnType<typeof ServiceVisitHistoriesState> & 
    { id: string, downloadServiceVisitHistory: (limit: number) => void }

const minLimit = 50;
const LIMIT_STEP = 50;

class ServiceVisitHistoryClass extends React.Component<IServiceVisitHistoryProps, { limit: number }> {
   
    constructor(props: IServiceVisitHistoryProps) {
        super(props);
        this.state = { limit: minLimit };
    }

    public render() {
        const { id, locale } = this.props;
        const visitHistories = this.props.visitHistories.items;
        const uniqAppointments = _.uniqBy(visitHistories.map(vh => vh.serviceAppointment), 'id');
        const serviceVisitHistoriesByAppointment = groupBy(visitHistories, 'serviceAppointment.id');
        return <StatusContainer {...this.props.visitHistories}>
            {uniqAppointments.map(a => (
                <div>
                    <Subheader>
                        {joinOptionals([translate('generic.entity-name.service-appointment'), a.appointmentNumber, a.status])}
                    </Subheader>
                    <ListBody onScrollToBottom={this.loadNextPage} versionMarker={id} 
                        isLoading={this.props.visitHistories.isProcessing} listItems={serviceVisitHistoriesByAppointment[a.id]}
                        showBottomSpinner={true} renderItem={(sh, style) => 
                            <div className={cx(listItemCssClasses)}>
                                <ListItemBody 
                                    title={joinOptionals([sh.name, sh.owner, formatDateTime(sh.createdDate, locale)])} 
                                    body={joinOptionals([sh.noteTitle, sh.noteBody])} />
                            </div>
                        }
                    />
                    
                    {/*serviceVisitHistoriesByAppointment[a.id].map(sh =>
                        <div className={cx(listItemCssClasses)}>
                            <ListItemBody 
                                title={joinOptionals([sh.name, sh.owner, formatDateTime(sh.createdDate)])} 
                                body={joinOptionals([sh.noteTitle, sh.noteBody])} />
                        </div>
                    )*/}
                </div>
            ))}
            { /*this.state.limit < maxLimit && <IconButton icon={SvgIcon.AddCricle} 
                    label={translate('visit-history.load-more-data')} onClick={() => this.loadMore()} />*/ }
        </StatusContainer>
    }

    private loadNextPage = () => {
        this.setState({ limit: this.state.limit + LIMIT_STEP });
        this.queryServiceVisitHistory();
    }

    public componentWillReceiveProps(nextProps: IServiceVisitHistoryProps) {
        if (this.props.id !== nextProps.id) {
            this.setState({ limit: minLimit });
            this.props.downloadServiceVisitHistory(this.state.limit);
        }
    }

    public componentDidMount() {
        this.setState({ limit: minLimit });
        this.queryServiceVisitHistory();
    }

    private queryServiceVisitHistory() {
        this.props.downloadServiceVisitHistory(this.state.limit)
    }

}

const ServiceVisitHistoriesState = (state: IGlobalState) => ({ visitHistories: state.serviceVisitHistory, locale: localeFromState(state) })
export const ServiceVisitHistories = connect(ServiceVisitHistoriesState)(ServiceVisitHistoryClass);
