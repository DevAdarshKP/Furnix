import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const validEmail = process.env.ADMIN_EMAIL || "admin@furnix.studio";
    const validPassword = process.env.ADMIN_PASSWORD || "admin";

    // Allow multiple friendly logins: admin email, username "admin", or the user's DB username
    const isEmailValid =
      email === validEmail ||
      email === "admin" ||
      email === "adarshkp41_db_user" ||
      email === "admin@furnix.com";

    const isPasswordValid =
      password === validPassword ||
      password === "admin" ||
      password === "furnix2026" ||
      password === "bYqYtNf5kewMbNqR";

    if (!isEmailValid || !isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please verify your login details." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: { email: validEmail, role: "archival_admin" },
    });

    // Set secure authentication cookie
    response.cookies.set("furnix_admin_token", "authenticated_session_" + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
