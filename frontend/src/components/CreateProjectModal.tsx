import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: any) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([]);
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({ title, description, members });
    setTitle('');
    setDescription('');
    setMembers([]);
  };

  const handleMemberToggle = (userId: string) => {
    if (members.includes(userId)) {
      setMembers(members.filter(id => id !== userId));
    } else {
      setMembers([...members, userId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel p-6 w-full max-w-md shadow-2xl shadow-indigo-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Create New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white"
              placeholder="e.g., Website Redesign"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white h-24 resize-none"
              placeholder="What is this project about?"
            />
          </div>
            
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Team Members</label>
            <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-800/50 p-2 rounded-lg border border-slate-600">
              {users.map(u => (
                <label key={u._id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-white/5 rounded">
                  <input 
                    type="checkbox" 
                    checked={members.includes(u._id)}
                    onChange={() => handleMemberToggle(u._id)}
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
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
