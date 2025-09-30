import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Otp } from '@/models/Otp';
import { User } from '@/models/User';

export async function POST(req: Request) {
  await connectToDatabase();
  const { email, mode = "signup", username } = await req.json();

  if (mode === "signup") {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already registered. Please log in.', userExists: true },
        { status: 400 }
      );
    }
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken. Please choose another one.', usernameExists: true },
          { status: 400 }
        );
      }
    }
  } else if (mode === "reset") {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 400 }
      );
    }
  }

  // FOR TESTING: Use fixed OTP instead of random
  const otp = "123456"; // Fixed test OTP for easy testing
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  // TESTING MODE: Skip MSG91 email sending
  console.log(`🔧 TEST MODE: OTP for ${email} is: ${otp}`);

  return NextResponse.json({
    success: true,
    message: `OTP generated and saved to database. Check console for OTP: ${otp}`,
    testOtp: otp // Include in response for testing (remove in production)
  });
}
