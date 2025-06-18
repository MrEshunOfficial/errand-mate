// auth.ts - Secure NextAuth configuration with proper admin management

import NextAuth from "next-auth";
import type { NextAuthConfig, Session, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connect } from "./lib/dbconfigue/dbConfigue";
import { User } from "./app/models/auth/authModel";
import { privatePaths, publicPaths } from "./auth.config";
import crypto from "crypto";
import { AdminAuditLog, AdminInvitation } from "./app/models/auth/adminModels";
import { bootstrapSuperAdmin, checkFirstUserPromotion } from "./lib/admin/bootstrap";


const activeSessions = new Map<string, { userId: string; createdAt: Date }>();

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role: string;
      email?: string | null;
      name?: string | null;
      provider?: string | null;
      providerId?: string | null;
    } & DefaultSession["user"];
    sessionId?: string;
  }

  interface User {
    id?: string;
    role: string;
    email?: string | null;
    name?: string | null;
    provider?: string | null;
    providerId?: string | null;
  }
}

interface CustomToken extends JWT {
  id?: string;
  role?: string;
  provider?: string;
  sessionId?: string;
}

async function generateSessionId(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function checkAndGetUserRole(email: string): Promise<string> {
  try {
    await connect();
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return existingUser.role;
    }
    
    // BOOTSTRAP: Check if this should be the first super admin
    const firstUserRole = await checkFirstUserPromotion(email);
    if (firstUserRole === 'super_admin') {
      return 'super_admin';
    }
    
    // Check for valid admin invitation
    const invitation = await AdminInvitation.findOne({ 
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() },
      isActive: true
    });
    
    if (invitation) {
      // Mark invitation as used and log the action
      invitation.isUsed = true;
      invitation.usedAt = new Date();
      await invitation.save();
      
      // Log the invitation usage
      await AdminAuditLog.create({
        action: 'INVITATION_USED',
        targetEmail: email,
        invitedBy: invitation.invitedBy,
        role: invitation.role,
        timestamp: new Date(),
        details: `Admin invitation used for role: ${invitation.role}`
      });
      
      return invitation.role;
    }
    
    // All new users without invitation start as regular users
    return 'user';
    
  } catch (error) {
    console.error('Error checking user role:', error);
    return 'user';
  }
}

// SECURE: Create admin invitation (only existing admins can do this)
export async function createAdminInvitation(
  inviterEmail: string, 
  inviteeEmail: string, 
  role: 'admin' | 'super_admin' = 'admin',
  expirationHours: number = 72,
  ipAddress?: string
): Promise<{ success: boolean; invitationId?: string; error?: string }> {
  try {
    await connect();
    
    // Verify inviter has permission to create invitations
    const inviter = await User.findOne({ email: inviterEmail.toLowerCase() });
    if (!inviter || !['admin', 'super_admin'].includes(inviter.role)) {
      return { success: false, error: 'Insufficient permissions to create invitations' };
    }
    
    // Super admin role can only be assigned by existing super admins
    if (role === 'super_admin' && inviter.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can create super admin invitations' };
    }
    
    // Check if user already exists and has admin role
    const existingUser = await User.findOne({ email: inviteeEmail.toLowerCase() });
    if (existingUser && ['admin', 'super_admin'].includes(existingUser.role)) {
      return { success: false, error: 'User already has admin privileges' };
    }
    
    // Check for existing unused invitation
    const existingInvitation = await AdminInvitation.findOne({
      email: inviteeEmail.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() },
      isActive: true
    });
    
    if (existingInvitation) {
      return { success: false, error: 'Active invitation already exists for this email' };
    }
    
    // Generate secure invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);
    
    // Create invitation
    const invitation = await AdminInvitation.create({
      email: inviteeEmail.toLowerCase(),
      role: role,
      invitedBy: inviterEmail,
      invitationToken: invitationToken,
      expiresAt: expiresAt,
      isUsed: false,
      isActive: true,
      createdAt: new Date()
    });
    
    // Log the invitation creation
    await AdminAuditLog.create({
      action: 'INVITATION_CREATED',
      adminEmail: inviterEmail,
      targetEmail: inviteeEmail,
      role: role,
      timestamp: new Date(),
      ipAddress: ipAddress,
      details: `Admin invitation created for role: ${role}, expires: ${expiresAt.toISOString()}`
    });
    
    return { 
      success: true, 
      invitationId: invitation._id.toString()
    };
    
  } catch (error) {
    console.error('Error creating admin invitation:', error);
    return { success: false, error: 'Failed to create invitation' };
  }
}

// SECURE: Promote existing user to admin (with proper verification)
export async function promoteUserToAdmin(
  adminEmail: string, 
  targetEmail: string, 
  newRole: 'admin' | 'super_admin' = 'admin',
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    // Verify promoter has permission
    const promoter = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!promoter || !['admin', 'super_admin'].includes(promoter.role)) {
      return { success: false, error: 'Insufficient permissions to promote users' };
    }
    
    // Super admin role can only be assigned by existing super admins
    if (newRole === 'super_admin' && promoter.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can promote to super admin' };
    }
    
    // Find target user
    const targetUser = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!targetUser) {
      return { success: false, error: 'Target user not found' };
    }
    
    // Check if user already has the role
    if (targetUser.role === newRole) {
      return { success: false, error: `User already has ${newRole} role` };
    }
    
    // Prevent self-promotion to super admin
    if (adminEmail.toLowerCase() === targetEmail.toLowerCase() && newRole === 'super_admin') {
      return { success: false, error: 'Cannot promote yourself to super admin' };
    }
    
    const oldRole = targetUser.role;
    
    // Update user role
    const updatedUser = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase() },
      { 
        role: newRole,
        updatedAt: new Date(),
        promotedBy: adminEmail,
        promotedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      // Log the promotion
      await AdminAuditLog.create({
        action: 'USER_PROMOTED',
        adminEmail: adminEmail,
        targetEmail: targetEmail,
        role: newRole,
        timestamp: new Date(),
        ipAddress: ipAddress,
        details: `User promoted from ${oldRole} to ${newRole}`
      });
      
      // Invalidate user's sessions to force re-authentication with new role
      await invalidateUserSessions(updatedUser._id.toString());
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to update user role' };
    
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error: 'Failed to promote user' };
  }
}

// SECURE: Demote admin to user (with proper verification and safeguards)
export async function demoteAdminToUser(
  adminEmail: string, 
  targetEmail: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    // Verify demoter has permission
    const demoter = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!demoter || !['admin', 'super_admin'].includes(demoter.role)) {
      return { success: false, error: 'Insufficient permissions to demote users' };
    }
    
    // Find target user
    const targetUser = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!targetUser) {
      return { success: false, error: 'Target user not found' };
    }
    
    // Prevent self-demotion if you're the only super admin
    if (adminEmail.toLowerCase() === targetEmail.toLowerCase()) {
      if (targetUser.role === 'super_admin') {
        const superAdminCount = await User.countDocuments({ role: 'super_admin' });
        if (superAdminCount <= 1) {
          return { success: false, error: 'Cannot demote yourself as the only super admin' };
        }
      }
    }
    
    // Only super admins can demote other super admins
    if (targetUser.role === 'super_admin' && demoter.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can demote super admins' };
    }
    
    // Check if user is already a regular user
    if (targetUser.role === 'user') {
      return { success: false, error: 'User is already a regular user' };
    }
    
    const oldRole = targetUser.role;
    
    // Update user role to user
    const updatedUser = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase() },
      { 
        role: 'user',
        updatedAt: new Date(),
        demotedBy: adminEmail,
        demotedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      // Log the demotion
      await AdminAuditLog.create({
        action: 'USER_DEMOTED',
        adminEmail: adminEmail,
        targetEmail: targetEmail,
        role: 'user',
        timestamp: new Date(),
        ipAddress: ipAddress,
        details: `User demoted from ${oldRole} to user`
      });
      
      // Invalidate user's sessions to force re-authentication with new role
      await invalidateUserSessions(updatedUser._id.toString());
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to update user role' };
    
  } catch (error) {
    console.error('Error demoting admin to user:', error);
    return { success: false, error: 'Failed to demote user' };
  }
}

// Get all admins with detailed information
export async function getAllAdmins() {
  try {
    await connect();
    return await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .select('email name role createdAt promotedBy promotedAt')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}

// Get admin activity audit log
export async function getAdminAuditLog(limit: number = 100) {
  try {
    await connect();
    return await AdminAuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }
}

// Get pending admin invitations
export async function getPendingInvitations() {
  try {
    await connect();
    return await AdminInvitation.find({
      isUsed: false,
      expiresAt: { $gt: new Date() },
      isActive: true
    })
    .select('email role invitedBy createdAt expiresAt')
    .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return [];
  }
}

// Revoke admin invitation
export async function revokeAdminInvitation(
  adminEmail: string, 
  invitationId: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    // Verify revoker has permission
    const revoker = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!revoker || !['admin', 'super_admin'].includes(revoker.role)) {
      return { success: false, error: 'Insufficient permissions to revoke invitations' };
    }
    
    const invitation = await AdminInvitation.findById(invitationId);
    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }
    
    if (invitation.isUsed) {
      return { success: false, error: 'Invitation has already been used' };
    }
    
    // Deactivate invitation
    invitation.isActive = false;
    invitation.revokedBy = adminEmail;
    invitation.revokedAt = new Date();
    await invitation.save();
    
    // Log the revocation
    await AdminAuditLog.create({
      action: 'INVITATION_REVOKED',
      adminEmail: adminEmail,
      targetEmail: invitation.email,
      role: invitation.role,
      timestamp: new Date(),
      ipAddress: ipAddress,
      details: `Admin invitation revoked for ${invitation.email}`
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return { success: false, error: 'Failed to revoke invitation' };
  }
}

export async function invalidateUserSessions(userId: string) {
  const sessionsToRemove: string[] = [];

  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      sessionsToRemove.push(sessionId);
    }
  }

  sessionsToRemove.forEach((sessionId) => {
    activeSessions.delete(sessionId);
  });
}



// Add this to your app startup (e.g., in your main app file or API route)
export async function initializeApp() {
  // Bootstrap super admin from environment variables if needed
  await bootstrapSuperAdmin();
  
  // Initialize admin models cleanup
  const { initializeAdminModels } = await import("./app/models/auth/adminModels");
  initializeAdminModels();
}

// Call this in your app startup
initializeApp().catch(console.error);

function cleanupExpiredSessions() {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000;

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now.getTime() - session.createdAt.getTime() > maxAge) {
      activeSessions.delete(sessionId);
    }
  }
}

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  pages: {
    signIn: "/user/login",
    signOut: "/user/login",
    error: "/user/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          await connect();

          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) {
            throw new Error("User not found");
          }

          if (user.provider && user.providerId && user.provider !== "credentials") {
            throw new Error(
              `This account uses ${user.provider} authentication. Please sign in with ${user.provider}.`
            );
          }

          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            provider: user.provider,
            providerId: user.providerId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      cleanupExpiredSessions();

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.provider = account?.provider;

        const sessionId = await generateSessionId();
        token.sessionId = sessionId;

        activeSessions.set(sessionId, {
          userId: user.id as string,
          createdAt: new Date(),
        });
      }
      if (token.sessionId && !activeSessions.has(token.sessionId as string)) {
        return {};
      }

      return token;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      
      if (isLoggedIn && auth.sessionId && !activeSessions.has(auth.sessionId)) {
        return Response.redirect(new URL("/user/login", nextUrl));
      }

      if (publicPaths.some((p) => path.startsWith(p))) {
        if (isLoggedIn && (path.startsWith("/user/login") || path.startsWith("/user/register"))) {
          // Redirect authenticated users trying to access login/register to profile
          return Response.redirect(new URL("/user/profile", nextUrl));
        }
        return true;
      }
      
      if (privatePaths.some((p) => path.startsWith(p))) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(path);
          return Response.redirect(new URL(`/user/login?callbackUrl=${callbackUrl}`, nextUrl));
        }
        return isLoggedIn;
      }
      
      if (path === "/") {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/user/login", nextUrl));
        }
        return Response.redirect(new URL("/user/profile", nextUrl));
      }
      
      return true;
    },

    async signIn({ user, account }) {
      if (!user?.email) return false;

      try {
        await connect();
        cleanupExpiredSessions();

        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          if (account) {
            const userName = user.name || user.email?.split('@')[0] || 'User';
            
            // SECURE: Get role using the secure helper function
            const userRole = await checkAndGetUserRole(user.email);
            
            dbUser = await User.create({
              email: user.email,
              name: userName,
              provider: account.provider,
              providerId: account.providerAccountId,
              role: userRole,
            });
          } else {
            return false;
          }
        } else {
          if (account) {
            if (dbUser.provider && dbUser.provider !== account.provider && dbUser.provider !== "credentials") {
              throw new Error(
                `This email is already registered with ${dbUser.provider}. Please sign in with ${dbUser.provider}.`
              );
            }
            
            if (!dbUser.provider || !dbUser.providerId) {
              dbUser.providerId = account.providerAccountId;
              dbUser.provider = account.provider;
              await dbUser.save();
            }
          }
        }

        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.provider = dbUser.provider;
        user.providerId = dbUser.providerId;
        user.name = dbUser.name;
        
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async session({ session, token }: { session: Session; token: CustomToken }): Promise<Session> {
      if (!token.email && !token.sub) {
        return session;
      }
      
      if (token.sessionId && !activeSessions.has(token.sessionId)) {
        return {} as Session;
      }

      try {
        await connect();
        const user = await User.findById(token.id);

        if (user && session.user) {
          session.user.id = user._id.toString();
          session.user.role = user.role;
          session.user.email = user.email;
          session.user.name = user.name;
          session.user.provider = user.provider;
          session.user.providerId = user.providerId;
          session.sessionId = token.sessionId;
        } else if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.sessionId = token.sessionId;
        }

        return session;
      } catch {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.sessionId = token.sessionId;
        }
        
        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.includes("signOut") || url.includes("logout")) {
        return `${baseUrl}/user/login`;
      }

      if (url.startsWith("/api/auth/callback/google")) {
        return `${baseUrl}/user/profile`;
      }

      if (url.startsWith("/api/auth/callback")) {
        return `${baseUrl}/user/profile`;
      }
      
      try {
        const parsedUrl = new URL(url);
        const callbackUrl = parsedUrl.searchParams.get("callbackUrl");
        if (callbackUrl) {
          if (callbackUrl.startsWith("/")) {
            return `${baseUrl}${callbackUrl}`;
          } else if (callbackUrl.startsWith(baseUrl)) {
            return callbackUrl;
          }
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
      
      if (url.startsWith("/")) {
        if (url === "/") {
          return `${baseUrl}/user/profile`;
        }
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/user/profile`;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);