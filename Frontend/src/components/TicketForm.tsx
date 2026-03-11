/**
 * TicketForm - Premium styled form for creating support tickets.
 */

import { useState } from "react";
import type { TicketPriority } from "../types/types";

interface TicketFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    assetType?: string;
    priority?: TicketPriority;
  }) => void;
  isSubmitting: boolean;
}

const TicketForm = ({ onSubmit, isSubmitting }: TicketFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      assetType: assetType || undefined,
      priority,
    });
    setTitle("");
    setDescription("");
    setAssetType("");
    setPriority("MEDIUM");
  };

  const inputClass = "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-xl border p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <span className="text-lg"></span>
        <h2 className="text-base font-bold text-foreground">New Ticket</h2>
      </div>

      <div>
        <label className={labelClass}>Issue Title</label>
        <input
          id="ticket-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Laptop not turning on"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          id="ticket-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Describe your issue in detail..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Asset Type</label>
          <select id="ticket-asset-type" value={assetType} onChange={(e) => setAssetType(e.target.value)} className={inputClass}>
            <option value="">Select...</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Printer">Printer</option>
            <option value="Network">Network</option>
            <option value="Software">Software</option>
            <option value="Email">Email</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select id="ticket-priority" value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} className={inputClass}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

     <button
  id="ticket-submit"
  type="submit"
  disabled={isSubmitting}
  className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 text-sm"
  style={{
    background: "linear-gradient(to right, #000000, #d3d3d3)", // matches navbar gradient
  }}
>
  {isSubmitting ? "Submitting..." : "Submit Ticket"}
</button>
    </form>
  );
};

export default TicketForm;
