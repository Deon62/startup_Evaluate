import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const UserProfile = () => {
    const { user, logout, updateProfile, changePassword } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await updateProfile(profileForm);
        
        if (result.success) {
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                setShowProfileModal(false);
                setSuccess('');
            }, 1500);
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        
        if (result.success) {
            setSuccess('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setShowPasswordModal(false);
                setSuccess('');
            }, 1500);
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <div className="user-dropdown" ref={dropdownRef}>
                <button 
                    className="user-button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#f8fafc',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minWidth: '200px'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = '#f1f5f9';
                        e.target.style.borderColor = '#cbd5e1';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = '#f8fafc';
                        e.target.style.borderColor = '#e2e8f0';
                    }}
                >
                    <div 
                        className="user-avatar"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '16px'
                        }}
                    >
                        {getInitials(user?.name || 'U')}
                    </div>
                    <div className="user-info" style={{ textAlign: 'left' }}>
                        <div 
                            className="user-name"
                            style={{
                                fontWeight: '600',
                                color: '#1f2937',
                                fontSize: '14px',
                                marginBottom: '2px'
                            }}
                        >
                            {user?.name}
                        </div>
                        <div 
                            className="user-email"
                            style={{
                                color: '#6b7280',
                                fontSize: '12px'
                            }}
                        >
                            {user?.email}
                        </div>
                    </div>
                </button>

                {showDropdown && (
                    <div 
                        className="dropdown-menu"
                        style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: '0',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            minWidth: '200px',
                            zIndex: 100,
                            marginBottom: '8px'
                        }}
                    >
                        <button 
                            className="dropdown-item"
                            onClick={() => {
                                setShowProfileModal(true);
                                setShowDropdown(false);
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px 16px',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                color: '#374151',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                borderRadius: '8px 8px 0 0'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseOut={(e) => e.target.style.background = 'none'}
                        >
                            Profile Settings
                        </button>
                        <button 
                            className="dropdown-item"
                            onClick={() => {
                                setShowPasswordModal(true);
                                setShowDropdown(false);
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px 16px',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                color: '#374151',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseOut={(e) => e.target.style.background = 'none'}
                        >
                            Change Password
                        </button>
                        <div 
                            className="dropdown-divider"
                            style={{
                                height: '1px',
                                background: '#e5e7eb',
                                margin: '4px 0'
                            }}
                        ></div>
                        <button 
                            className="dropdown-item"
                            onClick={handleLogout}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px 16px',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                color: '#374151',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                borderRadius: '0 0 8px 8px'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseOut={(e) => e.target.style.background = 'none'}
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="auth-modal">
                    <div className="auth-modal-content">
                        <div className="auth-header">
                            <h2>Profile Settings</h2>
                            <p>Update your account information</p>
                            <button className="close-button" onClick={() => setShowProfileModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="auth-form">
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="profile-name">Full Name</label>
                                <input
                                    type="text"
                                    id="profile-name"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="profile-email">Email</label>
                                <input
                                    type="email"
                                    id="profile-email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="auth-button primary"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="auth-modal">
                    <div className="auth-modal-content">
                        <div className="auth-header">
                            <h2>Change Password</h2>
                            <p>Update your account password</p>
                            <button className="close-button" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="auth-form">
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="current-password">Current Password</label>
                                <input
                                    type="password"
                                    id="current-password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="new-password">New Password</label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    required
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="auth-button primary"
                                disabled={loading}
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserProfile;
