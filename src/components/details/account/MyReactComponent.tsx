import * as React from 'react';
import { DataStatus, ComponentStatus } from "src/models/IItemsState";

export default class ReactComponent<P, S> extends React.Component<P, S> {

    runPromise<T>(promise: () => Promise<T>, stateSetter: (ds: DataStatus<T>, prevState: S) => S | Pick<S, keyof S>,  initialData: T = null) {
        this.setState(prevState => stateSetter({ status: ComponentStatus.IN_PROGRESS, data: initialData, lastUpdated: new Date() }, prevState));
        return promise()
        .then(result => {
            this.setState(prevState => stateSetter({ status: ComponentStatus.SUCCESS, data: result, lastUpdated: new Date() }, prevState));
        })
        .catch(error => {
            this.setState(prevState => stateSetter({ status: ComponentStatus.FAILURE, data: null, lastUpdated: new Date() }, prevState));
        });
    }
}