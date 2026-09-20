import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.status === 'banned') {
      res.status(403).json({ success: false, error: 'Your account has been suspended' });
      return;
    }

    // Enforce single mobile device policy for active authenticated mobile requests
    const isMobileApp =
      req.headers['x-client-platform'] === 'phone-app' ||
      req.headers['x-app-platform'] === 'phone-app' ||
      req.headers['x-device-type'] === 'phone';

    const clientDeviceId = (req.headers['x-device-id'] as string)?.trim();

    if (isMobileApp && clientDeviceId && user.activeMobileDeviceId) {
      if (user.activeMobileDeviceId !== clientDeviceId) {
        res.status(403).json({
          success: false,
          error: 'Your mobile session has expired because this account logged in on another phone.',
          code: 'DEVICE_SESSION_TERMINATED',
        });
        return;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  await requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }
    if (req.user.status === 'suspended' || req.user.status === 'banned') {
      res.status(403).json({ success: false, error: 'Admin access has been revoked or suspended' });
      return;
    }
    next();
  });
};

export const requireMasterAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  await requireAdmin(req, res, () => {
    if (!req.user || (req.user.adminRole && req.user.adminRole !== 'master')) {
      res.status(403).json({ success: false, error: 'Master Administrator access required' });
      return;
    }
    next();
  });
};

export const requireAdminPermission = (moduleName: 'deposits' | 'withdrawals' | 'campaigns') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    await requireAdmin(req, res, () => {
      if (!req.user) {
        res.status(403).json({ success: false, error: 'Admin access required' });
        return;
      }

      // Master admin has access to everything
      if (!req.user.adminRole || req.user.adminRole === 'master') {
        next();
        return;
      }

      // Sub-admin must have the specific module in adminPermissions
      const permissions = req.user.adminPermissions || [];
      if (!permissions.includes(moduleName)) {
        res.status(403).json({
          success: false,
          error: `Permission denied: Sub-admin does not have access to the ${moduleName} module`,
        });
        return;
      }

      next();
    });
  };
};
