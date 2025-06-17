// app/api/admin/users/route.ts - Get all users for admin management

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { User } from '@/app/models/auth/authModel';

export async function getAllUsers() {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    
    const users = await User.find()
      .select('email name role provider createdAt isActive promotedBy promotedAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
