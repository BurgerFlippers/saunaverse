import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { time: '0min', temperature: 20, humidity: 20 },
  { time: '5min', temperature: 55, humidity: 35 },
  { time: '10min', temperature: 75, humidity: 45 },
  { time: '15min', temperature: 85, humidity: 55 },
  { time: '20min', temperature: 88, humidity: 60 },
  { time: '25min', temperature: 90, humidity: 65 },
  { time: '30min', temperature: 85, humidity: 62 },
];

export function SessionChart() {
  // Calculate max temperature for dynamic Y-axis
  const maxTemp = Math.max(...data.map(d => d.temperature));
  const yAxisDomain = maxTemp > 100 ? [0, 119] : [0, 100];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 45, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            stroke="#888"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#888"
            domain={yAxisDomain}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#f97316" 
            strokeWidth={2}
            name="Temperature (°C)"
            dot={{ fill: '#f97316' }}
          />
          <Line 
            type="monotone" 
            dataKey="humidity" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Humidity (%)"
            dot={{ fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}