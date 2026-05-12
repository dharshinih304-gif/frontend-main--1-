'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FilePlus, 
  Plus,
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Paperclip,
  Ship
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          vessel:vessels(*)
        `)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reports.length) return;
    const headers = ['ID', 'Vessel', 'Date', 'Status', 'Category'];
    const rows = reports.map(r => [
      r.id, 
      r.vessel?.vesselName || 'N/A', 
      new Date(r.inspectionDate).toLocaleDateString(), 
      r.status,
      r.category || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inspection_Reports_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
      fetchReports();
    } catch (error) {
      alert('Failed to delete report: ' + (error as any).message);
    }
  };

  const filteredReports = reports
    .filter(r => activeTab === 'ALL' || r.status === activeTab)
    .filter(r => (r.vessel?.vesselName || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-tight">Inspection Reports</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 font-bold tracking-tight">Manage and audit finalized vessel inspection logs from Supabase.</p>
        </div>
        <button 
          onClick={() => router.push('/vessels')}
          className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-accent text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-accent/30"
        >
          <Plus className="w-5 h-5" />
          New Inspection
        </button>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">Approved</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {reports.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[11px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-[0.2em]">Pending</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {reports.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[11px] font-black text-red-700 dark:text-red-400 uppercase tracking-[0.2em]">Rejected</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {reports.filter(r => r.status === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-[32px] shadow-sm">
        <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-full lg:w-auto">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em]",
                activeTab === tab 
                  ? "bg-white dark:bg-accent text-slate-900 dark:text-white shadow-xl shadow-slate-900/10 dark:shadow-accent/20" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by vessel name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 ring-accent transition-all"
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-white/10 border-b border-slate-200 dark:border-white/10">
                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em]">Reference / Vessel</th>
                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredReports.map((report) => (
                <tr key={report.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-black dark:text-white uppercase tracking-tight">#{report.id.toString().slice(-6)}</p>
                        <p className="text-xs text-slate-500 font-bold">{report.vessel?.vesselName || 'Unassigned Vessel'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">
                      {report.category?.split('_').join(' ') || 'General'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-700 dark:text-slate-300">
                    {new Date(report.inspectionDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      report.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" :
                      report.status === 'PENDING' ? "bg-orange-500/10 text-orange-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        report.status === 'APPROVED' ? "bg-emerald-500" :
                        report.status === 'PENDING' ? "bg-orange-500" : "bg-red-500"
                      )} />
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => router.push(`/reports/${report.id}`)}
                        className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-accent shadow-sm" 
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteReport(report.id)}
                        className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-red-500 shadow-sm" 
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Fetching Records...</p>
            </div>
          ) : filteredReports.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">No Reports Found</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Finalize an inspection to see records here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
