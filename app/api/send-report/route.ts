import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

export async function POST(request: Request) {
  try {
    const s = await request.json();
    
    // TABLE HTML EMAIL
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #2563EB, #1E40AF); padding: 25px; text-align: center;">
          <h2 style="color: white; margin: 0;">Term Test Report</h2>
          <p style="color: #bfdbfe; margin-top: 5px;">${s.name}</p>
        </div>
        
        <div style="padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="text-align: left; padding: 12px; color: #64748b;">Subject</th>
              <th style="text-align: right; padding: 12px; color: #64748b;">Score</th>
            </tr>
            ${[
              ['Mathematics', s.math],
              ['Science', s.science],
              ['History', s.history],
              ['English', s.english],
              ['ICT', s.ict]
            ].map(([subj, score]) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; color: #334155; font-weight: 500;">${subj}</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; color: ${(score as number) < 50 ? '#ef4444' : '#10b981'};">
                  ${score}
                </td>
              </tr>
            `).join('')}
          </table>
          
          <div style="margin-top: 25px; padding: 15px; background: #fff7ed; border-left: 4px solid #f97316; color: #9a3412;">
            <strong>Note:</strong> Please contact the class teacher if you have questions about these results.
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: s.parent_email,
      subject: `📊 Report Card: ${s.name}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}