export const NAIRA = (n: number) =>
    `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function baseLayout(title: string, bodyContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#2D6A4F;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">${title}</h1>
              <p style="margin:6px 0 0;color:#B7E4C7;font-size:13px;">
                Generated on ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' })} WAT
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                This is an automated message from your Sales Bot &mdash; Day 95 of 300 Days of Code.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function sectionHeading(text: string): string {
    return `<h2 style="margin:0 0 16px;font-size:16px;font-weight:bold;color:#1f2937;border-left:4px solid #2D6A4F;padding-left:10px;">${text}</h2>`;
}

export function statCard(label: string, value: string): string {
    return `
  <td width="33%" style="padding:0 6px;">
    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
      <p style="margin:0;font-size:20px;font-weight:bold;color:#2D6A4F;">${value}</p>
    </div>
  </td>`;
}

export function tableHeader(...cols: string[]): string {
    const cells = cols.map((c) =>
        `<th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">${c}</th>`
    ).join('');
    return `<thead><tr>${cells}</tr></thead>`;
}

export function tableRow(cells: string[], highlight = false): string {
    const bg = highlight ? 'background-color:#f0fdf4;' : '';
    const tds = cells.map((c) =>
        `<td style="padding:10px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;${bg}">${c}</td>`
    ).join('');
    return `<tr>${tds}</tr>`;
}