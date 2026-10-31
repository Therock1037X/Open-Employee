"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, Filter, Search, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { api, AuditEvent } from "@/lib/api";

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActor, setSelectedActor] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.detail).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActor = selectedActor === "all" || log.actor === selectedActor;
    return matchesSearch && matchesActor;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Success</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700 text-gray-300">
            <AlertCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const getActorBadge = (actor: string) => {
    const styles = {
      agent: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      owner: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      system: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      employee: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    }[actor] || "bg-gray-800 text-gray-400 border-gray-700";

    return (
      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md border ${styles}`}>
        {actor}
      </span>
    );
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 sm:p-6 border border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-100 flex items-center space-x-2">
              <span>Immutable Audit Trail</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-semibold">
                Postgres + pgvector
              </span>
            </h3>
            <p className="text-xs text-gray-400">Complete, tamper-evident record of all AI and owner business events.</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Actors</option>
            <option value="agent">Agent</option>
            <option value="owner">Owner</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredLogs.map((log) => {
              const isExpanded = expandedRow === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="py-3 px-3">{getActorBadge(log.actor)}</td>
                    <td className="py-3 px-3 font-medium text-gray-200">{log.action}</td>
                    <td className="py-3 px-3">{getStatusBadge(log.status)}</td>
                    <td className="py-3 px-3 text-right text-gray-400">
                      <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white inline-flex items-center">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded JSON details */}
                  {isExpanded && (
                    <tr className="bg-gray-950/80">
                      <td colSpan={5} className="p-3.5">
                        <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-[11px] font-mono text-gray-300">
                          <span className="text-gray-500 block mb-1">Payload Details:</span>
                          <pre className="overflow-x-auto text-indigo-300">{JSON.stringify(log.detail, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-500">
            No audit events found matching query.
          </div>
        )}
      </div>
    </div>
  );
}
