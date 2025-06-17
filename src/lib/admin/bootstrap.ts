// lib/admin/bootstrap.ts - System to create first super admin

import { connect } from "../dbconfigue/dbConfigue";
import { User } from "../../app/models/auth/authModel";
import { AdminAuditLog } from "../../app/models/auth/adminModels";

/**
 * OPTION 1: Environment Variable Bootstrap
 * Create first super admin from environment variables on app startup
 */
export async function bootstrapSuperAdmin(): Promise<void> {
  try {
    await connect();
    
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';
    
    if (!superAdminEmail) {
      console.log('No SUPER_ADMIN_EMAIL found in environment variables');
      return;
    }
    
    // Check if any super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }
    
    // Check if the user already exists
    let user = await User.findOne({ email: superAdminEmail.toLowerCase() });
    
    if (user) {
      // Promote existing user to super admin
      user.role = 'super_admin';
      user.promotedBy = 'system';
      user.promotedAt = new Date();
      await user.save();
      
      console.log(`Existing user ${superAdminEmail} promoted to super admin`);
    } else {
      // Create new super admin user
      user = await User.create({
        email: superAdminEmail.toLowerCase(),
        name: superAdminName,
        role: 'super_admin',
        provider: 'credentials',
        isActive: true,
        promotedBy: 'system',
        promotedAt: new Date()
      });
      
      console.log(`New super admin created: ${superAdminEmail}`);
    }
    
    // Log the bootstrap action
    await AdminAuditLog.create({
      action: 'USER_PROMOTED',
      adminEmail: 'system',
      targetEmail: superAdminEmail,
      role: 'super_admin',
      timestamp: new Date(),
      details: 'Super admin bootstrapped from environment variables'
    });
    
  } catch (error) {
    console.error('Error bootstrapping super admin:', error);
  }
}

/**
 * OPTION 2: First User Auto-Promotion
 * Make the very first user who registers a super admin
 */
export async function checkFirstUserPromotion(userEmail: string): Promise<'super_admin' | 'user'> {
  try {
    await connect();
    
    // Count total users in the system
    const userCount = await User.countDocuments({});
    
    if (userCount === 0) {
      // This is the very first user - make them super admin
      await AdminAuditLog.create({
        action: 'USER_PROMOTED',
        adminEmail: 'system',
        targetEmail: userEmail,
        role: 'super_admin',
        timestamp: new Date(),
        details: 'First user auto-promoted to super admin'
      });
      
      console.log(`First user ${userEmail} auto-promoted to super admin`);
      return 'super_admin';
    }
    
    return 'user';
  } catch (error) {
    console.error('Error checking first user promotion:', error);
    return 'user';
  }
}

/**
 * OPTION 3: CLI Command to Create Super Admin
 * Run this as a script: node scripts/create-super-admin.js email@domain.com
 */
export async function createSuperAdminCLI(email: string, name?: string): Promise<boolean> {
  try {
    await connect();
    
    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      if (user.role === 'super_admin') {
        console.log('User is already a super admin');
        return false;
      }
      
      // Promote existing user
      user.role = 'super_admin';
      user.promotedBy = 'cli-command';
      user.promotedAt = new Date();
      await user.save();
      
      console.log(`User ${email} promoted to super admin`);
    } else {
      // Create new user as super admin
      user = await User.create({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        role: 'super_admin',
        provider: 'credentials',
        isActive: true,
        promotedBy: 'cli-command',
        promotedAt: new Date()
      });
      
      console.log(`New super admin created: ${email}`);
    }
    
    // Log the action
    await AdminAuditLog.create({
      action: 'USER_PROMOTED',
      adminEmail: 'cli-command',
      targetEmail: email,
      role: 'super_admin',
      timestamp: new Date(),
      details: 'Super admin created via CLI command'
    });
    
    return true;
  } catch (error) {
    console.error('Error creating super admin:', error);
    return false;
  }
}