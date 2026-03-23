// src/components/SyncIndicator.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContent } from '../contexts/GlobalContentContext';

export const SyncIndicator = () => {
  const { syncStatus } = useGlobalContent(); // Espera 'synced', 'saving', 'offline'

  const config = {
    synced: { text: "Synced", color: "#10B981", pulse: false },
    saving: { text: "Saving...", color: "#F59E0B", pulse: true },
    offline: { text: "Offline", color: "#EF4444", pulse: false }
  };

  const current = config[syncStatus] || config.synced;

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', 
      background: 'rgba(0,0,0,0.03)', borderRadius: 24, 
      border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      <div style={{ position: 'relative', width: 8, height: 8 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={syncStatus}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: current.color }}
          />
        </AnimatePresence>
        {current.pulse && (
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderRadius: '50%', backgroundColor: current.color }}
          />
        )}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.6)', letterSpacing: '-0.01em', fontFamily: 'var(--font-ui, "Inter", sans-serif)' }}>
        {current.text}
      </span>
    </div>
  );
};
