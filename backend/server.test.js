const axios = require('axios'); // Use axios for making HTTP requests

describe('Backend API Tests', () => {
  const baseURL = 'http://localhost:5000'; // URL for the running server

  it('should send a verification code and return success message', async () => {
    const response = await axios.post(`${baseURL}/api/sendVerificationCode`, {
      email: 'cop4331c@yopmail.com',
    });

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Verification code sent successfully.');
  });

  it('should return an error if the email is invalid', async () => {
    const response = await axios.post(`${baseURL}/api/sendVerificationCode`, {
      email: '',
    }).catch((err) => err.response); // Catch errors from the server

    expect(response.status).toBe(500);
    expect(response.data.error).toMatch(/Failed to send verification code/);
  });
});