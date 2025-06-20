// app/api/admin/users/route.ts - Updated to use new management functions
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllUsersForAdmin } from '@/lib/admin/management';

// GET - Get all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const roleFilter = searchParams.get('role') as 'all' | 'user' | 'admin' | 'super_admin' || 'all';

    const result = await getAllUsersForAdmin(page, limit, search, roleFilter);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}