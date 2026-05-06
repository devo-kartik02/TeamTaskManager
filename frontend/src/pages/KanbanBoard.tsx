import { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { fetchWithAuth } from '../utils/api';
import { toast } from 'sonner';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { Plus, Filter, Search, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-sky-500' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-500' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string>('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [boardView, setBoardView] = useState<'All' | 'My'>('All');
  const [users, setUsers] = useState<any[]>([]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'Admin');
        setUserId(user.id || user._id);
      } catch (e) {}
    }
    loadUsers();
    loadTasks();
  }, [projectId]);

  const loadUsers = async () => {
    try {
      const data = await fetchWithAuth('/users');
      setUsers(data);
    } catch (e) {}
  };

  const loadTasks = async () => {
    try {
      let url = '/tasks';
      if (projectId) url += `?projectId=${projectId}`;
      const data = await fetchWithAuth(url);
      setTasks(data);
    } catch (error: any) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedTask = tasks.find((t) => t._id === draggableId);
    if (!movedTask) return;

    const updatedTasks = Array.from(tasks);
    updatedTasks.splice(tasks.indexOf(movedTask), 1);
    
    const destTasks = updatedTasks.filter((t) => t.status === destination.droppableId);
    destTasks.splice(destination.index, 0, movedTask);
    
    const newStatus = destination.droppableId;
    
    setTasks((prev) => 
      prev.map((t) => {
        if (t._id === draggableId) {
          return { ...t, status: newStatus };
        }
        return t;
      })
    );

    try {
      await fetchWithAuth(`/tasks/${draggableId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success('Task moved');
    } catch (error) {
      toast.error('Failed to move task');
      loadTasks();
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      if (projectId) taskData.projectId = projectId;
      await fetchWithAuth('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      // The backend returns an unpopulated assignee array. Reload tasks to populate assignees.
      await loadTasks();
      toast.success('Task created successfully!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async (id: string, taskData: any) => {
    try {
      await fetchWithAuth(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
      await loadTasks();
      toast.success('Task updated successfully!');
      setIsEditModalOpen(false);
      setTaskToEdit(null);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const openEditModal = (task: any) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    // Save state for undo
    const prevTasks = [...tasks];
    
    // Optimistic update
    setTasks(tasks.filter((t) => t._id !== id));

    toast.success('Task deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          // Revert optimistic update
          setTasks(prevTasks);
          toast.success('Task restored');
        }
      },
      onAutoClose: async () => {
        // If not undone, actually delete from server
        try {
          const res = await fetchWithAuth(`/tasks/${id}`, { method: 'DELETE' });
          if (!res) throw new Error('Delete failed'); // res is null on 204
        } catch (error) {
          // If server fails, revert
          setTasks(prevTasks);
          toast.error('Failed to delete task permanently.');
        }
      }
    });
  };

  const filteredTasks = tasks.filter(t => {
    // 1. Board View Filter
    if (boardView === 'My') {
      const isAssignedToMe = t.assignees?.some((a: any) => (a._id || a) === userId);
      if (!isAssignedToMe) return false;
    }
    // 2. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = t.title?.toLowerCase().includes(q);
      const matchesDesc = t.description?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc) return false;
    }
    // 3. Priority
    if (priorityFilter && t.priority !== priorityFilter) return false;
    // 4. Assignee
    if (assigneeFilter) {
      const hasAssignee = t.assignees?.some((a: any) => a._id === assigneeFilter || a === assigneeFilter);
      if (!hasAssignee) return false;
    }
    return true;
  });

  if (loading) return <div className="p-8 text-center text-slate-400">Loading board...</div>;

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {projectId ? 'Project Board' : 'Global Board'}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-black/20 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/5">
              <Filter className="w-4 h-4 text-slate-400 ml-1" />
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-300 outline-none border-none cursor-pointer"
              >
                <option value="" className="bg-slate-800">All Priorities</option>
                <option value="Low" className="bg-slate-800">Low</option>
                <option value="Medium" className="bg-slate-800">Medium</option>
                <option value="High" className="bg-slate-800">High</option>
              </select>

              <div className="w-px h-4 bg-white/10 mx-1"></div>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-300 outline-none border-none cursor-pointer max-w-[120px]"
              >
                <option value="" className="bg-slate-800">All Assignees</option>
                {users.map(u => (
                  <option key={u._id} value={u._id} className="bg-slate-800">{u.name}</option>
                ))}
              </select>
            </div>

            {/* Board View */}
            <div className="bg-black/20 p-1 rounded-lg inline-flex border border-white/5">
              <button
                onClick={() => setBoardView('All')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  boardView === 'All' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setBoardView('My')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  boardView === 'My' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                My Tasks
              </button>
            </div>
            
            {(searchQuery || priorityFilter || assigneeFilter || boardView !== 'All') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('');
                  setAssigneeFilter('');
                  setBoardView('All');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center"
              >
                <X className="w-3 h-3 mr-1" /> Clear
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 h-10 whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-1" /> New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-[calc(100vh-160px)] overflow-x-auto pb-6">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div key={col.id} className="min-w-[320px] w-[320px] flex flex-col glass-panel overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${col.color}`} />
                    <h3 className="font-semibold text-slate-200">{col.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-black/40 px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-4 overflow-y-auto transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard 
                          key={task._id} 
                          task={task} 
                          index={index} 
                          isAdmin={isAdmin}
                          onDelete={handleDeleteTask}
                          onEdit={openEditModal}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateTask} 
      />

      <EditTaskModal
        task={taskToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleEditTask}
      />
    </div>
  );
}
