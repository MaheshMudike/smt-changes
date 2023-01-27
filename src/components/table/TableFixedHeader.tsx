import { ITableProps, Table } from "./Table";
import * as React from 'react';

export function TableFixedHeader<T>(props: ITableProps<T>) {
    return <div className='table-fixed-header-container cover-all' >
        <div className='table-fixed-header-container2' >
            <Table {...props} fixedHeader={true}/>
        </div>
    </div>
}