import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Отсутствует refresh токен' },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

    // Update cookies
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
    });

    cookieStore.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, data: { accessToken } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Не удалось обновить токен' },
      { status: 401 }
    );
  }
}


