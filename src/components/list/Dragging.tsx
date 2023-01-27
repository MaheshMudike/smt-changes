import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import * as platforms from '../../constants/cordovaPlatforms';
import { IDragging } from '../../models/dragging';
import IPoint from '../../models/IPoint';
import { payloadAction } from '../../actions/actionUtils';

const VERTICAL_SCROLL_GESTURE_MAX_WIDTH = 50;
const START_OF_HORIZONTAL_DRAG_MAX_DELTA_Y = 10;

export const DND_DRAGGING = 'DND_DRAGGING';
export const DND_SET_DROP_DATA = 'DND_SET_DROP_DATA';

export const dragItem = payloadAction<IDragging>(DND_DRAGGING);
export const setDropData = payloadAction<any>(DND_SET_DROP_DATA);

type ClientPosition = { clientX: number; clientY: number }

// Android 4.4 (KitKat) requires the first touchmove event in a gesture to have
// the `preventDefault` method called. Otherwise `touchcancel` event is called and
// the whole gesture (sequence of events) is not tracked anymore (further `touchmove`
// events ar not triggered)
function touchMoveKitKatHack(this: Dragging, ev: { preventDefault: () => void }, t: { clientY: number }) {
    if (Math.abs(t.clientY - this.dragStart.y) < START_OF_HORIZONTAL_DRAG_MAX_DELTA_Y) {
        ev.preventDefault();
    }
}

function isKitKat() {
    return cordova.platformId === platforms.ANDROID && _.startsWith(cordova.version, '4.');
}

class Dragging extends React.Component<IDraggingProps, object> {
    public refs: {
        item: HTMLDivElement;
        [key: string]: HTMLDivElement;
    };

    public dragStart: IPoint;
    private touchMoveKitKatHack: typeof touchMoveKitKatHack;

    constructor(props: IDraggingProps) {
        super(props);
        this.touchMoveKitKatHack = isKitKat() ? touchMoveKitKatHack : _.noop;
    }

    public render() {
        return (
            <div ref='item' draggable className={this.props.className || ''}
                onDragStart={(event: React.DragEvent<any>) => {
                    var img = document.createElement("img");
                    event.dataTransfer.setDragImage(img, 0, 0);
                    this.setDropData();
                    this.setDragStart(event);                    
                }} 
                onDrag={(ev: React.DragEvent<HTMLDivElement>) => this.onMove(ev, ev, ev.dataTransfer)}
                onDragEnd={this.setDropData}
                
                onTouchStart={(ev: React.TouchEvent<any>) => {                    
                    if(ev.touches[0] !=null) this.setDragStart(ev.touches[0]);
                }}
                onTouchMove={this.onTouchMove}
                onTouchCancel={this.setDropData}
                onTouchEnd={this.setDropData}>                
                {this.props.children}
            </div>
        );
    }

    private setDragStart = (event: ClientPosition) => {
        this.dragStart = { x: event.clientX, y: event.clientY};
    }

    private onTouchMove = (ev: React.TouchEvent<any>) => {
        if(ev.touches[0] !=null) this.onMove(ev, ev.touches[0], null);
    }

    private sendDragAction = _.debounce((x: number, y: number, dataTransfer: DataTransfer) =>
        this.props.dragItem({ element: this.refs.item, clientXY: { x, y }, dragStart: this.dragStart, dataTransfer }),
    );

    private onMove(ev: { preventDefault: () => void, }, position: ClientPosition, dataTransfer: DataTransfer) {
        if(ev == null) return;
        this.touchMoveKitKatHack(event, position);
        if (Math.abs(position.clientX - this.dragStart.x) > VERTICAL_SCROLL_GESTURE_MAX_WIDTH) {
            ev.preventDefault();
            this.sendDragAction(position.clientX, position.clientY, dataTransfer);
        }
    }

    private setDropData = () => {
        this.sendDragAction.cancel();
        this.dragStart = null;
        this.props.setDropData(this.props.draggedData);
    }
}

interface IDraggingExplicitProps {
    className?: string;
    draggedData: any;
}

interface IDraggingProps extends IDraggingExplicitProps {
    dragItem: (id: IDragging) => void;
    setDropData: (a: any) => void;
}

export default connect<IDraggingExplicitProps>(
    null,
    {
        setDropData,
        dragItem,
    },
)(Dragging) as React.ComponentClass<IDraggingExplicitProps>;
