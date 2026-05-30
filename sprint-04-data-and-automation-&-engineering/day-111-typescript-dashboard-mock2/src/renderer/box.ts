import { A, BOX, c, visLen } from './ansi';

export function drawBox(title: string, lines: string[], width: number, subtitle = ''): string[] {
    const inner  = width - 2;
    const out:   string[] = [];

    out.push(c(A.cyan, BOX.tl + BOX.h.repeat(inner) + BOX.tr));

    const titleStr  = ` ${title} `;
    const titlePad  = titleStr.slice(0, inner).padEnd(inner);
    out.push(c(A.cyan, BOX.v) + c(A.bold + A.brightCyan, titlePad) + c(A.cyan, BOX.v));

    if (subtitle) {
        const sub = ` ${subtitle} `.slice(0, inner).padEnd(inner);
        out.push(c(A.cyan, BOX.sl + BOX.sh.repeat(inner) + BOX.sr));
        out.push(c(A.cyan, BOX.v) + c(A.dim, sub) + c(A.cyan, BOX.v));
    }

    out.push(c(A.cyan, BOX.ml + BOX.h.repeat(inner) + BOX.mr));

    for (const line of lines) {
        const visible = line.replace(/\x1b\[[0-9;]*m/g, '');
        const padding = Math.max(0, inner - visible.length);
        out.push(c(A.cyan, BOX.v) + line + ' '.repeat(padding) + c(A.cyan, BOX.v));
    }

    out.push(c(A.cyan, BOX.bl + BOX.h.repeat(inner) + BOX.br));
    return out;
}