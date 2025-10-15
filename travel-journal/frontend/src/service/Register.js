// Register service for handling API calls
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Store token
    localStorage.setItem('token', data.token);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { registerUser };

