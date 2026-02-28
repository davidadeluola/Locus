import React from 'react';

export default function ErrorFallback({ error }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error?.message || 'Unknown')}</pre>
    </div>
  );
}
