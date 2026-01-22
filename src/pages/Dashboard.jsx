import { Monitor, Users, Wrench, ClipboardList } from "lucide-react";
import StatCard from "../components/StatCard";
import DeviceCard from "../components/DeviceCard";
import "../styles/dashboard.css";

export default function Dashboard() {
  const stats = [
    { label: "Device", count: 6, icon: <Monitor size={32} /> },
    { label: "Man Power", count: 6, icon: <Users size={32} /> },
    { label: "Parts", count: 6, icon: <Wrench size={32} /> },
    { label: "Work Order", count: 6, icon: <ClipboardList size={32} /> },
  ];

  const devices = ["Device 1", "Device 2", "Device 3", "Device 4"];

  return (
    <>
      <div className="stat-row">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="device-grid">
        {devices.map((d, i) => (
          <DeviceCard key={i} title={d} />
        ))}
      </div>
    </>
  );
}
