import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/services';
import { useToastStore } from '../../store/useToastStore';
import {
  FileText,
  RefreshCw,
  ShieldAlert,
  Clock,
  User as UserIcon,
  ChevronRight,
  Code2,
  X,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export const AdminAuditLogs: React.FC = () => {
  const { addToast } = useToastStore();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs(1);
      setLogs(res.data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load security audit records from database' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">Security & Operational Audit Trail</h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of administrative operations, catalog changes, and order status transitions
          </p>
        </div>
        <button
          onClick={loadLogs}
          title="Refresh audit records"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Trail
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading audit trail from database...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {log.user?.name || 'System / Automated'}
                      </div>
                      <div className="text-[10px] text-slate-400">{log.user?.email || 'SYSTEM'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{log.entity}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                      {log.entityId ? `#${log.entityId.slice(-8)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <Code2 className="w-3.5 h-3.5" /> View JSON
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-brand-400" /> Audit Event Payload
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedLog.action} on {selectedLog.entity}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-auto max-h-[60vh]">
              <pre className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(
                  typeof selectedLog.details === 'string'
                    ? JSON.parse(selectedLog.details)
                    : selectedLog.details,
                  null,
                  2
                )}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
