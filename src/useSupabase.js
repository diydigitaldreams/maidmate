// useSupabase.js - Data hooks for MaidMate using Supabase
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// Generic hook for any table
function useTable(tableName, defaultValue = []) {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error: err } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setData(rows || []);
    } catch (e) {
      console.error(`Error fetching ${tableName}:`, e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (row) => {
    const { data: inserted, error: err } = await supabase
      .from(tableName)
      .insert([row])
      .select()
      .single();
    if (err) { console.error(err); return null; }
    setData(prev => [inserted, ...prev]);
    return inserted;
  };

  const update = async (id, updates) => {
    const { data: updated, error: err } = await supabase
      .from(tableName)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (err) { console.error(err); return null; }
    setData(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const remove = async (id) => {
    const { error: err } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);
    if (err) { console.error(err); return false; }
    setData(prev => prev.filter(r => r.id !== id));
    return true;
  };

  return { data, setData, loading, error, insert, update, remove, refetch: fetch };
}

// Clients
export function useClients() {
  return useTable("clients", []);
}

// Jobs
export function useJobs() {
  const hook = useTable("jobs", []);
  const updateStatus = async (id, status) => {
    const colorMap = { Completed: "#4a7060", "In Progress": "#c9a84c", Upcoming: "#3b5bdb" };
    return hook.update(id, { status, color: colorMap[status] });
  };
  return { ...hook, updateStatus };
}

// Invoices
export function useInvoices() {
  const hook = useTable("invoices", []);
  const markPaid = async (id) => hook.update(id, { status: "Paid" });
  return { ...hook, markPaid };
}

// Supplies
export function useSupplies() {
  const hook = useTable("supplies", []);
  const markRestocked = async (id) => hook.update(id, { level: 1.0, status: "ok", qty: "Full stock" });
  return { ...hook, markRestocked };
}

// Trips
export function useTrips() {
  const hook = useTable("trips", []);
  const addTrip = async (from_location, to_location, client, miles) => {
    const deduction = +(miles * 0.67).toFixed(2);
    return hook.insert({
      from_location, to_location, client,
      miles: +miles, deduction,
      trip_date: new Date().toISOString().split("T")[0],
    });
  };
  return { ...hook, addTrip };
}

// Rooms + Tasks (for checklist)
export function useChecklist() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const { data: roomData } = await supabase
      .from("rooms")
      .select("*, tasks(*)")
      .order("sort_order");
    setRooms(roomData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const toggleTask = async (roomId, taskId, currentDone) => {
    await supabase.from("tasks").update({ done: !currentDone }).eq("id", taskId);
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, done: !currentDone } : t) }
        : r
    ));
  };

  return { rooms, setRooms, loading, toggleTask, refetch: fetchRooms };
}

// Messages / Conversations
export function useMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConvos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .order("created_at", { ascending: false });
    setConversations(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchConvos(); }, [fetchConvos]);

  const sendMessage = async (conversationId, text) => {
    const { data: msg } = await supabase
      .from("messages")
      .insert([{ conversation_id: conversationId, sent: true, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }])
      .select()
      .single();
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, msg], unread: false }
        : c
    ));
    await supabase.from("conversations").update({ unread: false }).eq("id", conversationId);
  };

  return { conversations, setConversations, loading, sendMessage, refetch: fetchConvos };
}

// Tax Records
export function useTaxRecords() {
  return useTable("tax_records", []);
}
