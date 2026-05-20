import { ANSI, BOX, c } from './ansi';

export function drawBox(title: string, lines: string[], width: number): string[] {
    const output: string[] = [];
    const innerWidth = width - 2;

    // Top border
    output.push(
        c(ANSI.cyan, BOX.topLeft + BOX.horizontal.repeat(innerWidth) + BOX.topRight)
    );

    // Title bar
    const titlePadded = ` ${title} `;
    const titleLine   = titlePadded.slice(0, innerWidth).padEnd(innerWidth);
    output.push(
        c(ANSI.cyan, BOX.vertical) +
        c(ANSI.bold + ANSI.brightCyan, titleLine) +
        c(ANSI.cyan, BOX.vertical)
    );

    // Title separator
    output.push(
        c(ANSI.cyan, BOX.titleLeft + BOX.horizontal.repeat(innerWidth) + BOX.titleRight)
    );

    // Content lines
    for (const line of lines) {
        // Strip ANSI for length calculation, pad to innerWidth
        const plainLen  = line.replace(/\x1b\[[0-9;]*m/g, '').length;
        const padding   = Math.max(0, innerWidth - plainLen);
        const paddedLine = line + ' '.repeat(padding);
        output.push(
            c(ANSI.cyan, BOX.vertical) + paddedLine + c(ANSI.cyan, BOX.vertical)
        );
    }

    // Bottom border
    output.push(
        c(ANSI.cyan, BOX.bottomLeft + BOX.horizontal.repeat(innerWidth) + BOX.bottomRight)
    );

    return output;
}