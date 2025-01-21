declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string; // Use string here
      DB_PASSWORD: string;
      DB: string;
      JWT_SECRET: string;
      JWT_SECRET_EXPIRATION: string;
    }
  }
}

export {};
