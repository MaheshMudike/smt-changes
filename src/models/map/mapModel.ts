export class Icon {
    public anchor: Point;
    public scaledSize: Size;
    public size: Size;
    public url: string;
}

export class Size {
    public height: number;
    public width: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

export class Point {
    public y: number;
    public x: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
