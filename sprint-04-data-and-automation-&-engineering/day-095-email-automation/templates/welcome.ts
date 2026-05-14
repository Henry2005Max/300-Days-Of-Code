import { WelcomeData, EmailPayload } from '../types';
import { baseLayout } from './base';

export function buildWelcomeEmail(data: WelcomeData): EmailPayload {
    const body = `
    <p style="font-size:18px;font-weight:bold;color:#1f2937;margin:0 0 8px;">
      Welcome, ${data.name}! 🎉
    </p>
    <p style="font-size:15px;color:#6b7280;margin:0 0 32px;">
      We're glad to have you join us from ${data.city}.
    </p>

    <!-- Welcome card -->
    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:24px;margin-bottom:32px;">
      <p style="margin:0 0 12px;font-size:14px;color:#374151;">
        Your account has been created successfully. Here are your details:
      </p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#6b7280;width:100px;">Name</td>
          <td style="padding:4px 0;font-size:14px;color:#1f2937;font-weight:bold;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#6b7280;">Email</td>
          <td style="padding:4px 0;font-size:14px;color:#1f2937;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#6b7280;">City</td>
          <td style="padding:4px 0;font-size:14px;color:#1f2937;">${data.city}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#6b7280;">Joined</td>
          <td style="padding:4px 0;font-size:14px;color:#1f2937;">${data.joinDate}</td>
        </tr>
      </table>
    </div>

    <!-- What's next -->
    <p style="font-size:15px;font-weight:bold;color:#1f2937;margin:0 0 12px;">What's next?</p>
    <ul style="margin:0 0 32px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
      <li>Browse our latest products and deals</li>
      <li>Set up your delivery address in your profile</li>
      <li>Enjoy free delivery on your first order</li>
    </ul>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="#"
         style="display:inline-block;background-color:#2D6A4F;color:#ffffff;padding:14px 32px;
                border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;">
        Start Shopping
      </a>
    </div>
  `;

    const html = baseLayout('Welcome to the Store!', body);

    const text = [
        `Welcome, ${data.name}!`,
        ``,
        `Your account has been created successfully.`,
        `Email   : ${data.email}`,
        `City    : ${data.city}`,
        `Joined  : ${data.joinDate}`,
        ``,
        `Start shopping today!`,
    ].join('\n');

    return {
        to:      data.email,
        subject: `Welcome aboard, ${data.name.split(' ')[0]}! 🎉`,
        html,
        text,
    };
}