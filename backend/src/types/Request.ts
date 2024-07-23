/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user: {
        _id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        token: string;
      };
    }
  }
}

// Export the Express namespace directly
export { Express };
