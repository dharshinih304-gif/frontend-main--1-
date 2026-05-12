import { useEffect, useState } from 'react'
import { getTableData, updateTableRow } from '../services/api'
import { motion } from 'framer-motion'
import { FileText, Loader2, AlertCircle, Check, Save } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { cn } from '../lib/utils'

function InspectionTable({ tableName, vesselId, vesselName }) {
    const { user } = useAuth()
    const [rows, setRows] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [savingRowId, setSavingRowId] = useState(null)
    const [error, setError] = useState(null)
    const [editData, setEditData] = useState({})

    const isEditable = user?.role === 'USER' || user?.role === 'SUPERINTENDENT'

    useEffect(() => {
        async function loadData() {
            if (!vesselId) return;
            try {
                setIsLoading(true)
                const data = await getTableData(tableName, vesselId)
                setRows(data || [])
                
                // Initialize edit data
                const initialEditData = {}
                data?.forEach(row => {
                    initialEditData[row.id] = { ans: row.ans, comments: row.comments }
                })
                setEditData(initialEditData)
            } catch (err) {
                console.error(`Error loading table ${tableName}:`, err)
                setError('Failed to load data')
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [tableName, vesselId])

    const handleInputChange = (id, field, value) => {
        setEditData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }))
    }

    const handleSave = async (id) => {
        try {
            setSavingRowId(id)
            await updateTableRow(tableName, id, editData[id])
            
            // Update local rows to reflect saved state
            setRows(prev => prev.map(row => 
                row.id === id ? { ...row, ...editData[id] } : row
            ))
        } catch (err) {
            console.error('Failed to save row:', err)
            alert('Failed to save changes')
        } finally {
            setSavingRowId(null)
        }
    }

    const formatHeader = (str) => {
        return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-[32px] shadow-2xl shadow-slate-200/20 dark:shadow-none overflow-hidden"
        >
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent rounded-2xl text-white shadow-lg shadow-accent/20">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">{formatHeader(tableName)}</h2>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] mt-2">
                            Active Vessel: <span className="text-accent">{vesselName || 'Loading...'}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isEditable && (
                        <span className="text-[10px] font-black px-4 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20 uppercase tracking-widest shadow-sm">
                            Edit Mode
                        </span>
                    )}
                    {rows.length > 0 && (
                        <span className="text-[10px] font-black px-4 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-white/10 uppercase tracking-widest shadow-sm">
                            {rows.length} Items
                        </span>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-accent" />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">Synchronizing Data...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-red-500 bg-red-500/5 m-8 rounded-3xl border border-red-500/10 shadow-inner">
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-sm font-black uppercase tracking-widest">{error}</p>
                </div>
            ) : rows.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-slate-100 dark:border-white/5 m-8 rounded-[40px]">
                    <FileText className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">No datasets found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em]">S.No</th>
                                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em]">Rule Ref</th>
                                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em] min-w-[300px]">Requirements</th>
                                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em] text-center w-32">Answer</th>
                                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em] min-w-[250px]">Comments</th>
                                <th className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {rows.map((item, index) => (
                                <tr key={item.id || index} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                    <td className="px-8 py-6 text-xs font-black text-slate-900 dark:text-white">
                                        {String(item.s_no || index + 1).padStart(2, '0')}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-[10px] font-mono font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-lg uppercase">
                                            {item.rule_ref || '-'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{item.requirements}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {isEditable ? (
                                            <div className="relative">
                                                <select 
                                                    value={editData[item.id]?.ans || ''}
                                                    onChange={(e) => handleInputChange(item.id, 'ans', e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-accent transition-all appearance-none cursor-pointer shadow-sm"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                                    item.ans?.toLowerCase() === 'yes' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                    item.ans?.toLowerCase() === 'no' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                    'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                                                )}>
                                                    {item.ans || 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        {isEditable ? (
                                            <input 
                                                type="text"
                                                value={editData[item.id]?.comments || ''}
                                                onChange={(e) => handleInputChange(item.id, 'comments', e.target.value)}
                                                placeholder="Add descriptive comment..."
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 ring-accent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                                            />
                                        ) : (
                                            <div className="text-sm text-slate-600 dark:text-slate-300 font-bold italic">
                                                {item.comments ? `"${item.comments}"` : '-'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {isEditable ? (
                                            <button 
                                                onClick={() => handleSave(item.id)}
                                                disabled={savingRowId === item.id}
                                                className={cn(
                                                    "p-3 rounded-2xl transition-all shadow-xl active:scale-90",
                                                    savingRowId === item.id 
                                                        ? 'bg-slate-100 text-slate-400' 
                                                        : 'bg-slate-900 dark:bg-accent text-white hover:opacity-90 shadow-slate-900/20 dark:shadow-accent/20'
                                                )}
                                            >
                                                {savingRowId === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-5 h-5" />
                                                )}
                                            </button>
                                        ) : (
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                {item.image ? (
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden ring-2 ring-slate-200 dark:ring-white/10 shadow-lg group-hover:scale-110 transition-transform">
                                                        <img src={item.image} alt="Ref" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    )
}

export default InspectionTable
