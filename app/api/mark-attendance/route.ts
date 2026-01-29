// src/app/api/mark-attendance/route.ts
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// 1. Setup Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 2. Setup Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { barcodeId } = await request.json();

    // Step A: Find the student in DB
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('barcode_id', barcodeId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found!' }, { status: 404 });
    }

    // Step B: Send the Email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: student.parent_email,
      subject: `School Arrival Alert: ${student.name}`,
      text: `Hello,\n\nYour child ${student.name} has arrived at school safely.\n\nCurrent Term Marks:\n${student.marks}\n\nThis is an automated message from the School Attendance System.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, student: student.name });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}