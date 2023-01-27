export const enum ColorPalette {
    Blue = "Blue",
    Red = "Red",
    Gray = "Gray",
    LightGray = "LightGray",
    Black = "Black",
    Orange = "Orange"
}

export const ColorPalettePriority = {
    [ColorPalette.Blue]: 2,
    [ColorPalette.Red]: 3,
    [ColorPalette.Gray]: 1,
    [ColorPalette.LightGray]: 0,
    [ColorPalette.Black]: -1,
    [ColorPalette.Orange]: 2,
}

export const enum Brightness {
    Basic,
    Dark,
    Darker,
}

const allColors: { [palette: string]: { [brightness: number]: string } } = {
    [ColorPalette.Blue]: {
        [Brightness.Basic]: '#0280d0',
        [Brightness.Dark]: '#0164A5',
        [Brightness.Darker]: '#004B7B',
    },
    [ColorPalette.Gray]: {
        [Brightness.Basic]: '#5A7188',
        [Brightness.Dark]: '#3B4E5F',
        [Brightness.Darker]: '#323F4C',
    },
    [ColorPalette.LightGray]: {
        [Brightness.Basic]: '#c2ccd6',
        [Brightness.Dark]: '#94a6b8',
        [Brightness.Darker]: '#758ca3',
    },
    [ColorPalette.Red]: {
        [Brightness.Basic]: '#ED2324',
        [Brightness.Dark]: '#AF2525',
        [Brightness.Darker]: '#972224',
    },
    [ColorPalette.Black]: {
        [Brightness.Basic]: '#333333',
        [Brightness.Dark]: '#222222',
        [Brightness.Darker]: '#000000',
    },
    [ColorPalette.Orange]: {
        [Brightness.Basic]: '#fca23b',
        [Brightness.Dark]: '#e38416',
        [Brightness.Darker]: '#d57402',
    },
};

export function getColor(palette: ColorPalette, brightness: Brightness) {
    return (allColors[palette] || {})[brightness] || '#000000';
}
