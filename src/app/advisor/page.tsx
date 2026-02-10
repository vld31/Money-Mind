import Sidebar from "../Components/sidebar";
import RequireAuth from "../Components/require-auth";

export default function Advisor() {
  return (
    <div className="flex h-screen bg-gray-100">
      <RequireAuth />
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl glass-panel p-6">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">AI Advisor</h1>
            <p className="text-slate-600 dark:text-slate-400">In this section there will be an AI bot that will help with financial goals.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
