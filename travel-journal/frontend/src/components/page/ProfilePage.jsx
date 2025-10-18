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
import userService from '../../service/User'; // ✅ dùng đúng file API bạn có

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Lấy thông tin người dùng khi component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        navigate('/login');
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Gọi API lấy thông tin /users/me
      const data = await userService.getMyProfile(token);
      setUser(data);
      setEditedUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (err) {
      console.error('Load user error:', err);
      setError(err.message || 'Không thể tải thông tin người dùng');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedUser(user);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser(prev => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        navigate('/login');
        throw new Error('Người dùng chưa đăng nhập');
      }

      // ✅ Upload avatar nếu có file mới
      let avatarUrl = user.profile_picture;
      if (selectedFile) {
        try {
          const uploadResult = await userService.uploadUserAvatar(userId, selectedFile, token);
          avatarUrl = uploadResult.avatar_url;
        } catch (uploadError) {
          console.error('Lỗi upload avatar:', uploadError);
          setError('Upload ảnh thất bại, thử lại sau.');
        }
      }

      // ✅ Cập nhật thông tin người dùng
      const updateData = {
        username: editedUser.username,
        email: editedUser.email,
        profile_picture: avatarUrl
      };

      const updatedUser = await userService.updateUser(userId, updateData);
      setUser(updatedUser);
      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
      setSelectedFile(null);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
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
            <Typography variant="h4">Thông tin cá nhân</Typography>
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

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Avatar */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                src={
                  editedUser && editedUser.profile_picture
                    ? (editedUser.profile_picture.startsWith('data:')
                      ? editedUser.profile_picture
                        : `http://localhost:3000${editedUser.profile_picture}`)
                                                            : ''
                                  }
                                sx={{ width: 120, height: 120, mb: 2 }}
              />
              {isEditing && (
                <Button variant="outlined" component="label">
                  Thay đổi ảnh đại diện
                  <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                </Button>
              )}
            </Box>

            {/* User Info */}
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

