import { supabaseAdmin } from './supabaseAdmin';

export async function requireAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing token');
  }

  const token = authHeader.replace('Bearer ', '');

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    throw new Error('Invalid token');
  }

  const role = data.user.app_metadata?.role;

  if (role !== 'admin') {
    throw new Error('Forbidden');
  }

  return data.user;
}
