'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import url from '../../../../../url';

const AttendanceReportPage = () => {
  // Dashboard states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [profileDropdown, setProfileDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Report states
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'All',
    employeeId: 'All'
  });
  const [employees, setEmployees] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [chartData, setChartData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

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

  useEffect(() => {
    fetchReportData();
    fetchEmployees();
  }, [filters]);

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
      current: pathname.startsWith('/employee/attandance'),
      hasDropdown: true,
      subItems: [
        { name: 'Attandance Entry', href: '/employee/attandance/entry', icon: '📊' },
        { name: 'Attandance Report', href: '/employee/attandance/report', icon: '📊' }
      ]
    },
  ];

  // Dashboard functions
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

  // Report functions
  const showToastMessage = (message, type = 'success') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => {
      setShowToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.status !== 'All' && { status: filters.status }),
        ...(filters.employeeId !== 'All' && { employeeId: filters.employeeId }),
        page: currentPage,
        limit: itemsPerPage
      });

      const response = await fetch(`${url.API_URL}/employees/attandances/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
        setSummaryStats(data.data.summary || {});
        
        // Process data for charts
        processChartData(data.data.attendance || []);
      } else if (response.status === 401) {
        showToastMessage('Session expired. Please login again.', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        window.location.href = '/employee/login';
      } else {
        const error = await response.json();
        showToastMessage(error.error || 'Failed to fetch report data', 'error');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      showToastMessage('Network error. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url.API_URL}/employees?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const processChartData = (attendanceData) => {
    // Process attendance data for different chart types
    const statusCounts = {};
    const dailyAttendance = {};
    const departmentStats = {};

    attendanceData.forEach(record => {
      // Status distribution
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;

      // Daily attendance trends
      const date = new Date(record.attendanceDate).toLocaleDateString();
      if (!dailyAttendance[date]) {
        dailyAttendance[date] = { present: 0, absent: 0, late: 0 };
      }
      
      if (record.status === 'Present') dailyAttendance[date].present++;
      else if (record.status === 'Absent') dailyAttendance[date].absent++;
      else if (record.status === 'Late') dailyAttendance[date].late++;

      // Department statistics
      const dept = record.department || 'N/A';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { present: 0, absent: 0, total: 0 };
      }
      departmentStats[dept].total++;
      if (record.status === 'Present' || record.status === 'Late') {
        departmentStats[dept].present++;
      } else {
        departmentStats[dept].absent++;
      }
    });

    setChartData({
      statusCounts,
      dailyAttendance,
      departmentStats
    });
  };

  const handleExportReport = async (format = 'csv') => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format,
        ...(filters.status !== 'All' && { status: filters.status }),
        ...(filters.employeeId !== 'All' && { employeeId: filters.employeeId })
      });

      const response = await fetch(`${url.API_URL}/employees/attandances/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `attendance-report-${filters.startDate}-to-${filters.endDate}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          console.log('Export data:', data);
        }
        showToastMessage('Report exported successfully!');
      } else {
        showToastMessage('Failed to export report', 'error');
      }
    } catch (error) {
      showToastMessage('Export failed', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Helper functions
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Present': '#52c41a',
      'Late': '#faad14',
      'Absent': '#f5222d',
      'Half Day': '#1890ff',
      'On Break': '#722ed1',
      'Holiday': '#13c2c2'
    };
    return colors[status] || '#d9d9d9';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Get unique departments from employees
  const getUniqueDepartments = () => {
    const departments = employees
      .map(emp => emp.selectDepartment)
      .filter(dept => dept && dept.trim() !== '')
      .filter((dept, index, arr) => arr.indexOf(dept) === index);
    return departments;
  };

  // Pagination
  const totalPages = reportData?.pagination?.total || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, reportData?.attendance?.length || 0);

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
                        className={`dropdown-item ${pathname === subItem.href ? 'active' : ''}`}
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
              <span className="breadcrumb-current">Attendance Report</span>
            </div>
          </div>

          <div className="header-right">
            {/* Search */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search reports..."
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

        {/* Content Container - ATTENDANCE REPORT CONTENT */}
        <div className="content-container">
          <div className="report-container">
            {/* Report Header */}
            <div className="report-header">
              <div className="report-title">
                <h1>📊 Attendance Analytics</h1>
                <p>Comprehensive attendance insights and reporting dashboard</p>
              </div>
              <div className="export-actions">
                <button 
                  className="export-btn csv"
                  onClick={() => handleExportReport('csv')}
                  disabled={exportLoading}
                >
                  {exportLoading ? '⏳' : '📊'} Export CSV
                </button>
                <button 
                  className="export-btn pdf"
                  onClick={() => handleExportReport('pdf')}
                  disabled={exportLoading}
                >
                  {exportLoading ? '⏳' : '📄'} Export PDF
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="filters-card">
              <div className="card-header">
                <h3>🔍 Report Filters</h3>
              </div>
              <div className="filters-content">
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="filter-input"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="filter-input"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="filter-select"
                    >
                      <option value="All">All Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Employee</label>
                    <select
                      value={filters.employeeId}
                      onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="filter-select"
                    >
                      <option value="All">All Employees</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.employeeName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>&nbsp;</label>
                    <button 
                      className="apply-filters-btn"
                      onClick={fetchReportData}
                      disabled={loading}
                    >
                      {loading ? '🔄' : '🔍'} Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="summary-stats">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{summaryStats.totalDays || 0}</div>
                  <div className="stat-label">Total Records</div>
                </div>
              </div>
              
              <div className="stat-card present">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{summaryStats.presentDays || 0}</div>
                  <div className="stat-label">Present Days</div>
                  <div className="stat-percentage">
                    {summaryStats.totalDays ? Math.round((summaryStats.presentDays / summaryStats.totalDays) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="stat-card absent">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <div className="stat-value">{summaryStats.absentDays || 0}</div>
                  <div className="stat-label">Absent Days</div>
                  <div className="stat-percentage">
                    {summaryStats.totalDays ? Math.round((summaryStats.absentDays / summaryStats.totalDays) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="stat-card late">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <div className="stat-value">{summaryStats.lateDays || 0}</div>
                  <div className="stat-label">Late Days</div>
                  <div className="stat-percentage">
                    {summaryStats.totalDays ? Math.round((summaryStats.lateDays / summaryStats.totalDays) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="stat-card hours">
                <div className="stat-icon">⏰</div>
                <div className="stat-content">
                  <div className="stat-value">{(summaryStats.totalHours || 0).toFixed(1)}h</div>
                  <div className="stat-label">Total Hours</div>
                  <div className="stat-percentage">
                    Avg: {summaryStats.totalDays ? ((summaryStats.totalHours || 0) / summaryStats.totalDays).toFixed(1) : 0}h/day
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <div className="chart-card">
                <div className="card-header">
                  <h3>📈 Attendance Trends</h3>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-info">
                    <p>📊 Daily attendance visualization would appear here</p>
                    <p>Integration with Chart.js or similar library recommended</p>
                  </div>
                </div>
              </div>
              
              <div className="chart-card">
                <div className="card-header">
                  <h3>🥧 Status Distribution</h3>
                </div>
                <div className="status-distribution">
                  {Object.entries(chartData.statusCounts || {}).map(([status, count]) => (
                    <div key={status} className="status-item">
                      <div 
                        className="status-bar" 
                        style={{ 
                          backgroundColor: getStatusColor(status),
                          width: `${(count / Math.max(...Object.values(chartData.statusCounts || {}))) * 100}%`
                        }}
                      ></div>
                      <div className="status-info">
                        <span className="status-name">{status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Statistics - Using Dynamic Departments from Employees */}
            {getUniqueDepartments().length > 0 && (
              <div className="department-stats-card">
                <div className="card-header">
                  <h3>🏢 Department Performance</h3>
                </div>
                <div className="department-stats-content">
                  {getUniqueDepartments().map((dept) => {
                    const deptStats = chartData.departmentStats?.[dept];
                    const attendanceRate = deptStats ? Math.round((deptStats.present / deptStats.total) * 100) : 0;
                    
                    return (
                      <div key={dept} className="department-item">
                        <div className="department-name">{dept}</div>
                        <div className="department-metrics">
                          <div className="metric">
                            <span className="metric-value">{deptStats?.total || 0}</span>
                            <span className="metric-label">Total</span>
                          </div>
                          <div className="metric">
                            <span className="metric-value">{deptStats?.present || 0}</span>
                            <span className="metric-label">Present</span>
                          </div>
                          <div className="metric">
                            <span className="metric-value">{attendanceRate}%</span>
                            <span className="metric-label">Rate</span>
                          </div>
                        </div>
                        <div className="department-progress">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${attendanceRate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed Report Table */}
            <div className="report-table-card">
              <div className="card-header">
                <h3>📋 Detailed Attendance Records</h3>
                <div className="table-info">
                  Showing {startIndex + 1}-{endIndex} of {reportData?.pagination?.count || 0} records
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading attendance data...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Working Hours</th>
                        <th>Overtime</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.attendance?.map((record, index) => (
                        <tr key={record._id || index}>
                          <td>{formatDate(record.attendanceDate)}</td>
                          <td>
                            <div className="employee-cell">
                              <div className="employee-name">{record.employeeName}</div>
                              <div className="employee-code">{record.employeeCode}</div>
                            </div>
                          </td>
                          <td>
                            <span className="department-tag">{record.department || 'N/A'}</span>
                          </td>
                          <td>
                            <span 
                              className="status-badge" 
                              style={{ backgroundColor: getStatusColor(record.status) }}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td>{formatTime(record.clockIn?.time)}</td>
                          <td>{formatTime(record.clockOut?.time)}</td>
                          <td>
                            <span className="hours-cell">
                              {(record.workingHours?.total || 0).toFixed(2)}h
                            </span>
                          </td>
                          <td>
                            <span className="overtime-cell">
                              {record.workingHours?.overtime > 0 ? 
                                `+${record.workingHours.overtime.toFixed(2)}h` : 
                                '-'
                              }
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="action-btn view" title="View Details">👁️</button>
                              <button className="action-btn edit" title="Edit Record">✏️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {(!reportData?.attendance || reportData.attendance.length === 0) && (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <h3>No attendance records found</h3>
                      <p>Try adjusting your filters to see more data</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
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
          position: relative;
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

        .nav-section::-webkit-scrollbar {
          display: none;
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

        /* Dropdown Menu */
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

        .dropdown-item.active {
          background: rgba(102, 126, 234, 0.2);
          border-left: 3px solid #667eea;
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
          position: relative;
          overflow: hidden;
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
          position: relative;
          z-index: 2;
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

        /* Collapse Toggle */
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

        /* =============== REPORT SPECIFIC STYLES =============== */
        .report-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .report-title h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
        }

        .report-title p {
          margin: 0;
          color: #64748b;
          font-size: 16px;
        }

        .export-actions {
          display: flex;
          gap: 12px;
        }

        .export-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .export-btn.csv {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .export-btn.pdf {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Filters Card */
        .filters-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          padding: 20px 24px 0 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 20px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .filters-content {
          padding: 0 24px 24px 24px;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .filter-input,
        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          background: white;
          transition: all 0.3s ease;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .apply-filters-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .apply-filters-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .apply-filters-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Summary Statistics */
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }

        .stat-card.total::before { background: #6b7280; }
        .stat-card.present::before { background: #10b981; }
        .stat-card.absent::before { background: #ef4444; }
        .stat-card.late::before { background: #f59e0b; }
        .stat-card.hours::before { background: #8b5cf6; }

        .stat-icon {
          font-size: 32px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 50%;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-percentage {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
        }

        /* Charts Section */
        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .chart-placeholder {
          padding: 60px 24px;
          text-align: center;
          color: #64748b;
        }

        .chart-info p {
          margin: 8px 0;
          font-size: 14px;
        }

        .status-distribution {
          padding: 24px;
        }

        .status-item {
          margin-bottom: 16px;
        }

        .status-bar {
          height: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
          transition: width 0.3s ease;
        }

        .status-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .status-name {
          font-weight: 500;
          color: #374151;
        }

        .status-count {
          font-weight: 600;
          color: #1e293b;
        }

        /* Department Statistics */
        .department-stats-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }

        .department-stats-content {
          padding: 24px;
        }

        .department-item {
          margin-bottom: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .department-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
          font-size: 16px;
        }

        .department-metrics {
          display: flex;
          gap: 20px;
          margin-bottom: 12px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .metric-label {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .department-progress {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        /* Report Table */
        .report-table-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .table-info {
          font-size: 14px;
          color: #64748b;
        }

        .loading-state {
          padding: 60px 24px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .table-container {
          overflow-x: auto;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
        }

        .report-table th {
          background: #f8fafc;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          border-bottom: 2px solid #e5e7eb;
        }

        .report-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }

        .report-table tbody tr:hover {
          background: #f8fafc;
        }

        .employee-cell {
          display: flex;
          flex-direction: column;
        }

        .employee-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .employee-code {
          font-size: 12px;
          color: #64748b;
        }

        .department-tag {
          background: #e0f2fe;
          color: #0369a1;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          color: white;
          text-align: center;
          min-width: 80px;
        }

        .hours-cell {
          font-weight: 600;
          color: #1e293b;
        }

        .overtime-cell {
          font-weight: 500;
          color: #059669;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn.view {
          background: #e0f2fe;
          color: #0369a1;
        }

        .action-btn.edit {
          background: #fef3c7;
          color: #d97706;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .empty-state {
          padding: 60px 24px;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 18px;
        }

        .empty-state p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-top: 1px solid #f1f5f9;
        }

        .pagination-btn {
          padding: 8px 16px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .charts-section {
            grid-template-columns: 1fr;
          }

          .filters-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .summary-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .content-container {
            padding: 16px;
          }

          .report-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .export-actions {
            justify-content: center;
          }

          .summary-stats {
            grid-template-columns: 1fr;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .pagination {
            flex-direction: column;
            gap: 12px;
          }

          .department-metrics {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceReportPage;
