// ANSI escape sequences for terminal control
export const ANSI = {
    reset:       '\x1b[0m',
    bold:        '\x1b[1m',
    dim:         '\x1b[2m',

    // Foreground colours
    black:       '\x1b[30m',
    red:         '\x1b[31m',
    green:       '\x1b[32m',
    yellow:      '\x1b[33m',
    blue:        '\x1b[34m',
    magenta:     '\x1b[35m',
    cyan:        '\x1b[36m',
    white:       '\x1b[37m',
    brightGreen: '\x1b[92m',
    brightCyan:  '\x1b[96m',
    brightWhite: '\x1b[97m',

    // Background colours
    bgBlack:     '\x1b[40m',
    bgGreen:     '\x1b[42m',
    bgBlue:      '\x1b[44m',
    bgCyan:      '\x1b[46m',

    // Cursor control
    clearScreen: '\x1b[2J',
    home:        '\x1b[H',
    hideCursor:  '\x1b[?25l',
    showCursor:  '\x1b[?25h',
    moveTo:      (row: number, col: number) => `\x1b[${row};${col}H`,
    clearLine:   '\x1b[2K',
};

// Box drawing characters
export const BOX = {
    topLeft:     '╔',
    topRight:    '╗',
    bottomLeft:  '╚',
    bottomRight: '╝',
    horizontal:  '═',
    vertical:    '║',
    titleLeft:   '╠',
    titleRight:  '╣',
    midLeft:     '╟',
    midRight:    '╢',
    midHoriz:    '─',
};

export function c(color: string, text: string): string {
    return `${color}${text}${ANSI.reset}`;
}

export function pad(str: string, len: number): string {
    const plain = str.replace(/\x1b\[[0-9;]*m/g, ''); // strip ANSI for length calc
    const diff  = len - plain.length;
    return diff > 0 ? str + ' '.repeat(diff) : str;
}

export function truncate(str: string, len: number): string {
    return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

export function naira(n: number): string {
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function miniBar(value: number, max: number, width = 10): string {
    const filled = Math.round((value / max) * width);
    return c(ANSI.green, '█'.repeat(filled)) + c(ANSI.dim, '░'.repeat(width - filled));
}