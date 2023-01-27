import * as React from 'react';
import { ITractionControlReportState } from '../../reducers/tractionControlReducer';
import translate from '../../utils/translate';
import { CoveringSpinner } from '../CoveringSpinner';
import { ActionStatus } from '../../actions/actions';
import * as sanitize from 'sanitize-html';

/*
type ITractionControlReportStateAndMethods =  ITractionControlReportState & {
    reportType: TractionControlReportType    
}
*/

export class TractionControlReportClass2 extends React.Component<ITractionControlReportState & { zoom?: number }, { styleInjected: boolean }> {

    constructor(t: ITractionControlReportState) {
        super(t);
        this.state = { styleInjected: false };
    }

    public render() {
        const reportNotAvailable = this.props.status == ActionStatus.SUCCESS && this.props.htmlContent == null;
        return (
            <div style={ { height: "100%", width: "100%" } } ref="parentWrapper">
                {this.props.status == ActionStatus.START ? <CoveringSpinner /> : null }
                <iframe ref="iframe" className="tractionControlIframe" frameBorder="0" style={ { height: "100%", width: "100%", display: reportNotAvailable ? 'none' : 'block'} } />
                {reportNotAvailable ? 
                    <div className={"cover-all overlay container--centered"}><h1>{translate('toast.tracking-report-not-found.message')}</h1></div> : 
                    null 
                }
            </div>
        );
    }

    public componentWillReceiveProps() {
        this.setState({ styleInjected: false });
    }

    public componentDidMount() {
        this.updateHtml();
    }

    public componentDidUpdate() {
        this.updateHtml();
    }

    updateHtml = () => {
        if(this.props.htmlContent != null && this.props.htmlContent != "" && !this.state.styleInjected) {
            this.setState({ styleInjected: true });

            const iframe = this.refs.iframe as HTMLIFrameElement;

            //see https://github.com/punkave/sanitize-html for default options
            iframe.contentDocument.body.innerHTML = sanitize(this.props.htmlContent, {
                //allow default but iframe, added 'img', 'style', 'h1', 'h2'
                allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 
                    'img', 'style', 'h1', 'h2' ],
                allowedSchemes: [ 'data', 'http', 'https' ]
            });
            
            iframe.contentDocument.body.style.display = "inline-block";
            iframe.contentDocument.body.style.width = "100%";
            iframe.contentDocument.body.style.margin = "0";
            iframe.contentDocument.body.style.paddingLeft = "10px";
            
            var style = document.createElement('style')
            style.innerHTML = "img { max-width: 100%; height: auto; } * { box-sizing: border-box; }";
            iframe.contentDocument.head.appendChild(style);
        }
    }

    
}

//TODO this is code from the old implementation, this and the global state associated can be removed
/*
interface ITractionControlReportDispatch {
    downloadTractionControlReport: typeof downloadTractionControlReport
}

export class TractionControlReportClassVAVC extends TractionControlReportClass2 {

    constructor(t: ITractionControlReportStateAndMethods & ITractionControlReportDispatch) {
        super(t);
    }

    public componentDidMount() {
        this.props.downloadTractionControlReport(this.props.reportType);
        this.updateHtml();
    }

}

export const TractionControlReportVA = connect(
    (state: IGlobalState) => ({ ...state.tractionControlReportVA, reportType: TractionControlReportType.VA }),
    { downloadTractionControlReport }
)(TractionControlReportClassVAVC);

export const TractionControlReportVC = connect(
    (state: IGlobalState) => ({ ...state.tractionControlReportVC, reportType: TractionControlReportType.VC }),
    { downloadTractionControlReport }
)(TractionControlReportClassVAVC);
*/