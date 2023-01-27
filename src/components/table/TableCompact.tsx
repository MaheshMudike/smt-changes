import translate from "../../utils/translate";
import * as cx from 'classnames';
import * as React from 'react';
import { Table, ITableProps, IColumnHeaderAppearance, computeTdClasses } from "./Table";
import { TableFixedHeader } from "./TableFixedHeader";

export const EMPTY_COLUMN_LABEL = 'account-report.not-available';

export function TableCompact<T>(props: ITableProps<T>) {
    const { ths, row, emptyColumnLabel = EMPTY_COLUMN_LABEL } = props;
    const notAvailable = translate(emptyColumnLabel);
    return props.fixedHeader ? 
    <TableFixedHeader {...props} row={
        (rowData, rowIndex, props) => wrapTds(row(rowData, rowIndex, props), ths, notAvailable)
    }/> :
    <Table {...props} row={
        (rowData, rowIndex, props) => wrapTds(row(rowData, rowIndex, props), ths, notAvailable)//.map((cell, index) => <td key={index} className={computeTdClasses(index, ths)}>{cell == null ? notAvailable : cell}</td>)        
    }/>
}

export function wrapTds<T>(ts: CellValue[], ths: IColumnHeaderAppearance[], notAvailable: string) {    
    return ts.map((cell, index) => td(cell, ths, index, notAvailable, null))
}

export class JsxElementWrapper {
    constructor(public label: string, public element: JSX.Element) {}
}
export type CellValue = string | number | JsxElementWrapper | JSX.Element

export function td<T>(value: CellValue, ths: IColumnHeaderAppearance[], index: number, notAvailable: string, className: string, 
    onClick?: (event: React.MouseEvent<HTMLTableDataCellElement>) => void) {
    if(ths[index].hide) return null;
    return <td onClick={onClick} className={cx(computeTdClasses(index, ths), className)}>{tdValue(value, notAvailable)}</td>;
}

function tdValue(value: CellValue, notAvailable: string) {
    if(value == null) return notAvailable;
    return value instanceof JsxElementWrapper ? value.element : value;
}