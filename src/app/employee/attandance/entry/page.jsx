'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import url from '../../../../../url';

const AttendanceEntryPage = () => {
  // Dashboard states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [profileDropdown, setProfileDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Attendance states
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const [locationPermission, setLocationPermission] = useState('prompt');
  
  // New standardized attendance states
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [workingHours, setWorkingHours] = useState(8);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [breakDuration, setBreakDuration] = useState(60); // minutes
  const [remarks, setRemarks] = useState('');
  const [isLocationBased, setIsLocationBased] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Attendance status options with proper definitions
  const statusOptions = [
    {
      value: 'Present',
      label: '✅ Present',
      description: 'Full day attendance (8+ hours)',
      color: '#52c41a',
      minHours: 8
    },
    {
      value: 'Half Day',
      label: '🕐 Half Day',
      description: 'Partial attendance (4-7 hours)',
      color: '#1890ff',
      minHours: 4
    },
    {
      value: 'Absent',
      label: '❌ Absent',
      description: 'Not present at work',
      color: '#f5222d',
      minHours: 0
    },
    {
      value: 'Late',
      label: '⚠️ Late Arrival',
      description: 'Present but arrived late',
      color: '#faad14',
      minHours: 6
    },
    {
      value: 'Early Exit',
      label: '🚪 Early Exit',
      description: 'Left before scheduled time',
      color: '#fa8c16',
      minHours: 6
    },
    {
      value: 'WFH',
      label: '🏠 Work From Home',
      description: 'Working remotely',
      color: '#722ed1',
      minHours: 8
    },
    {
      value: 'On Leave',
      label: '🌴 On Leave',
      description: 'Approved leave',
      color: '#13c2c2',
      minHours: 0
    },
    {
      value: 'Holiday',
      label: '🎉 Holiday',
      description: 'Company holiday',
      color: '#eb2f96',
      minHours: 0
    }
  ];

  // Dashboard useEffects
  useEffect(() => {
    const token = localStorage.getItem('token');
    const employeeData = localStorage.getItem('employee');
    
    if (!token) {
      router.push('/employee/login');
      return;
    }

    if (employeeData) {
      setEmployee(JSON.parse(employeeData));
    }
  }, [router]);

  // Time and location useEffects
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation && isLocationBased) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.log('Location access denied:', error);
          setLocationPermission('denied');
          setLocation({
            latitude: null,
            longitude: null,
            error: error.message
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, [isLocationBased]);

  useEffect(() => {
    fetchTodayAttendance();
    // Set default times
    const now = new Date();
    const defaultClockIn = new Date();
    defaultClockIn.setHours(9, 0, 0, 0);
    const defaultClockOut = new Date();
    defaultClockOut.setHours(17, 0, 0, 0);
    
    if (!clockInTime) setClockInTime(defaultClockIn.toTimeString().slice(0, 5));
    if (!clockOutTime) setClockOutTime(defaultClockOut.toTimeString().slice(0, 5));
  }, []);

  // Navigation config
  const navigation = [
    {
      name: 'Dashboard',
      icon: '📊',
      href: '/dashboard',
      current: pathname === '/employee/dashboard',
    },
    {
      name: 'Attandances',
      icon: '📊',
      href: '/employee/attandance/entry',
      current: pathname === '/employee/attandance/entry',
      hasDropdown: true,
      subItems: [
        { name: 'Attandance Entry', href: '/employee/attandance/entry', icon: '📊' },
        { name: 'Attandance Report', href: '/employee/attandance/report', icon: '📊' }
      ]
    },
  ];

  // Functions
  const toggleDropdown = (itemName) => {
    setDropdownOpen(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    router.push('/employee/login');
  };

  const showToastMessage = (message, type = 'success') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => {
      setShowToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      const response = await fetch(`${url.API_URL}/employees/attandances/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data.data);
        
        // Pre-populate form if attendance already exists
        if (data.data) {
          setAttendanceStatus(data.data.status || 'Present');
          if (data.data.clockIn?.time) {
            const clockIn = new Date(data.data.clockIn.time);
            setClockInTime(clockIn.toTimeString().slice(0, 5));
          }
          if (data.data.clockOut?.time) {
            const clockOut = new Date(data.data.clockOut.time);
            setClockOutTime(clockOut.toTimeString().slice(0, 5));
          }
          if (data.data.workingHours?.total) {
            setWorkingHours(data.data.workingHours.total);
          }
          if (data.data.remarks) {
            setRemarks(data.data.remarks);
          }
        }
      } else if (response.status === 401) {
        showToastMessage('Session expired. Please login again.', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        window.location.href = '/employee/login';
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showToastMessage('Network error. Please check your connection.', 'error');
    }
  };

  const calculateWorkingHours = () => {
    if (!clockInTime || !clockOutTime) return 0;
    
    const [inHours, inMinutes] = clockInTime.split(':').map(Number);
    const [outHours, outMinutes] = clockOutTime.split(':').map(Number);
    
    const clockInMinutes = inHours * 60 + inMinutes;
    const clockOutMinutes = outHours * 60 + outMinutes;
    
    let totalMinutes = clockOutMinutes - clockInMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle next day
    
    // Subtract break duration
    totalMinutes -= breakDuration;
    
    return Math.max(0, totalMinutes / 60);
  };

  const handleStatusChange = (newStatus) => {
    setAttendanceStatus(newStatus);
    
    // Auto-adjust working hours based on status
    const statusConfig = statusOptions.find(opt => opt.value === newStatus);
    if (statusConfig) {
      setWorkingHours(statusConfig.minHours);
      
      // Auto-set times for certain statuses
      if (newStatus === 'Absent' || newStatus === 'On Leave' || newStatus === 'Holiday') {
        setClockInTime('');
        setClockOutTime('');
        setWorkingHours(0);
      } else if (newStatus === 'Half Day') {
        const now = new Date();
        const halfDayOut = new Date();
        halfDayOut.setHours(13, 0, 0, 0); // 1 PM for half day
        setClockOutTime(halfDayOut.toTimeString().slice(0, 5));
      }
    }
  };

  const validateAttendanceEntry = () => {
    const errors = [];
    
    if (['Present', 'Half Day', 'Late', 'Early Exit', 'WFH'].includes(attendanceStatus)) {
      if (!clockInTime) errors.push('Clock in time is required');
      if (!clockOutTime) errors.push('Clock out time is required');
      
      const calculatedHours = calculateWorkingHours();
      const statusConfig = statusOptions.find(opt => opt.value === attendanceStatus);
      
      if (calculatedHours < statusConfig.minHours && attendanceStatus !== 'Half Day') {
        errors.push(`Minimum ${statusConfig.minHours} hours required for ${attendanceStatus} status`);
      }
    }
    
    if (isLocationBased && !location?.latitude) {
      errors.push('Location is required for attendance marking');
    }
    
    return errors;
  };

  const handleMarkAttendance = async () => {
    const validationErrors = validateAttendanceEntry();
    if (validationErrors.length > 0) {
      showToastMessage(validationErrors[0], 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      const attendanceData = {
        status: attendanceStatus,
        clockIn: clockInTime ? {
          time: new Date(`${new Date().toDateString()} ${clockInTime}`).toISOString(),
          method: 'Web',
          device: navigator.userAgent
        } : null,
        clockOut: clockOutTime ? {
          time: new Date(`${new Date().toDateString()} ${clockOutTime}`).toISOString(),
          method: 'Web',
          device: navigator.userAgent
        } : null,
        workingHours: {
          total: calculateWorkingHours(),
          expected: statusOptions.find(opt => opt.value === attendanceStatus)?.minHours || 8,
          overtime: Math.max(0, calculateWorkingHours() - 8)
        },
        breakDuration,
        remarks,
        location: isLocationBased ? location : null,
        attendanceDate: new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`${url.API_URL}/employees/attandances/mark-attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      if (response.ok) {
        const data = await response.json();
        showToastMessage('Attendance marked successfully!');
        fetchTodayAttendance();
        
        // Show additional info
        const calculatedHours = calculateWorkingHours();
        setTimeout(() => {
          showToastMessage(`Status: ${attendanceStatus}, Hours: ${calculatedHours.toFixed(2)}`, 'success');
        }, 1000);
      } else {
        const error = await response.json();
        showToastMessage(error.error || 'Failed to mark attendance', 'error');
      }
    } catch (error) {
      showToastMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatus = () => {
    return todayAttendance?.status || 'Not Marked';
  };

  const getStatusColor = (status) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return statusConfig?.color || '#d9d9d9';
  };

  if (!employee) {
    return (
      <div className="luxury-loading">
        <div className="loading-orb"></div>
        <style jsx>{`
          .luxury-loading {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .loading-orb {
            width: 80px;
            height: 80px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: luxurySpin 1.5s ease-in-out infinite;
            margin-bottom: 24px;
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
          }
          @keyframes luxurySpin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="luxury-dashboard">
      {/* Toast Notification */}
      {showToast.show && (
        <div className={`toast ${showToast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {showToast.type === 'success' && '✓'}
              {showToast.type === 'error' && '⚠'}
              {showToast.type === 'warning' && '⚠'}
            </span>
            <span className="toast-message">{showToast.message}</span>
          </div>
        </div>
      )}

      {/* Premium Sidebar */}
      <aside className={`luxury-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-content">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-container">
              <div className="logo-icon">🚀</div>
              {!sidebarCollapsed && (
                <div className="logo-text">
                  <h1>SkElectricks</h1>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav-section">
            {navigation.map((item) => (
              <div key={item.name} className="nav-group">
                <div 
                  className={`nav-item ${item.current ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    if (item.hasDropdown) {
                      toggleDropdown(item.name);
                    } else {
                      router.push(item.href);
                    }
                  }}
                >
                  <div className="nav-item-content">
                    <span className="nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="nav-text">{item.name}</span>
                        {item.hasDropdown && (
                          <span className={`dropdown-arrow ${dropdownOpen[item.name] ? 'open' : ''}`}>
                            ▼
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {hoveredItem === item.name && (
                    <div className="nav-glow"></div>
                  )}
                </div>

                {/* Dropdown Menu */}
                {item.hasDropdown && dropdownOpen[item.name] && !sidebarCollapsed && (
                  <div className="dropdown-menu">
                    {item.subItems.map((subItem) => (
                      <div 
                        key={subItem.name}
                        className="dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(subItem.href);
                        }}
                      >
                        <span className="dropdown-icon">{subItem.icon}</span>
                        <span className="dropdown-text">{subItem.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="user-section">
              <div className="user-avatar">
                <span>{employee.employeeName.charAt(0).toUpperCase()}</span>
                <div className="status-indicator"></div>
              </div>
              {!sidebarCollapsed && (
                <div className="user-info">
                  <p className="user-name">{employee.employeeName}</p>
                  <p className="user-role">{employee.employeeType}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button 
          className="collapse-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <span className={`toggle-icon ${sidebarCollapsed ? 'collapsed' : ''}`}>◀</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Premium Header */}
        <header className="luxury-header">
          <div className="header-left">
            <div className="breadcrumb">
              <span className="breadcrumb-home">🏠</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Attendance Entry</span>
            </div>
          </div>

          <div className="header-right">
            {/* Search */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search anything..."
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>

            {/* Notifications */}
            <div className="notification-center">
              <button className="notification-btn">
                <span className="notification-icon">🔔</span>
                <span className="notification-badge">5</span>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="profile-section">
              <button 
                className="profile-trigger"
                onClick={() => setProfileDropdown(!profileDropdown)}
              >
                <div className="profile-avatar-header">
                  {employee.employeeName.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info-header">
                  <span className="profile-name-header">{employee.employeeName}</span>
                </div>
                <span className="profile-arrow">▼</span>
              </button>

              {profileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-section">
                    <div className="dropdown-option">
                      <span className="option-icon">👤</span>
                      <span>My Profile</span>
                    </div>
                    <div className="dropdown-option">
                      <span className="option-icon">⚙️</span>
                      <span>Preferences</span>
                    </div>
                    <div className="dropdown-option">
                      <span className="option-icon">🎨</span>
                      <span>Appearance</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-section">
                    <div className="dropdown-option" onClick={handleLogout}>
                      <span className="option-icon">🚪</span>
                      <span>Sign Out</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container - STANDARDIZED ATTENDANCE ENTRY */}
        <div className="content-container">
          <div className="attendance-entry">
            {/* Employee Info Header */}
            <div className="employee-info-header">
              <div className="employee-details">
                <h2>Attendance Entry - {employee.employeeName}</h2>
                <p>{employee.employeeCode} • {employee.selectDepartment || 'N/A'} • {currentTime.toLocaleDateString()}</p>
              </div>
              <div className="current-status">
                <div 
                  className="status-indicator-large" 
                  style={{ backgroundColor: getStatusColor(getCurrentStatus()) }}
                >
                  <span className="status-text">{getCurrentStatus()}</span>
                </div>
              </div>
            </div>

            {/* Current Time Display */}
            <div className="time-display-card">
              <div className="time-card-content">
                <div className="current-time">
                  <div className="clock-icon">🕒</div>
                  <div className="time-info">
                    <div className="current-time-text">
                      {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                    </div>
                    <div className="current-date-text">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="working-hours-summary">
                  <div className="hours-text">
                    <span className="hours-label">Expected Hours:</span>
                    <span className="hours-value">{workingHours} hrs</span>
                  </div>
                  <div className="hours-text">
                    <span className="hours-label">Calculated:</span>
                    <span className="hours-value">{calculateWorkingHours().toFixed(2)} hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standardized Attendance Form */}
            <div className="attendance-form-card">
              <div className="card-header">
                <h3>📝 Mark Today's Attendance</h3>
                <p>Select appropriate status and provide timing details</p>
              </div>
              <div className="card-content">
                {/* Status Selection Grid */}
                <div className="form-section">
                  <label className="section-label">Attendance Status</label>
                  <div className="status-grid">
                    {statusOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`status-option ${attendanceStatus === option.value ? 'selected' : ''}`}
                        onClick={() => handleStatusChange(option.value)}
                        style={{ borderColor: attendanceStatus === option.value ? option.color : '#e5e7eb' }}
                      >
                        <div className="status-option-header">
                          <span className="status-emoji">{option.label.split(' ')[0]}</span>
                          <span className="status-name">{option.label.substring(2)}</span>
                        </div>
                        <div className="status-description">{option.description}</div>
                        {option.minHours > 0 && (
                          <div className="status-hours">Min: {option.minHours}h</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Entry Section - Only show for relevant statuses */}
                {['Present', 'Half Day', 'Late', 'Early Exit', 'WFH'].includes(attendanceStatus) && (
                  <div className="form-section">
                    <label className="section-label">Working Hours</label>
                    <div className="time-inputs-grid">
                      <div className="input-group">
                        <label>Clock In Time</label>
                        <input
                          type="time"
                          value={clockInTime}
                          onChange={(e) => setClockInTime(e.target.value)}
                          className="time-input"
                        />
                      </div>
                      <div className="input-group">
                        <label>Clock Out Time</label>
                        <input
                          type="time"
                          value={clockOutTime}
                          onChange={(e) => setClockOutTime(e.target.value)}
                          className="time-input"
                        />
                      </div>
                      <div className="input-group">
                        <label>Break Duration (minutes)</label>
                        <input
                          type="number"
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(Number(e.target.value))}
                          className="number-input"
                          min="0"
                          max="480"
                        />
                      </div>
                      <div className="input-group calculated-hours">
                        <label>Total Working Hours</label>
                        <div className="hours-display">
                          {calculateWorkingHours().toFixed(2)} hours
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Options */}
                <div className="form-section">
                  <div className="advanced-options-header">
                    <button
                      type="button"
                      className="toggle-advanced"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      ⚙️ Advanced Options
                      <span className={`arrow ${showAdvancedOptions ? 'open' : ''}`}>▼</span>
                    </button>
                  </div>
                  
                  {showAdvancedOptions && (
                    <div className="advanced-options">
                      <div className="option-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={isLocationBased}
                            onChange={(e) => setIsLocationBased(e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          Enable Location Tracking
                        </label>
                        {isLocationBased && locationPermission === 'granted' && (
                          <div className="location-info">
                            📍 Location: {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
                          </div>
                        )}
                      </div>
                      
                      <div className="input-group full-width">
                        <label>Remarks/Notes (Optional)</label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Add any additional notes about today's attendance..."
                          className="remarks-textarea"
                          rows="3"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="action-section">
                  <button
                    className={`mark-attendance-btn ${loading ? 'loading' : ''}`}
                    onClick={handleMarkAttendance}
                    disabled={loading || (todayAttendance && todayAttendance.status)}
                  >
                    <span className="btn-icon">📝</span>
                    {loading ? 'Marking Attendance...' : 'Mark Attendance'}
                  </button>
                  
                  {todayAttendance && todayAttendance.status && (
                    <button
                      className="update-attendance-btn"
                      onClick={handleMarkAttendance}
                      disabled={loading}
                    >
                      <span className="btn-icon">🔄</span>
                      Update Attendance
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Summary - Enhanced */}
            {todayAttendance && (
              <div className="summary-card">
                <div className="card-header">
                  <h3>📊 Today's Attendance Summary</h3>
                </div>
                <div className="card-content">
                  <div className="summary-grid-enhanced">
                    <div className="stat-card-enhanced">
                      <div className="stat-icon-enhanced">📅</div>
                      <div className="stat-info-enhanced">
                        <div className="stat-label-enhanced">Date</div>
                        <div className="stat-value-enhanced">
                          {new Date(todayAttendance.attendanceDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-card-enhanced">
                      <div className="stat-icon-enhanced" style={{ backgroundColor: getStatusColor(todayAttendance.status) }}>
                        {statusOptions.find(opt => opt.value === todayAttendance.status)?.label.split(' ')[0] || '📊'}
                      </div>
                      <div className="stat-info-enhanced">
                        <div className="stat-label-enhanced">Status</div>
                        <div className="stat-value-enhanced">{todayAttendance.status}</div>
                      </div>
                    </div>
                    
                    {todayAttendance.clockIn?.time && (
                      <div className="stat-card-enhanced">
                        <div className="stat-icon-enhanced">🕐</div>
                        <div className="stat-info-enhanced">
                          <div className="stat-label-enhanced">Clock In</div>
                          <div className="stat-value-enhanced">
                            {new Date(todayAttendance.clockIn.time).toLocaleTimeString('en-US', { hour12: false })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {todayAttendance.clockOut?.time && (
                      <div className="stat-card-enhanced">
                        <div className="stat-icon-enhanced">🕕</div>
                        <div className="stat-info-enhanced">
                          <div className="stat-label-enhanced">Clock Out</div>
                          <div className="stat-value-enhanced">
                            {new Date(todayAttendance.clockOut.time).toLocaleTimeString('en-US', { hour12: false })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="stat-card-enhanced">
                      <div className="stat-icon-enhanced">⏰</div>
                      <div className="stat-info-enhanced">
                        <div className="stat-label-enhanced">Working Hours</div>
                        <div className="stat-value-enhanced">
                          {(todayAttendance.workingHours?.total || 0).toFixed(2)}h
                        </div>
                        {todayAttendance.workingHours?.overtime > 0 && (
                          <div className="stat-bonus">+{todayAttendance.workingHours.overtime.toFixed(2)} OT</div>
                        )}
                      </div>
                    </div>

                    {todayAttendance.remarks && (
                      <div className="stat-card-enhanced full-width">
                        <div className="stat-icon-enhanced">💬</div>
                        <div className="stat-info-enhanced">
                          <div className="stat-label-enhanced">Remarks</div>
                          <div className="stat-value-enhanced remarks">{todayAttendance.remarks}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .luxury-dashboard {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
        }

        /* Toast Notification */
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .toast.success {
          background: linear-gradient(135deg, #52c41a, #73d13d);
        }

        .toast.error {
          background: linear-gradient(135deg, #f5222d, #ff4d4f);
        }

        .toast.warning {
          background: linear-gradient(135deg, #faad14, #ffc53d);
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* =============== PREMIUM SIDEBAR =============== */
        .luxury-sidebar {
          width: 320px;
          background: linear-gradient(180deg, 
            rgba(30, 41, 59, 0.95) 0%, 
            rgba(51, 65, 85, 0.95) 50%,
            rgba(30, 41, 59, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          position: fixed;
          height: 100vh;
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .luxury-sidebar.collapsed {
          width: 80px;
        }

        .sidebar-content {
          padding: 32px 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* Logo Section */
        .logo-section {
          margin-bottom: 48px;
          position: relative;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .logo-text h1 {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Navigation */
        .nav-section {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .nav-group {
          margin-bottom: 8px;
        }

        .nav-item {
          position: relative;
          cursor: pointer;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .nav-item-content {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          position: relative;
          z-index: 2;
        }

        .nav-icon {
          font-size: 20px;
          width: 24px;
          margin-right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-text {
          flex: 1;
          font-weight: 500;
          color: #e2e8f0;
          font-size: 14px;
        }

        .dropdown-arrow {
          font-size: 10px;
          color: #94a3b8;
          transition: transform 0.3s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .nav-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
          pointer-events: none;
          animation: pulseGlow 2s infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .dropdown-menu {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          margin: 8px 0 0 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: dropdownSlide 0.3s ease-out;
        }

        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          margin: 4px;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .dropdown-icon {
          font-size: 16px;
          margin-right: 12px;
          width: 20px;
          text-align: center;
        }

        .dropdown-text {
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 500;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
          margin-top: auto;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          position: relative;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .user-role {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .collapse-toggle {
          position: absolute;
          right: -15px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          z-index: 1001;
        }

        .toggle-icon {
          font-size: 12px;
          transition: transform 0.3s ease;
        }

        .toggle-icon.collapsed {
          transform: rotate(180deg);
        }

        /* =============== MAIN CONTENT =============== */
        .main-content {
          flex: 1;
          margin-left: 320px;
          transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .luxury-sidebar.collapsed + .main-content {
          margin-left: 80px;
        }

        /* Premium Header */
        .luxury-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748b;
        }

        .breadcrumb-current {
          font-weight: 600;
          color: #1e293b;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 280px;
          padding: 12px 16px 12px 48px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 24px;
          font-size: 14px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .search-btn {
          position: absolute;
          left: 16px;
          background: none;
          border: none;
          font-size: 16px;
          color: #64748b;
          cursor: pointer;
        }

        .notification-center {
          position: relative;
        }

        .notification-btn {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          backdrop-filter: blur(10px);
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          animation: badgePulse 2s infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .profile-section {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 24px;
          padding: 8px 16px 8px 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .profile-avatar-header {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .profile-info-header {
          display: flex;
          flex-direction: column;
        }

        .profile-name-header {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          width: 220px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          animation: dropdownFade 0.3s ease-out;
          z-index: 1000;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dropdown-section {
          padding: 8px;
        }

        .dropdown-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #374151;
        }

        .dropdown-option:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateX(4px);
        }

        .option-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 8px 0;
        }

        /* Content Container */
        .content-container {
          flex: 1;
          padding: 32px;
          background: rgba(248, 250, 252, 0.5);
          min-height: calc(100vh - 84px);
        }

        /* =============== STANDARDIZED ATTENDANCE ENTRY STYLES =============== */
        .attendance-entry {
          max-width: 1200px;
          margin: 0 auto;
        }

        .employee-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .employee-details h2 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 24px;
          font-weight: 700;
        }

        .employee-details p {
          margin: 0;
          color: #64748b;
          font-size: 16px;
        }

        .current-status {
          display: flex;
          align-items: center;
        }

        .status-indicator-large {
          padding: 12px 24px;
          border-radius: 24px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .time-display-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          color: white;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .time-card-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }

        .current-time {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .clock-icon {
          font-size: 32px;
        }

        .current-time-text {
          font-size: 32px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          margin-bottom: 4px;
        }

        .current-date-text {
          font-size: 14px;
          opacity: 0.9;
        }

        .working-hours-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hours-text {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .hours-label {
          font-size: 14px;
          opacity: 0.8;
        }

        .hours-value {
          font-weight: 600;
        }

        .attendance-form-card,
        .summary-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
        }

        .card-header {
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 24px;
        }

        .card-header h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .card-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .card-content {
          padding: 0 24px 24px 24px;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .section-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        /* Status Selection Grid */
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .status-option {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .status-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .status-option.selected {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .status-option-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .status-emoji {
          font-size: 20px;
        }

        .status-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }

        .status-description {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .status-hours {
          font-size: 11px;
          color: #059669;
          font-weight: 500;
        }

        /* Time Inputs */
        .time-inputs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .time-input,
        .number-input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: all 0.3s ease;
        }

        .time-input:focus,
        .number-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .calculated-hours {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hours-display {
          padding: 12px 16px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 8px;
          font-weight: 600;
          color: #0369a1;
          font-size: 16px;
          text-align: center;
        }

        /* Advanced Options */
        .advanced-options-header {
          margin-bottom: 16px;
        }

        .toggle-advanced {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: #667eea;
          cursor: pointer;
          padding: 8px 0;
        }

        .toggle-advanced .arrow {
          font-size: 10px;
          transition: transform 0.3s ease;
        }

        .toggle-advanced .arrow.open {
          transform: rotate(180deg);
        }

        .advanced-options {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: #f8fafc;
        }

        .option-group {
          margin-bottom: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          position: relative;
          transition: all 0.3s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: #667eea;
          border-color: #667eea;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .location-info {
          margin-top: 8px;
          font-size: 12px;
          color: #059669;
          font-family: monospace;
        }

        .input-group.full-width {
          grid-column: 1 / -1;
        }

        .remarks-textarea {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .remarks-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Action Buttons */
        .action-section {
          display: flex;
          gap: 16px;
          justify-content: center;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
        }

        .mark-attendance-btn,
        .update-attendance-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .mark-attendance-btn {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .update-attendance-btn {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .mark-attendance-btn:hover:not(:disabled),
        .update-attendance-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .mark-attendance-btn:disabled,
        .update-attendance-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .mark-attendance-btn.loading {
          background: #9ca3af;
        }

        /* Enhanced Summary */
        .summary-grid-enhanced {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card-enhanced {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .stat-card-enhanced.full-width {
          grid-column: 1 / -1;
        }

        .stat-icon-enhanced {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          flex-shrink: 0;
        }

        .stat-info-enhanced {
          flex: 1;
        }

        .stat-label-enhanced {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .stat-value-enhanced {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .stat-value-enhanced.remarks {
          font-size: 14px;
          font-weight: 400;
          line-height: 1.5;
        }

        .stat-bonus {
          font-size: 11px;
          color: #059669;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .content-container {
            padding: 16px;
          }

          .time-card-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .current-time-text {
            font-size: 24px;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .time-inputs-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid-enhanced {
            grid-template-columns: 1fr;
          }

          .employee-info-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .action-section {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceEntryPage;
