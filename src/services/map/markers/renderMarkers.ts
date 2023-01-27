import { Brightness, ColorPalette, getColor } from '../../../constants/colors';
import { Icon } from '../../../models/map/mapModel';
import Canvas from './Canvas';
import { getIcon, IconType } from './mapIcons';
import { MarkerType } from '../../../models/markers/IMarker';
import { cachedFunction } from '../../../utils/cachedFunction';
import { Point, Size } from '../../../models/map/mapModel';

export interface ISquareMarkerOptions {
    markerType?: MarkerType;
    palette: ColorPalette,
    isCluster?: boolean;
    clusterSize?: number;
    highlight?: boolean;
}

function markerDimensions(scaledWidth: number) {
    const scaledSize = new Size(scaledWidth, 58);
    return {
        anchor: new Point(
            scaledWidth * devicePixelRatio / 2,
            50 * devicePixelRatio,
        ),
        scaledSize,
        size: new Size(
            scaledSize.width * devicePixelRatio,
            scaledSize.height * devicePixelRatio,
        ),
    };
}

const squareDimensions = markerDimensions(48);

export const getClusterMarker = cachedFunction(
    (clusterSize: number, markerType: MarkerType, palette: ColorPalette, highlight: boolean) => {
        const canvas = createCanvas(squareDimensions.size);
        renderSquareMarker(canvas.context, { 
            clusterSize,
            isCluster: true,
            highlight,
            markerType,
            palette
        });
        return { ...squareDimensions, url: canvas.toDataURL() };
    }
)

export const getSingleMarker = cachedFunction(
    (markerType: MarkerType, palette: ColorPalette, highlight: boolean) => {
        const canvas = createCanvas(squareDimensions.size);
        renderSquareMarker(canvas.context, { palette, highlight, markerType });
        return { ...squareDimensions, url: canvas.toDataURL() };
    }
);

function createCanvas(size: Size) {
    const canvas = new Canvas();
    canvas.resize(size);
    return canvas;
}

function renderSquareMarker(context: CanvasRenderingContext2D, options: ISquareMarkerOptions) {
    const palette = options.palette;
    const borderColor = getColor(palette, Brightness.Dark);
    const color = getColor(palette, Brightness.Basic);
    const highlightedColor = options.highlight ? getColor(palette, Brightness.Darker) : null;
    const clusterColor = getColor(palette, Brightness.Darker);

    if(options.isCluster) {
        renderMarkerShape(context, {
            borderColor,
            color,
            scale: 0.9,
            x: 10,
            y: 4,
        });
    }
    renderMarkerShape(context, {
        borderColor,
        color,
        highlightedColor,
        x: 6,
        y: 8,
    });

    const markerType = options.markerType;
    const { img, iconType } = getIcon(markerType);
    const icon = img;
    if (icon != null) {
        if(iconType === IconType.SVG) {
            context.drawImage(icon, - icon.width / 2 + MARKER_X_CENTER, 15, icon.width, icon.height);
        } else {
            const width = icon.width / devicePixelRatio;
            const height = icon.height / devicePixelRatio;
            context.drawImage(icon, - width / 2 + MARKER_X_CENTER, 0, width, height);
        }
    }
    if (options.isCluster) {
        renderClusterSizeCircle(context, clusterColor, `${ options.clusterSize }`);
    }
    renderShadow(context);
}

function renderClusterSizeCircle(ctx: CanvasRenderingContext2D, color: string, text: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(37, 11, 11, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'normal 11px OpenSans-Bold, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 37, 11);
}



const TECHNICIAN_FONT = 'normal 11px OpenSans-Bold, sans-serif';

export function renderTechnicianMarker(name: string, colorPalette: ColorPalette, highlight: boolean): Icon {
    const canvas = new Canvas();
    const context = canvas.context;
    const upperCaseName = name.toUpperCase();

    context.font = TECHNICIAN_FONT;
    const { width } = context.measureText(upperCaseName);
    const { anchor, scaledSize, size } = markerDimensions(width + 28);
    canvas.resize(size);

    renderMarkerShape(context, {
        borderColor: getColor(colorPalette, Brightness.Dark),
        color: getColor(colorPalette, Brightness.Basic),
        highlightedColor: highlight ? getColor(colorPalette, Brightness.Dark) : null,
        width: width + 16,
        x: 6,
        y: 8,
    });

    context.fillStyle = '#FFFFFF';
    context.font = TECHNICIAN_FONT;
    context.fillText(upperCaseName, 14, 30);

    renderShadow(context, scaledSize.width / 2);

    return { anchor, scaledSize, size, url: canvas.toDataURL() };
}

const MARKER_X_CENTER = 24;

function renderShadow(ctx: CanvasRenderingContext2D, xCenter: number = MARKER_X_CENTER) {
    const yFactor = 0.2;
    ctx.scale(1, yFactor);
    const r = 18;
    const x = xCenter - r;
    const y = 50 / yFactor;

    const gradient = ctx.createRadialGradient(x + r, y + r, r, x + r, y + r, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'rgba(75, 76, 77, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, 2 * r, 2 * r);
    ctx.scale(1, 1 / yFactor);
}

export const highlightWidth = 6;
const MARKER_WIDTH = 36;

/*
 * This function renders a shape like that:
 *
 *      +---- here: top-right part starts; left part ends
 *      |
 *      v
 *      ______________
 *    /                \
 *   |                  |
 *   |                  |
 *   |                  |
 *   |                  |
 *   |                  |
 *    \______    ______/
 *           \  /
 *          ^ \/ ^
 *          |    |
 *          |    +------- here: top-right part ends; indicator starts;
 *          |
 *          +----- here indicator ends, left part starts
 *
 *
 */
function renderMarkerShape(
    ctx: CanvasRenderingContext2D,
    options: { borderColor: string; color: string; scale?: number; x: number; y: number; width?: number; highlightedColor?: string }) {
    const scale = options.scale || 1;

    const dimensions = {
        height: MARKER_WIDTH * scale,
        radius: 4 * scale,
        width: (options.width || MARKER_WIDTH) * scale,
        x: options.x * scale,
        y: options.y * scale,
    };

    ctx.fillStyle = options.color;
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = Math.ceil(scale);

    if(options.highlightedColor != null) {
        ctx.strokeStyle = options.highlightedColor;
        ctx.lineWidth = highlightWidth;
    }

    renderTopRightPart(ctx, dimensions);
    renderIndicator(ctx, dimensions, scale);
    renderLeftPart(ctx, dimensions);

    ctx.fill();
    ctx.stroke();
}

interface IDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
}

function renderTopRightPart(ctx: CanvasRenderingContext2D, dimensions: IDimensions) {
    const { x, y, width, height, radius } = dimensions;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
}

function renderLeftPart(ctx: CanvasRenderingContext2D, dimensions: IDimensions) {
    const { x, y, height, radius } = dimensions;

    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function renderIndicator(ctx: CanvasRenderingContext2D, dimensions: IDimensions, scale: number) {
    const { x, y, width, height, radius } = dimensions;
    const indicatorHeight = 5 * scale;
    const indicatorWidth = 9 * scale;

    ctx.lineTo(x + (width + indicatorWidth) / 2, y + height);
    ctx.lineTo(x + width / 2, y + height + indicatorHeight);
    ctx.lineTo(x + (width - indicatorWidth) / 2, y + height);
    ctx.lineTo(x + radius, y + height);
}
