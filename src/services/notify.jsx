import React from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const COLORS = {
  success: '#10B981',
  error: '#F97316',
  info: '#A1A1AA',
};

function makeContent(type, message) {
  const title = (
    <div className="text-xs font-mono uppercase text-zinc-400">{type}</div>
  );

  const body = <div className="text-sm text-white font-mono">{String(message)}</div>;

  const iconMap = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <XCircle className="text-orange-400" size={20} />,
    info: <AlertTriangle className="text-zinc-400" size={20} />,
  };

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ marginTop: 2 }}>{iconMap[type] || null}</div>
      <div>
        {title}
        {body}
      </div>
    </div>
  );
}

const notify = {
  success(message) {
    toast.success(makeContent('success', message), { style: { borderLeft: `4px solid ${COLORS.success}` } });
  },
  error(message) {
    toast.error(makeContent('error', message), { style: { borderLeft: `4px solid ${COLORS.error}` } });
  },
  info(message) {
    toast.info(makeContent('info', message), { style: { borderLeft: `4px solid ${COLORS.info}` } });
  },
};

export default notify;
