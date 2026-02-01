// components/common/AccessIndicator.js
'use client'
import { useAuth } from '../../app/contexts/AuthContext'
import { Shield, Lock, CheckCircle } from 'lucide-react'

const AccessIndicator = ({ moduleId, children }) => {
  const { hasModuleAccess, user } = useAuth()
  const hasAccess = hasModuleAccess(moduleId)

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-6">
          <Lock size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3>
          <p className="text-gray-500 mb-4">
            You do not have permission to access the <strong>{moduleId}</strong> module.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center text-yellow-700">
              <Shield size={16} className="mr-2" />
              <span className="text-sm">
                Your role: <strong>{user?.role?.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Contact your administrator to request access to this module.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Access Granted Indicator - Only show for non-admin users */}
      {!user?.role?.includes('admin') && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
            <CheckCircle size={12} className="mr-1" />
            <span>Access Granted</span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default AccessIndicator
