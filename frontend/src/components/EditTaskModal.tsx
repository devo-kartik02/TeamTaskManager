import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

interface EditTaskModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, taskData: any) => void;
}

export default function EditTaskModal({ task, isOpen, onClose, onSubmit }: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        try {
          const data = await fetchWithAuth('/users');
          setUsers(data);
        } catch (error) {
          console.error('Failed to load users');
        }
      };
      loadUsers();

      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setPriority(task.priority);
        setAssignees(task.assignees ? task.assignees.map((a: any) => a._id || a) : []);
      }
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit(task._id, { title, description, priority, assignees });
  };

  const handleAssigneeToggle = (userId: string) => {
    if (assignees.includes(userId)) {
      setAssignees(assignees.filter(id => id !== userId));
    } else {
      setAssignees([...assignees, userId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel p-6 w-full max-w-md shadow-2xl shadow-indigo-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Edit Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white appearance-none"
            >
              <option value="Low" className="bg-slate-800">Low</option>
              <option value="Medium" className="bg-slate-800">Medium</option>
              <option value="High" className="bg-slate-800">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Assignees (Co-assign)</label>
            <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-800/50 p-2 rounded-lg border border-slate-600">
              {users.map(u => (
                <label key={u._id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-white/5 rounded">
                  <input 
                    type="checkbox" 
                    checked={assignees.includes(u._id)}
                    onChange={() => handleAssigneeToggle(u._id)}
                    className="rounded text-indigo-500 focus:ring-indigo-500 bg-slate-700 border-slate-500"
                  />
                  <span className="text-sm text-slate-200">{u.name}</span>
                </label>
              ))}
              {users.length === 0 && <span className="text-xs text-slate-400">Loading users...</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
