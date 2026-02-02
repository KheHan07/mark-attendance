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
    console.log(`🔍 Server received Scan: ${barcodeId}`);

    // 1. Check Database
    const { data: student, error: dbError } = await supabase
      .from('students')
      .select('*')
      .eq('barcode_id', barcodeId)
      .single();

    if (dbError) {
      console.error("❌ Database Error:", dbError.message);
      return NextResponse.json({ error: `DB Error: ${dbError.message}` }, { status: 500 });
    }
    
    if (!student) {
      console.error("❌ Student not found in DB");
      return NextResponse.json({ error: 'Student ID not found in database' }, { status: 404 });
    }

    console.log(`✅ Found Student: ${student.name}. Sending email...`);

    // 2. Send Email
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: student.parent_email,
        subject: `Arrival: ${student.name}`,
        text: `Your child ${student.name} has arrived. Marks: ${student.marks}`,
      });
      console.log("✅ Email sent successfully!");
    } catch (emailError: any) {
      console.error("❌ Email Failed:", emailError.message);
      return NextResponse.json({ error: `Email Failed: ${emailError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, student: student.name });

  } catch (err: any) {
    console.error("❌ General Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}