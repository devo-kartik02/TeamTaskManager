import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '../utils/api';
import { Activity, CheckCircle, Clock, AlertTriangle, UserCircle, MessageSquare } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
    total: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [tasksData, activitiesData] = await Promise.all([
          fetchWithAuth('/tasks'),
          fetchWithAuth('/activities')
        ]);
        
        const todo = tasksData.filter((t: any) => t.status === 'TODO').length;
        const inProgress = tasksData.filter((t: any) => t.status === 'IN_PROGRESS').length;
        const done = tasksData.filter((t: any) => t.status === 'DONE').length;
        
        setStats({ todo, inProgress, done, total: tasksData.length });
        setActivities(activitiesData);

        // Compute Weekly Productivity
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dayName = format(date, 'EEE'); // Mon, Tue, etc.
          const start = startOfDay(date).getTime();
          const end = endOfDay(date).getTime();
          
          // Find activities that are "Moved Task" or "Deleted Task" or "Assigned Task" inside this day.
          // Wait, the requirement was "tasks completed each day".
          // We can check ActivityLogs for action === 'Moved Task' and details containing 'DONE'.
          const completedThatDay = activitiesData.filter((act: any) => 
            act.action === 'Moved Task' && 
            act.details.includes('DONE') &&
            new Date(act.createdAt).getTime() >= start &&
            new Date(act.createdAt).getTime() <= end
          ).length;

          days.push({ day: dayName, completed: completedThatDay });
        }
        setWeeklyData(days);

      } catch (error) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const data = [
    { name: 'To Do', value: stats.todo },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Done', value: stats.done },
  ];

  const activityData = weeklyData.length ? weeklyData : [
    { day: 'Mon', completed: 0 },
    { day: 'Tue', completed: 0 },
    { day: 'Wed', completed: 0 },
    { day: 'Thu', completed: 0 },
    { day: 'Fri', completed: 0 },
    { day: 'Sat', completed: 0 },
    { day: 'Sun', completed: 0 },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut' as const,
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
            <BarChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                cursor={{ fill: '#ffffff05' }}
              />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass-panel p-6 mt-6"
      >
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" />
          Recent Activity
        </h3>
        {activities.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No recent activity found.</p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity: any) => (
              <div key={activity._id} className="flex items-start gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400 mt-1">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-indigo-300 mr-1">{activity.userId?.name || 'User'}</span> 
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{activity.details}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
