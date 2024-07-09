// types/index.ts
export interface User {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }
  
  export interface Organisation {
    orgId: string;
    name: string;
    description: string;
  }
  
  export interface ValidationError {
    field: string;
    message: string;
  }
  

export interface LoginRequest {
  email: string;
  password: string;
}
