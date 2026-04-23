import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // ป้องกันไม่ให้ endpoint นี้ใช้ใน production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not allowed in production' },
        { status: 403 }
      );
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ตรวจสอบ token
    const { data: adminData, error: adminError } =
      await supabaseAdmin.auth.getUser(token);

    if (adminError || !adminData.user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // ตรวจ role admin
    const role = adminData.user.app_metadata?.role;

    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: admin only' },
        { status: 403 }
      );
    }

    // รับค่าจาก request body
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'email and newPassword are required' },
        { status: 400 }
      );
    }

    // ดึง users ทั้งหมด
    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { error: usersError.message },
        { status: 500 }
      );
    }

    // หา user ตาม email
    const user = usersData.users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // reset password + confirm email
    const { data: updatedUser, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
        email_confirm: true,
      });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Dev user fixed by admin ${adminData.user.email}`,
      user: {
        id: updatedUser.user?.id,
        email: updatedUser.user?.email,
        email_confirmed_at: updatedUser.user?.email_confirmed_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}