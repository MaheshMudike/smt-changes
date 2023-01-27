declare module 'react-virtual-list' {
    const ReactVirtualList: (options?: any) =>  (params: (a: any) => JSX.Element) => (props: { items: any, itemHeight: number  } ) => React.Component<any,any>;
    export default ReactVirtualList
}