import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  title = 'No telemetry records indexed', 
  message = 'There are no active artifacts matching the current filter criteria.', 
  icon: Icon = Inbox,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none animate-fade-in">
      <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#f3f4f8] border border-[#e2e4ea]">
        <Icon className="h-5 w-5 text-[#88909e]" />
      </div>
      <p className="mt-3 text-xs font-bold text-[#0f1015] tracking-tight">{title}</p>
      <p className="mt-1 text-xs text-[#525866] max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
