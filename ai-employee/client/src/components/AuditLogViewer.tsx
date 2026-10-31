"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ClipboardList,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { api, AuditEvent } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export function AuditLogViewer() {
  const shouldReduceMotion = useReducedMotion();
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
        console.error(err);
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
        return <Badge variant="success">Success</Badge>;
      case "pending":
        return <Badge variant="gold">Pending</Badge>;
      case "rejected":
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="w-full bg-surface border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-gold-glow">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center space-x-2">
              <span>Immutable Audit Trail</span>
              <Badge variant="gold">Postgres + pgvector</Badge>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Tamper-evident logs of every AI decision, sales entry, and approval event.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-base border border-white/[0.08] text-xs text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:shadow-gold-glow"
            />
          </div>

          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-base border border-white/[0.08] text-xs text-text-muted focus:outline-none focus:border-accent"
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
            <tr className="border-b border-white/[0.08] text-text-muted text-[11px] uppercase tracking-wider bg-base/40">
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filteredLogs.map((log, index) => {
              const isExpanded = expandedRow === log.id;
              const isNewest = index === 0;

              return (
                <React.Fragment key={log.id}>
                  <motion.tr
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.25 }}
                    onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    className={`cursor-pointer transition-colors ${
                      isNewest
                        ? "bg-accent/[0.08] border-l-2 border-l-accent shadow-gold-glow"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="py-3.5 px-3 font-mono text-[11px] text-text-muted">
                      {isNewest && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-1.5 shadow-gold-glow" />
                      )}
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-base border border-white/[0.08] text-text-muted">
                        {log.actor}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-3">{getStatusBadge(log.status)}</td>
                    <td className="py-3.5 px-3 text-right text-text-muted">
                      <button className="p-1 rounded hover:bg-base text-text-muted hover:text-accent">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </motion.tr>

                  {/* Expanded JSON details */}
                  {isExpanded && (
                    <tr className="bg-base/80">
                      <td colSpan={5} className="p-3.5">
                        <div className="p-3 rounded-xl bg-surface border border-white/[0.08] text-[11px] font-mono text-text-primary">
                          <span className="text-accent font-semibold block mb-1">Payload Audit Inspection:</span>
                          <pre className="overflow-x-auto text-text-muted">
                            {JSON.stringify(log.detail, null, 2)}
                          </pre>
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
          <div className="py-8 text-center text-xs text-text-muted">
            No audit logs found.
          </div>
        )}
      </div>
    </div>
  );
}
