const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const signatureRouter = require('./signatureRoutes');
const Signature = require('../models/Signature');

const app = express();
app.use(express.json());
app.use('/api/signatures', signatureRouter);

// Set up a mock in-memory database or test connection before testing
beforeAll(async () => {
  // Connect to your local test database or mock server environment here
  const url = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1/signature_test';
  await mongoose.connect(url);
});

// Clear collections and close connection after tests finish
afterAll(async () => {
  await Signature.deleteMany({});
  await mongoose.connection.close();
});

describe('POST /api/signatures', () => {
  
  it('should successfully save or update signature coordinate details', async () => {
    const payload = {
      fieldId: "test_field_123",
      coordinates: { x: 45.5, y: 72.1 },
      signer: "Test Signer",
      status: "pending"
    };

    const res = await request(app)
      .post('/api/signatures')
      .send(payload);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fieldId).toEqual(payload.fieldId);
    expect(res.body.data.coordinates.x).toEqual(payload.coordinates.x);
  });

  it('should reject requests that missing critical data layout fields', async () => {
    const brokenPayload = {
      signer: "Incomplete Signer"
    };

    const res = await request(app)
      .post('/api/signatures')
      .send(brokenPayload);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Missing required fields');
  });

});
