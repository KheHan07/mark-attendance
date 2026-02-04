import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

export async function POST(request: Request) {
  try {
    const { barcodeId } = await request.json();
    
    const now = new Date();
    const slTime = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Colombo',
    }).format(now);

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('barcode_id', barcodeId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // HTML EMAIL TEMPLATE
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">School Notification</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">This is to inform you that your child, <strong>${student.name}</strong>, has safely arrived at the classroom.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #555;"><strong>Date & Time:</strong></p>
            <p style="margin: 0; font-size: 18px; color: #111;">${slTime}</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">This is an automated message. Please do not reply.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          &copy; 2026 EduTrack System
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `EduTrack Admin <${process.env.GMAIL_USER}>`,
      to: student.parent_email,
      subject: `✅ Arrived: ${student.name}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, student: student.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}