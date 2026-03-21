import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body as { idToken: string };
    if (!idToken) return next(new AppError('idToken is required', 400));

    const payload = await AuthService.verifyGoogleToken(idToken);
    if (!payload) return next(new AppError('Invalid Google token', 401));

    const user = await AuthService.upsertUserFromGoogle({
      sub: payload.sub,
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture,
    });
    const accessToken = AuthService.issueAccessToken(user.id);

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = (req: AuthRequest, res: Response): void => {
  const { id, email, displayName, role, avatarUrl } = req.user!;
  res.json({ id, email, displayName, role, avatarUrl });
};
