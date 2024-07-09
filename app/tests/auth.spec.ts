import request from 'supertest';
import prisma from '@/lib/prisma';
import { generateToken, verifyToken } from '@/lib/jwt';

// Replace with your Next.js app URL or server instance
const app = "http://localhost:3000";

describe('Register Endpoint', () => {
  afterAll(async () => {
    // Clean up after tests
    await prisma.user.deleteMany();
    await prisma.organisation.deleteMany();
    await prisma.$disconnect();
  });

  it('should register a user successfully with default organisation', async () => {
    const mockRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      password: 'testPassword',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(mockRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(201);
    const responseBody = response.body;
    expect(responseBody.status).toBe('success');
    expect(responseBody.message).toBe('Registration successful');
    expect(responseBody.data.accessToken).toBeDefined();
    expect(responseBody.data.user.firstName).toEqual('John');
    expect(responseBody.data.user.lastName).toEqual('Doe');
    expect(responseBody.data.user.email).toEqual('john@doe.com');

    // Check default organisation name
    expect(responseBody.data.organisations.name).toEqual("John's Organisation");
    
    // Check if access token is present
    expect(responseBody.data.accessToken).toBeDefined();
  });

  it('should fail if firstName is missing', async () => {
    const mockRequest = {
      lastName: 'Doe',
      email: 'jo@doe.com',
      password: 'testPassword',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(mockRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(422);
    const responseBody = response.body;
    expect(responseBody.errors).toBeDefined();
    expect(responseBody.errors.some((error: { field: string }) => error.field === 'firstName')).toBeTruthy();
  });

  it('should fail if lastName is missing', async () => {
    const mockRequest = {
      firstName: 'John',
      email: 'i@gt.com',
      password: 'testPassword',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(mockRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(422);
    const responseBody = response.body;
    expect(responseBody.errors).toBeDefined();
    expect(responseBody.errors.some((error: { field: string }) => error.field === 'lastName')).toBeTruthy();
  });

  it('should fail if email is missing', async () => {
    const mockRequest = {
      firstName: 'John',
      lastName: 'Doe',
      password: 'testPassword',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(mockRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(422);
    const responseBody = response.body;
    expect(responseBody.errors).toBeDefined();
    expect(responseBody.errors.some((error: { field: string }) => error.field === 'email')).toBeTruthy();
  });

  it('should fail if password is missing', async () => {
    const mockRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'i@t.com',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(mockRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(422);
    const responseBody = response.body;
    expect(responseBody.errors).toBeDefined();
    expect(responseBody.errors.some((error: { field: string }) => error.field === 'password')).toBeTruthy();
  });

  it('should fail if there’s a duplicate email', async () => {
    // Register a user first
    const registerRequest = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@exam.com',
      password: 'testPassword',
    };

    await request(app)
      .post('/auth/register')
      .send(registerRequest)
      .set('Content-Type', 'application/json');

    // Attempt to register with the same email again
    const duplicateRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'jane@exam.com', // Same email as registered user
      password: 'testPassword',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(duplicateRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(422);
    const responseBody = response.body;
    expect(responseBody.message).toBe('Registration unsuccessful Email already exists');

  });
});

describe('Login Endpoint', () => {
     // Clean up after tests
     afterAll(async () => {
      // Clean up after tests
      await prisma.user.deleteMany();
      await prisma.organisation.deleteMany();
      await prisma.$disconnect();
    });
  it('should log the user in successfully', async () => {
    // Register a user first
    const registerRequest = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@exam.com',
      password: 'testPassword',
    };

    await request(app)
      .post('/auth/register')
      .send(registerRequest)
      .set('Content-Type', 'application/json');

    // Attempt to log in with the registered user
    const loginRequest = {
      email: 'jane@exam.com',
      password: 'testPassword',
    };

    const response = await request(app)
      .post('/auth/login')
      .send(loginRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(200);
    const responseBody = response.body;
    expect(responseBody.status).toBe('success');
    expect(responseBody.message).toBe('Login successful');
    expect(responseBody.data.accessToken).toBeDefined();
  });

  it('should fail to log the user in with incorrect credentials', async () => {
    // Attempt to log in with incorrect password
    const loginRequest = {
      email: 'jane@exam.com',
      password: 'wrongPassword',
    };

    const response = await request(app)
      .post('/auth/login')
      .send(loginRequest)
      .set('Content-Type', 'application/json');

    // Verify response
    expect(response.status).toBe(401);
    const responseBody = response.body;
    expect(responseBody.status).toBe('Bad request');
    expect(responseBody.message).toBe('Authentication failed');
  });
});

describe('Token Generation', () => {
  it('should generate a token with correct user details and expiry', () => {
    const userId = 'testUserId';
    const accessToken = generateToken(userId);
    const decodedToken = verifyToken(accessToken);

    // Verify token contents
    expect(decodedToken.userId).toEqual(userId);

    // Ensure token expires in the future (adjust according to your token expiry logic)
    const currentTime = Math.floor(Date.now() / 1000);
    expect(decodedToken.exp).toBeGreaterThan(currentTime);
  });
});
