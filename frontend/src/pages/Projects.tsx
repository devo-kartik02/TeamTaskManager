import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '../utils/api';
import { toast } from 'sonner';
import { FolderGit2, Users, CheckCircle2, Trash2, Edit2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'Admin');
      } catch (e) {}
    }
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchWithAuth('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await fetchWithAuth(`/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      loadProjects();
      toast.success('Project created');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleEditProject = async (id: string, projectData: any) => {
    try {
      await fetchWithAuth(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
      loadProjects();
      toast.success('Project updated');
      setIsEditModalOpen(false);
      setProjectToEdit(null);
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const openEditModal = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading projects...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Projects</h2>
          <p className="text-slate-400 mt-2">Manage your team's projects and track overall progress</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 h-10"
          >
            <FolderGit2 className="w-5 h-5 mr-2" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState 
          title="No Projects Yet" 
          description="Get started by creating a new project to organize your team's tasks."
          actionText={isAdmin ? "Create Project" : undefined}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8 pr-4">
          {projects.map((project, i) => {
            const data = [
              { name: 'Done', value: project.doneTasks, color: '#10b981' }, // emerald-500
              { name: 'Remaining', value: project.totalTasks - project.doneTasks, color: '#334155' } // slate-700
            ];

            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/board?projectId=${project._id}`)}
                className="glass-panel p-6 cursor-pointer hover:border-indigo-500/50 transition-all group relative overflow-hidden flex flex-col"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => openEditModal(project, e)}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(project._id, e)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                  
                  {/* Radial Progress */}
                  {project.totalTasks > 0 && (
                    <div className="w-16 h-16 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            innerRadius={22}
                            outerRadius={30}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300">
                        {project.completionPercentage}%
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>

                <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                      {project.doneTasks}/{project.totalTasks} Tasks
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Users className="w-4 h-4 mr-2 text-sky-400" />
                      {project.members?.length || 0} Members
                    </div>
                  </div>
                  
                  {project.members && project.members.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.members.map((m: any) => (
                        <span key={m._id} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateProject} 
      />

      <EditProjectModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }} 
        onSubmit={handleEditProject} 
        project={projectToEdit}
      />
    </div>
  );
}
