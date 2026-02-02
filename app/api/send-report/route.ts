import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

export async function POST(request: Request) {
  try {
    const s = await request.json(); // Student data
    
    const emailBody = `
      Term Test Results for ${s.name}:
      -----------------------------
      Math:     ${s.math}
      Science:  ${s.science}
      History:  ${s.history}
      English:  ${s.english}
      ICT:      ${s.ict}
      -----------------------------
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: s.parent_email,
      subject: `Report Card: ${s.name}`,
      text: emailBody,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}