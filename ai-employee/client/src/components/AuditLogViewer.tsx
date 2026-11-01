"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api, AuditEvent } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

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
        return <Badge variant="teal">Pending</Badge>;
      case "rejected":
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="w-full bg-card border border-card-border rounded-xl p-5 sm:p-6 shadow-card transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-card-border">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal/15 border border-teal/30 text-teal dark:text-skyblue flex items-center justify-center shadow-xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-primary-text flex items-center space-x-2">
              <span>Audit Trail</span>
              <Badge variant="teal">Immutable Record</Badge>
            </h3>
            <p className="text-xs text-secondary-text mt-0.5 font-medium">
              Verified operational events recorded for accountability and compliance.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary-text" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-page rounded-xl border border-card-border text-primary-text placeholder:text-secondary-text placeholder:opacity-80 focus:outline-none focus:border-teal font-medium"
            />
          </div>

          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="px-3 py-1.5 text-xs bg-page rounded-xl border border-card-border text-primary-text font-bold focus:outline-none focus:border-teal cursor-pointer"
          >
            <option value="all">All Actors</option>
            <option value="agent">Agent</option>
            <option value="human">Human</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-card-border text-xs font-bold text-primary-text uppercase bg-page/50">
              <th className="py-3 px-3.5">Timestamp</th>
              <th className="py-3 px-3.5">Actor</th>
              <th className="py-3 px-3.5">Action</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {filteredLogs.map((log) => {
              const isExpanded = expandedRow === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    className="hover:bg-highlight/30 dark:hover:bg-teal/15 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3.5 font-mono text-xs font-semibold text-secondary-text whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className="font-bold text-primary-text capitalize">
                        {log.actor}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 font-semibold text-primary-text">{log.action}</td>
                    <td className="py-3.5 px-3.5">{getStatusBadge(log.status)}</td>
                    <td className="py-3.5 px-3.5 text-right">
                      <button className="p-1 rounded-md text-secondary-text hover:text-primary-text">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 inline" />
                        ) : (
                          <ChevronRight className="w-4 h-4 inline" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="py-3 px-4 bg-page">
                        <div className="p-3.5 rounded-lg bg-card border border-card-border font-mono text-xs text-primary-text overflow-x-auto font-medium">
                          <pre>{JSON.stringify(log.detail, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-8 text-secondary-text text-xs font-semibold">
            No audit logs found matching criteria.
          </div>
        )}
      </div>
    </div>
  );
}
