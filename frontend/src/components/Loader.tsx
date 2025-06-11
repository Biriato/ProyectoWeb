import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80">
      <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
    </div>
  );
}