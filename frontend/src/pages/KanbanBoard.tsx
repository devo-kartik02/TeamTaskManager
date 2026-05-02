import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { fetchWithAuth } from '../utils/api';
import { toast } from 'sonner';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { Plus, Filter } from 'lucide-react';

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
  const [filter, setFilter] = useState<'All' | 'My'>('All');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'Admin');
        setUserId(user.id || user._id);
      } catch (e) {}
    }
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchWithAuth('/tasks');
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
      const newTask = await fetchWithAuth('/tasks', {
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
    try {
      await fetchWithAuth(`/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task. Make sure you are an Admin.');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    const isUnassigned = !t.assignees || t.assignees.length === 0;
    const isAssignedToMe = t.assignees?.some((a: any) => (a._id || a) === userId);
    return isUnassigned || isAssignedToMe;
  });

  if (loading) return <div className="p-8 text-center text-slate-400">Loading board...</div>;

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Project Board</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-slate-400 flex items-center">
              <Filter className="w-4 h-4 mr-1" /> View:
            </span>
            <div className="bg-black/20 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setFilter('All')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filter === 'All' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setFilter('My')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filter === 'My' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                My & Team Tasks
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 h-10"
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
