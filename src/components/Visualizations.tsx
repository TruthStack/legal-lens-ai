import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { RiskCategory } from '../types';

interface ChartProps {
  categories: RiskCategory[];
}

export const RiskRadar: React.FC<ChartProps> = ({ categories }) => {
  const data = categories.map(cat => ({
    subject: cat.name,
    score: cat.score,
    fullMark: 100,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false}
          />
          <Radar
            name="Risk Level"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RiskBar: React.FC<ChartProps> = ({ categories }) => {
  const data = [...categories]
    .sort((a, b) => b.score - a.score)
    .map(cat => ({
      name: cat.name,
      score: cat.score,
      description: cat.description,
    }));

  const getRiskColor = (score: number) => {
    if (score >= 80) return '#ef4444'; // Critical
    if (score >= 60) return '#f59e0b'; // High
    if (score >= 40) return '#eab308'; // Medium
    return '#10b981'; // Low
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 100, right: 20 }}>
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 500 }}
            width={100}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value, name) => [
              `${value}% risk`,
              name === 'score' ? 'Risk Score' : name
            ]}
            labelFormatter={(label) => `Category: ${label}`}
          />
          <Bar 
            dataKey="score" 
            radius={[0, 4, 4, 0]}
            background={{ fill: '#1e293b', radius: 4 }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getRiskColor(entry.score)}
                strokeWidth={0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
