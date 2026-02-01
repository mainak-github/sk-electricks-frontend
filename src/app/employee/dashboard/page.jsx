'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const LuxuryDashboard = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [profileDropdown, setProfileDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const navigation = [
    {
      name: 'Dashboard',
      icon: '📊',
      href: '/dashboard',
      current: pathname === '/employee/dashboard',
      // hasDropdown: true,
      // subItems: [
      //   { name: 'Overview', href: '/dashboard/overview', icon: '🎯' },
      //   { name: 'Performance', href: '/dashboard/performance', icon: '⚡' },
      //   { name: 'Insights', href: '/dashboard/insights', icon: '🔍' }
      // ]
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

    // {
    //   name: 'Team Management',
    //   icon: '👥',
    //   href: '/dashboard/employees',
    //   current: pathname.startsWith('/dashboard/employees'),
    //   hasDropdown: true,
    //   subItems: [
    //     { name: 'All Employees', href: '/dashboard/employees', icon: '👤' },
    //     { name: 'Add Member', href: '/dashboard/employees/add', icon: '➕' },
    //     { name: 'Departments', href: '/dashboard/departments', icon: '🏢' },
    //     { name: 'Roles & Permissions', href: '/dashboard/roles', icon: '🔐' }
    //   ]
    // },
    // {
    //   name: 'Financial Suite',
    //   icon: '💰',
    //   href: '/dashboard/finance',
    //   current: pathname.startsWith('/dashboard/finance'),
    //   hasDropdown: true,
    //   subItems: [
    //     { name: 'Payroll', href: '/dashboard/finance/payroll', icon: '💳' },
    //     { name: 'Expenses', href: '/dashboard/finance/expenses', icon: '📊' },
    //     { name: 'Budgets', href: '/dashboard/finance/budgets', icon: '🎯' }
    //   ]
    // },
    // {
    //   name: 'Advanced Reports',
    //   icon: '📈',
    //   href: '/dashboard/reports',
    //   current: pathname.startsWith('/dashboard/reports'),
    //   hasDropdown: true,
    //   subItems: [
    //     { name: 'Analytics', href: '/dashboard/reports/analytics', icon: '📊' },
    //     { name: 'Custom Reports', href: '/dashboard/reports/custom', icon: '⚙️' },
    //     { name: 'Export Data', href: '/dashboard/reports/export', icon: '📤' }
    //   ]
    // },
    // {
    //   name: 'System Control',
    //   icon: '⚙️',
    //   href: '/dashboard/settings',
    //   current: pathname.startsWith('/dashboard/settings'),
    //   hasDropdown: true,
    //   subItems: [
    //     { name: 'General', href: '/dashboard/settings/general', icon: '🔧' },
    //     { name: 'Security', href: '/dashboard/settings/security', icon: '🛡️' },
    //     { name: 'Integrations', href: '/dashboard/settings/integrations', icon: '🔗' }
    //   ]
    // }
  ];

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

  if (!employee) {
    return (
      <div className="luxury-loading">
        <div className="loading-orb"></div>
        {/* <div className="loading-text">Initializing Premium Dashboard</div> */}
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
          .loading-text {
            font-size: 18px;
            font-weight: 300;
            letter-spacing: 1px;
            opacity: 0.9;
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
                  {/* <p>Premium Edition</p> */}
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
              <span className="breadcrumb-current">
                {navigation.find(nav => nav.current)?.name || 'Dashboard'}
              </span>
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
                  {/* <span className="profile-status">Premium User</span> */}
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

        {/* Content Container */}
        <div className="content-container">
          {children}
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

        .logo-icon::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 14px;
          z-index: -1;
          opacity: 0.3;
          filter: blur(8px);
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

        .logo-text p {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
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

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 0 4px 4px 0;
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
          transform-origin: center;
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

        .user-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          opacity: 0.5;
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

        .collapse-toggle:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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

        .breadcrumb-home {
          font-size: 16px;
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

        /* Search */
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

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: white;
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

        /* Notifications */
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

        .notification-btn:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .notification-icon {
          font-size: 18px;
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

        /* Profile Section */
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

        .profile-trigger:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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

        .profile-status {
          font-size: 11px;
          color: #667eea;
          font-weight: 500;
        }

        .profile-arrow {
          font-size: 10px;
          color: #64748b;
          transition: transform 0.3s ease;
        }

        /* Profile Dropdown */
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

        /* Mobile Responsiveness */
        @media (max-width: 1024px) {
          .luxury-sidebar {
            transform: translateX(-100%);
          }

          .luxury-sidebar.mobile-open {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0;
          }

          .search-input {
            width: 200px;
          }
        }

        @media (max-width: 640px) {
          .luxury-header {
            padding: 16px 20px;
          }

          .header-right {
            gap: 12px;
          }

          .search-container {
            display: none;
          }

          .content-container {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default LuxuryDashboard;
