import translate from "../../utils/translate";
import * as cx from 'classnames';
import * as React from 'react';
import { SortOrder } from "../../reducers/TechnicianReportReducer";

export interface ICellAppearance {
    rowSpan?: number;
    colSpan?: number;
    borderLeft?: boolean;
    borderRight?: boolean;
    color?: string;
    width?: number;
    className?: string;
}

export interface IColumnHeaderAppearance extends ICellAppearance {
    isBig?: boolean;
    label?: string;
    isVirtual?: boolean;
    onClick?: (event: any) => void;
    sortBy?: string;
    sortState?: { sortBy: string, sortOrder: SortOrder },
    dontTranslate?: boolean,
    hide?: boolean
}

export const th = (width: number, label: string): IColumnHeaderAppearance => ({ width, label })

function computeHeaderStyling(appearance: IColumnHeaderAppearance) {
    return cx(appearance.className ? appearance.className : '',
        appearance.width ? 'data-table-column--col' + appearance.width : '',
        {
            'data-table-bordered--left': appearance.borderLeft,
            'data-table-bordered--right': appearance.borderRight,
            'data-table-header--big': appearance.isBig,
            'data-table-header--clickable': appearance.onClick != null,
        },
    )
}

export function translateWithPrefix(thPrefix: string, label: string) {
    if(label == '' || label == null) return '';
    return label.indexOf('.') == -1 ? translate(thPrefix + '.' + label) : translate(label);
}

export function computeTdClasses(index: number, ths: IColumnHeaderAppearance[]) {
    const th = ths[index];
    const thValid = th[0] != null;
    return cx(th.color ? 'data-table-cell--' + th.color : '',
                th.className ? th.className : '',
                { 'data-table-bordered--left': th.borderLeft }, 
                { 'data-table-bordered--right': th.borderRight },
            );
}

export interface ITableProps<T> {
    className?: string, noEntriesLabel?: string, 
    emptyColumnLabel?: string, 
    sortState?: { sortBy: string, sortOrder: SortOrder },
    thPrefix: string, 
    ths: IColumnHeaderAppearance[], 
    rows: T[], 
    row: (t: T, index: number, props: ITableProps<T>) => any[],
    colgroup?: React.ReactNode,
    fixedHeader?: boolean;
}

export function Table<T>(props: ITableProps<T>) {    
    const { thPrefix, ths, rows, row, className, noEntriesLabel = 'account-report.no-entries', emptyColumnLabel = 'account-report.not-available' } = props;
    if(rows == null) return null;
    const notAvailable = translate(emptyColumnLabel);
    return (
        <table className={cx('data-table', className || '', { 'fixed-header': props.fixedHeader })}>
        { props.colgroup }
        <thead><tr>{ths.map(th => {
            if(th.hide) return null;
            const headerText = th.dontTranslate ? th.label : translateWithPrefix(thPrefix, th.label);
            const headerContent = 
                <span>{headerText}{ props.sortState && th.sortBy && th.sortBy === props.sortState.sortBy && 
                    <div className="Select-arrow-container"><span className={cx('Select-arrow', {'flip-image': props.sortState.sortOrder == SortOrder.Ascending })}></span></div>
                }</span>
            return <th colSpan={th.colSpan} className={computeHeaderStyling(th)} onClick={th.onClick}>
                {headerContent} {props.fixedHeader && <div className="th">{headerContent}</div>}                
            </th>
        })}</tr></thead>
        <tbody>
        {rows.map((rowData, rowIndex) => 
            <tr key={rowIndex}>{
                row(rowData, rowIndex, props)//.map((cell, index) => <td style={props.cellStyling && props.cellStyling(cell, rowIndex)} key={index} className={computeTdClasses(index, ths)}>{cell == null ? notAvailable : cell}</td>)
            }</tr>
        )}
        {rows.length === 0 ? (
            <tr>
                <td className={cx('data-table-cell', 'data-table-column--col12', 'data-table-cell--no-entries')} colSpan={ths.length}>                    
                    {translate(noEntriesLabel)}
                </td>
            </tr>
        ) : null}
        </tbody>
        </table>        
    );
}