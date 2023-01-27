declare module 'react-modal2' {
    interface IReactModal {
        onClose: Function;
        closeOnEsc?: boolean;
        closeOnBackdropClick?: boolean;
        backdropClassName?: string;
        backdropStyles?: any;
        modalClassName?: string;
        modalStyles?: any;
    }
    export default class ReactModal extends React.Component<IReactModal, {}> {
        public static getApplicationElement: Function;
    }
}
