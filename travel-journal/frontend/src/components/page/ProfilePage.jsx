import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch user data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check for auth token
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        navigate('/login');
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Set auth token for API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Try to get user data from localStorage first
      const cachedUserInfo = localStorage.getItem('userInfo');
      if (cachedUserInfo) {
        const userData = JSON.parse(cachedUserInfo);
        setUser(userData);
        setEditedUser(userData);
      }

      // Then fetch fresh data from API using /users/me endpoint
      const response = await api.get('/users/me');
      const userData = response.data;
      
      // Update localStorage and state with fresh data
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      setEditedUser(userData);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin người dùng');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedUser(user); // Reset form to current user data
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser(prev => ({
          ...prev,
          profile_picture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Prepare update data
      const updateData = {
        username: editedUser.username,
        email: editedUser.email
      };

      // If there's a new profile picture, handle the file upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profile_picture', selectedFile);
        
        // First upload the image
        try {
          const uploadResponse = await api.post('/users/me/profile-picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
          updateData.profile_picture = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          // Continue with other updates even if image upload fails
        }
      }

      const updatedUser = await userService.updateUser(user.id, updateData);
      setUser(updatedUser);
      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" gutterBottom>
              Thông tin cá nhân
            </Typography>
            <Button
              variant={isEditing ? "outlined" : "contained"}
              onClick={handleEditToggle}
              color={isEditing ? "error" : "primary"}
            >
              {isEditing ? "Hủy" : "Chỉnh sửa"}
            </Button>
          </Box>

          {/* Messages */}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {/* Profile Content */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Avatar */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                src={editedUser?.profile_picture || user?.profile_picture}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              {isEditing && (
                <Button variant="outlined" component="label">
                  Thay đổi ảnh đại diện
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>
              )}
            </Box>

            {/* User Info Fields */}
            <Stack spacing={2}>
              <TextField
                label="Tên người dùng"
                name="username"
                value={isEditing ? editedUser?.username : user?.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                value={isEditing ? editedUser?.email : user?.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                type="email"
              />
              
              {/* Add more fields as needed */}

              {/* Save Button */}
              {isEditing && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Lưu thay đổi"}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}