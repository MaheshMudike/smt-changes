import IPoint from './IPoint';

export interface IDragging {
    clientXY: IPoint;
    dragStart: IPoint;
    element: Element;
    dataTransfer: DataTransfer;
}
