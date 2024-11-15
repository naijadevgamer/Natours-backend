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
    }
  }
}

export {};
