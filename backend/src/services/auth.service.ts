import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

const issueAccessToken = (userId: string): string =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });

const upsertUserFromGoogle = async (payload: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}) => {
  const [user] = await User.upsert({
    googleId: payload.sub,
    email: payload.email,
    displayName: payload.name,
    avatarUrl: payload.picture,
    lastLoginAt: new Date(),
  });
  return user;
};

export const AuthService = { verifyGoogleToken, issueAccessToken, upsertUserFromGoogle };
