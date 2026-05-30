export const A = {
    reset:        '\x1b[0m',
    bold:         '\x1b[1m',
    dim:          '\x1b[2m',
    underline:    '\x1b[4m',
    green:        '\x1b[32m',
    red:          '\x1b[31m',
    yellow:       '\x1b[33m',
    blue:         '\x1b[34m',
    cyan:         '\x1b[36m',
    white:        '\x1b[37m',
    brightGreen:  '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightCyan:   '\x1b[96m',
    brightWhite:  '\x1b[97m',
    bgBlue:       '\x1b[44m',
    bgGreen:      '\x1b[42m',
    bgRed:        '\x1b[41m',
    home:         '\x1b[H',
    clear:        '\x1b[2J',
    hideCursor:   '\x1b[?25l',
    showCursor:   '\x1b[?25h',
    clearLine:    '\x1b[2K',
};

export const BOX = {
    tl: '╔', tr: '╗', bl: '╚', br: '╝',
    h:  '═', v:  '║',
    ml: '╠', mr: '╣',
    sl: '╟', sr: '╢', sh: '─',
};

export function c(code: string, text: string): string {
    return `${code}${text}${A.reset}`;
}

// Strip ANSI codes to get visible length
export function visLen(s: string): number {
    return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}

// Pad a string to visible width (ignoring ANSI codes)
export function visPad(s: string, width: number): string {
    const diff = width - visLen(s);
    return diff > 0 ? s + ' '.repeat(diff) : s;
}

export function naira(n: number): string {
    if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)         return `₦${(n / 1_000).toFixed(0)}K`;
    return `₦${n.toFixed(0)}`;
}

// Sparkline from array of numbers
export function sparkline(values: number[], width = 20): string {
    if (values.length === 0) return '─'.repeat(width);
    const bars   = ['▁','▂','▃','▄','▅','▆','▇','█'];
    const min    = Math.min(...values);
    const max    = Math.max(...values);
    const range  = max - min || 1;
    const sample = values.slice(-width);
    return sample
        .map((v) => {
            const idx = Math.floor(((v - min) / range) * (bars.length - 1));
            return bars[idx];
        })
        .join('');
}

// Horizontal bar
export function hbar(value: number, max: number, width = 16, color = A.green): string {
    const filled = max > 0 ? Math.round((value / max) * width) : 0;
    return c(color, '█'.repeat(filled)) + c(A.dim, '░'.repeat(width - filled));
}