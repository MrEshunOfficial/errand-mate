// app/api/admin/manage/route.ts - API routes for admin management

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { promoteUserToAdmin, demoteAdminToUser, getAllAdmins } from '@/auth';

// GET - Get all admins
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admins = await getAllAdmins();
    return NextResponse.json({ admins });
    
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Promote user to admin
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Only super_admin can promote users to admin
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Only super admins can promote users.' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const success = await promoteUserToAdmin(email, session.user.email!);
    
    if (success) {
      return NextResponse.json({ message: 'User promoted to admin successfully' });
    } else {
      return NextResponse.json({ error: 'User not found or promotion failed' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Error promoting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Demote admin to user
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    // Only super_admin can demote admins
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Only super admins can demote admins.' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Prevent super admin from demoting themselves
    if (email === session.user.email) {
      return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
    }

    const success = await demoteAdminToUser(email, session.user.email!);
    
    if (success) {
      return NextResponse.json({ message: 'Admin demoted to user successfully' });
    } else {
      return NextResponse.json({ error: 'User not found or demotion failed' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Error demoting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}