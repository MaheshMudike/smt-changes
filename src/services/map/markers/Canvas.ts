import { Size } from '../../../models/map/mapModel';

export default class Canvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    get context() {
        return this.ctx;
    }

    public resize(size: Size) {
        this.canvas.width = size.width;
        this.canvas.height = size.height;
        this.context.scale(devicePixelRatio, devicePixelRatio);
    }

    public toDataURL() {
        return this.canvas.toDataURL();
    }
}
