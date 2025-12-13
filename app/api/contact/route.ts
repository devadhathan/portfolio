import { NextRequest, NextResponse } from 'next/server';
import { resumeData } from '@/lib/resume-data';
import { Resend } from 'resend';

// Rate limiting: max 5 messages per hour per IP
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// In-memory rate limiting (for production, use Vercel KV or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  // Get IP address from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `contact:${ip}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, timestamp } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Sanitize message (basic)
    const sanitizedMessage = message.trim().slice(0, 2000);

    // Get visitor info
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Send email notification with the exact message
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailSubject = `New message from ${resumeData.website}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">New Message from Your Portfolio</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007AFF;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; font-size: 16px;">${sanitizedMessage.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p><strong>From IP:</strong> ${ip}</p>
              <p><strong>User Agent:</strong> ${userAgent}</p>
              <p><strong>Timestamp:</strong> ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}</p>
            </div>
          </div>
        `;

        const emailText = `New message from ${resumeData.website}:\n\n${sanitizedMessage}\n\nFrom IP: ${ip}\nTimestamp: ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}`;

        await resend.emails.send({
          from: 'Portfolio <onboarding@resend.dev>', // You can change this after verifying your domain
          to: resumeData.email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        });

        console.log('Email notification sent successfully to', resumeData.email);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails, just log it
      }
    } else {
      console.log('=== NEW CONTACT MESSAGE (RESEND_API_KEY not set) ===');
      console.log('From:', ip);
      console.log('User Agent:', userAgent);
      console.log('Timestamp:', timestamp || new Date().toISOString());
      console.log('Message:', sanitizedMessage);
      console.log('==========================');
      console.log('To enable email notifications, set RESEND_API_KEY in your environment variables');
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


