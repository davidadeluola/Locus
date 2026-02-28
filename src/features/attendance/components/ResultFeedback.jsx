import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultFeedback({ result }) {
  if (!result) return null;

  const containerClass = result.success
    ? 'bg-emerald-500/10 border-emerald-500/20'
    : result.error === 'OUT_OF_RANGE'
    ? 'bg-orange-500/10 border-orange-500/20'
    : 'bg-red-500/10 border-red-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-6 rounded-2xl border ${containerClass}`}
    >
      <div className="flex items-start gap-4">
        {result.success ? (
          <CheckCircle className="text-emerald-500 shrink-0" size={32} />
        ) : result.error === 'OUT_OF_RANGE' ? (
          <AlertTriangle className="text-orange-500 shrink-0" size={32} />
        ) : (
          <XCircle className="text-red-500 shrink-0" size={32} />
        )}
        <div className="flex-1">
          <h4
            className={`font-mono text-sm uppercase mb-2 ${
              result.success
                ? 'text-emerald-500'
                : result.error === 'OUT_OF_RANGE'
                ? 'text-orange-500'
                : 'text-red-500'
            }`}
          >
            {result.success
              ? '✓ Clearance Granted'
              : result.error === 'OUT_OF_RANGE'
              ? '⚠ Outside Classroom Radius'
              : '✗ Authentication Failed'}
          </h4>
          <p className="text-sm text-zinc-300 mb-2">
            {result.success
              ? 'Your attendance has been successfully recorded.'
              : result.error === 'OUT_OF_RANGE'
              ? 'You are too far from the classroom. Please move closer and try again.'
              : result.error || 'An error occurred during verification.'}
          </p>
          {result.distance !== undefined && (
            <div className="flex items-center gap-2 mt-3">
              <MapPin size={14} className="text-zinc-500" />
              <span className="text-xs font-mono text-zinc-500">Distance: {result.distance}m{result.error === 'OUT_OF_RANGE' && ' (Max: 100m)'}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
