'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface SaveButtonProps {
  loading: boolean;
  onClick: () => void;
  label?: string;
}

export default function SaveButton({ loading, onClick, label = "Save Changes" }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md text-white text-sm font-medium transition 
        ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'} 
        shadow-sm`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Saving…' : label}
    </button>
  );
}
