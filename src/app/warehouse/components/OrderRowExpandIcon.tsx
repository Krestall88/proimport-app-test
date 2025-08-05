import { ChevronDown, ChevronRight } from 'lucide-react';

export function OrderRowExpandIcon({ expanded }: { expanded: boolean }) {
  return expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />;
}
