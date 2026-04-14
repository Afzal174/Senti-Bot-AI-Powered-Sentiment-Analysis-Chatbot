import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, registerTokenWithBackend, isNotificationSupported, getNotificationPermission } from '../utils/firebaseMessaging';

const NotificationPermission = ({ username }) => {
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check current permission status
    if (isNotificationSupported()) {
      setPermissionStatus(getNotificationPermission());
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!isNotificationSupported()) {
      setMessage('Notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Request permission and get FCM token
      const token = await requestNotificationPermission();
      
      if (token) {
        setPermissionStatus('granted');
        
        // Register token with backend
        if (username) {
          const registered = await registerTokenWithBackend(token, username);
          if (registered) {
            setMessage('Notifications enabled successfully!');
          } else {
            setMessage('Notifications enabled, but failed to register with server');
          }
        } else {
          setMessage('Notifications enabled!');
        }
      } else {
        setPermissionStatus('denied');
        setMessage('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setMessage('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <span style={{ color: 'green', marginLeft: '8px' }}>✓ Enabled</span>;
      case 'denied':
        return <span style={{ color: 'red', marginLeft: '8px' }}>✗ Denied</span>;
      default:
        return <span style={{ color: 'orange', marginLeft: '8px' }}>○ Not Set</span>;
    }
  };

  if (!isNotificationSupported()) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#666' }}>
          Notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <strong>Push Notifications</strong>
          {getPermissionBadge()}
        </div>
        {permissionStatus !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        )}
      </div>
      
      {message && (
        <p style={{ margin: 0, fontSize: '14px', color: message.includes('successfully') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
      
      {permissionStatus === 'denied' && (
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
          You have denied notification permissions. To enable notifications, please update your browser settings.
        </p>
      )}
    </div>
  );
};

export default NotificationPermission;
