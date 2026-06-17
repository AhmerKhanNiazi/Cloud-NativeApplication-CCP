import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Analytics({ incidents }) {
  const stats = useMemo(() => {
    let critical = 0, high = 0, medium = 0;
    incidents.forEach(inc => {
      const s = (inc.severity || 'Medium').toLowerCase();
      if (s === 'critical') critical++;
      if (s === 'high') high++;
      if (s === 'medium') medium++;
    });
    return { total: incidents.length, critical, high, medium };
  }, [incidents]);

  const pieData = [
    { name: 'Critical', value: stats.critical, color: '#ff3366' },
    { name: 'High', value: stats.high, color: '#ffcc00' },
    { name: 'Medium', value: stats.medium, color: '#00ffff' }
  ];

  // Group by date for a simple timeline
  const timelineData = useMemo(() => {
    const counts = {};
    incidents.forEach(inc => {
      if (inc.timestamp) {
        // Just extract YYYY-MM-DD
        const dateStr = String(inc.timestamp).substring(0, 10);
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    });
    const sortedDates = Object.keys(counts).sort();
    return sortedDates.map(date => ({
      date,
      count: counts[date]
    }));
  }, [incidents]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      className="glass-panel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div variants={itemVariants} className="header-container" style={{ marginBottom: '2rem' }}>
        <h2 className="header-subtitle" style={{ color: '#fff', fontSize: '1.5rem' }}>Tactical Command Center</h2>
        <p className="upload-text">Real-time incident distribution and metrics</p>
      </motion.div>

      <div className="analytics-grid">
        <motion.div variants={itemVariants} className="stat-card" style={{ borderColor: 'rgba(0,255,255,0.3)' }}>
          <Activity size={40} color="#00ffff" style={{ marginBottom: '1rem' }}/>
          <div className="stat-value" style={{ color: '#00ffff' }}>{stats.total}</div>
          <div className="stat-label">Total Logs</div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card" style={{ borderColor: 'rgba(255,51,102,0.3)' }}>
          <ShieldAlert size={40} color="#ff3366" style={{ marginBottom: '1rem' }}/>
          <div className="stat-value" style={{ color: '#ff3366' }}>{stats.critical}</div>
          <div className="stat-label">Critical Alerts</div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card" style={{ borderColor: 'rgba(255,204,0,0.3)' }}>
          <AlertTriangle size={40} color="#ffcc00" style={{ marginBottom: '1rem' }}/>
          <div className="stat-value" style={{ color: '#ffcc00' }}>{stats.high}</div>
          <div className="stat-label">High Priority</div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="chart-container">
          <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#7dd3fc', fontFamily: 'Share Tech Mono' }}>Severity Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color})` }} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 20, 30, 0.9)', border: '1px solid #00ffff', borderRadius: '4px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#7dd3fc', fontFamily: 'Share Tech Mono' }}>Incident Timeline</h3>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                <XAxis dataKey="date" stroke="#7dd3fc" tick={{ fill: '#7dd3fc', fontSize: 12 }} />
                <YAxis stroke="#7dd3fc" tick={{ fill: '#7dd3fc', fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 20, 30, 0.9)', border: '1px solid #00ffff', borderRadius: '4px' }}
                  cursor={{ fill: 'rgba(0,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#00ffff" radius={[4, 4, 0, 0]} style={{ filter: 'drop-shadow(0 0 5px #00ffff)' }}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#7dd3fc' }}>
              No timeline data available
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
