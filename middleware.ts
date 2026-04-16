import { NextResponse, NextRequest } from 'next/server'
import * as jose from 'jose'

const jwk = {
  "x": "j4FZnx6qs78WG5Klz9ZIQPlClDkYZcipuJDe0IvnveU",
  "y": "x_Zo6SuzqC1M6gHOoq4BHDyAAcf9D93i5urLnoSVQbY",
  "alg": "ES256",
  "crv": "P-256",
  "ext": true,
  "kid": "68257749-ac66-4441-99c1-b849de9dfc9d",
  "kty": "EC",
  "key_ops": ["verify"]
};

// ใช้ชื่อ middleware เป็นหลักเพื่อให้ Error หายไป
export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (req.nextUrl.pathname.startsWith('/app/api/')) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
      const ecPublicKey = await jose.importJWK(jwk, 'ES256');
      const { payload } = await jose.jwtVerify(token, ecPublicKey, {
        algorithms: ['ES256'],
      });

      const response = NextResponse.next();
      if (payload.sub) {
        response.headers.set('x-user-id', payload.sub);
      }
      return response;
    } catch (err: any) {
      console.error('JWT Error:', err.message);
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

// Export alias เป็น proxy เพื่อรองรับ Next.js 16 warning
export const proxy = middleware;

export const config = {
  matcher: ['/app/api/:path*'], 
}
