import * as _ from 'lodash';
import { Circle } from 'progressbar.js';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { JsxElement } from 'typescript';

export default class Progress extends React.Component<IProgressProps, object> {
    public static defaultProps: IProgressProps = {
        containerClassName: '.progressbar-container',
        containerStyle: {},
        initialAnimate: false,
        options: {},
        progress: 0,
        text: null,
    };

    private shape: Circle;
    constructor(props: IProgressProps) {
        super(props);       
        
        this._create = this._create.bind(this);
        this._destroy = this._destroy.bind(this);
        this._animateProgress = this._animateProgress.bind(this);
        this._setProgress = this._setProgress.bind(this);
        this._setText = this._setText.bind(this);
        this._setShape = this._setShape.bind(this);

        this.shape = null;
    }

    public render() {        
        return <div className={this.props.containerClassName} style={this.props.containerStyle}/>;
    }

    public componentDidMount() {
        this._create(this.props);
    }

    public componentWillReceiveProps(nextProps: IProgressProps) {
        if (!_.isEqual(this.props.options, nextProps.options)) {
            this._destroy();
            this._create(nextProps, this.props);
            return;
        }

        this._animateProgress(nextProps.progress);
        this._setText(nextProps.text);
    }

    public componentWillUnmount() {
        this._destroy();
    }

    private _create(props: IProgressProps, oldProps?: IProgressProps) {
        const container = findDOMNode(this);        
        this._setShape(new Circle(container as Element, this.props.options));

        if (props.initialAnimate) {
            if (oldProps) {
                this._setProgress(oldProps.progress);
            }

            this._animateProgress(props.progress);
        } else {
            this._setProgress(props.progress);
        }

        this._setText(props.text);
    }

    private _destroy() {
        const shape = this._getShape();
        if (shape) {
            shape.destroy();
            this._setShape(null);
        }
    }

    private _animateProgress(progress?: number) {
        this._getShape().animate(progress);
    }

    private _setProgress(progress?: number) {
        this._getShape().set(progress);
    }

    private _setText(text: string) {
        if (text) {
            this._getShape().setText(text);
        }
    }

    private _getShape() {
        return this.shape;
    }

    private _setShape(circle: Circle) {
        this.shape = circle;        
    }
}

interface IProgressProps {
    options: any;
    progress?: number;
    //text: number | string;
    text: string;
    initialAnimate?: boolean;
    containerStyle?: any;
    containerClassName?: string;
}