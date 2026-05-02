import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '../utils/api';
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchWithAuth('/tasks');
        const todo = data.filter((t: any) => t.status === 'TODO').length;
        const inProgress = data.filter((t: any) => t.status === 'IN_PROGRESS').length;
        const done = data.filter((t: any) => t.status === 'DONE').length;
        
        setStats({ todo, inProgress, done, total: data.length });
      } catch (error) {
        console.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const data = [
    { name: 'To Do', value: stats.todo },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Done', value: stats.done },
  ];

  const activityData = [
    { day: 'Mon', tasks: 4 },
    { day: 'Tue', tasks: 7 },
    { day: 'Wed', tasks: 5 },
    { day: 'Thu', tasks: 12 },
    { day: 'Fri', tasks: 8 },
    { day: 'Sat', tasks: 3 },
    { day: 'Sun', tasks: 6 },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  if (loading) return <div className="p-8 text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="h-full overflow-y-auto pr-4 pb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100">Analytics Overview</h2>
        <p className="text-slate-400 mt-2">Track your team's progress and productivity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Tasks', value: stats.total, icon: Activity, color: 'text-indigo-400' },
          { title: 'To Do', value: stats.todo, icon: AlertTriangle, color: 'text-slate-400' },
          { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-sky-400' },
          { title: 'Completed', value: stats.done, icon: CheckCircle, color: 'text-emerald-400' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="glass-panel p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-100">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass-panel p-6 h-[400px]"
        >
          <h3 className="text-lg font-semibold mb-6">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                cursor={{ fill: '#ffffff05' }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass-panel p-6 h-[400px]"
        >
          <h3 className="text-lg font-semibold mb-6">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="tasks" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
