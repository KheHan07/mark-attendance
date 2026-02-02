import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const now = new Date();

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('barcode_id', barcodeId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Send "Arrived" Email Only (No Marks)
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: student.parent_email,
      subject: `Attendance: ${student.name}`,
      text: `Hello,\n\n${student.name} arrived at school.\nDate: ${now.toLocaleDateString()}\nTime: ${now.toLocaleTimeString()}`,
    });

    return NextResponse.json({ success: true, student: student.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}