'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  Package, 
  Settings, 
  Factory, 
  Clock, 
  MapPin, 
  User, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react'

export default function DashboardContent() {
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setCurrentDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase())
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const salesData = [
    { month: 'August', amount: '₹ 2,005.00', trend: 'down' },
    { month: 'July', amount: '₹ 858,388.00', trend: 'up' },
    { month: 'June', amount: '₹ 75,970.00', trend: 'up' },
    { month: 'May', amount: '₹ 849,445.33', trend: 'up' }
  ]

  const balanceData = [
    { account: 'Cash In Hand', balance: '₹ 1,512,992,558.50', color: 'text-emerald-600' },
    { account: 'Bank Accounts', balance: '₹ 6,224,604.00', color: 'text-blue-600' },
    { account: 'Customer Due', balance: '₹ 1,340,202.00', color: 'text-amber-600' },
    { account: 'Supplier Due', balance: '₹ -3,404,497.42', color: 'text-red-600' }
  ]

  const modules = [
    { name: 'SALES', icon: <ShoppingCart size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'ACCOUNTS', icon: <Wallet size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'POS', icon: <LayoutDashboard size={20} />, color: 'text-teal-600', bg: 'bg-teal-50' },
    { name: 'PURCHASE', icon: <Package size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'INVENTORY', icon: <TrendingUp size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'MANUFACTURING', icon: <Factory size={20} />, color: 'text-slate-600', bg: 'bg-slate-100' }
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Top Navigation Bar */}
    

      <main className="max-w-7xl mx-auto p-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {['Today Sales', 'Today Due', 'Today Expense', 'Today Profit'].map((label, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
              <div className="flex items-end justify-between">
                <h2 className="text-xl font-bold text-slate-800">₹ 0.00</h2>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">Updated now</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Sales Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">Sales History</h3>
              <button className="text-xs text-indigo-600 font-medium hover:underline">View Report</button>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/30">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Month</th>
                    <th className="px-4 py-2 font-semibold text-right">Revenue</th>
                    <th className="px-4 py-2 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesData.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-600">{item.month}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{item.amount}</td>
                      <td className="px-4 py-3 flex justify-center">
                        {item.trend === 'up' ? 
                          <ArrowUpRight size={16} className="text-emerald-500" /> : 
                          <ArrowDownRight size={16} className="text-rose-500" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">Financial Overview</h3>
              <Wallet size={16} className="text-slate-400" />
            </div>
            <div className="p-4 space-y-4">
              {balanceData.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">{item.account}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.balance}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module Navigation - Modern Style */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">System Modules</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((module, index) => (
            <button
              key={index}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group text-left"
            >
              <div className={`${module.bg} ${module.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <div className="text-[11px] font-bold text-slate-700 tracking-tight leading-none">{module.name}</div>
              <div className="text-[9px] text-slate-400 mt-1 font-medium">Manage & Track</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}