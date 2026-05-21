import type { PingLog } from "@/core/apiClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: PingLog[];
}

export default function LatencyChart({ data }: Props) {
  // Formateamos el timestamp para que sea más legible en el eje X.
  const formattedData = data.map((ping) => ({
    ...ping,
    time: new Date(ping.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), 
  })).reverse(); // Revertimos para mostrar del más antiguo al más nuevo

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "0.5rem",
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Line
          type="monotone"
          dataKey="responseTimeMs"
          name="Latencia"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}