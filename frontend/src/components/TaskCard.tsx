import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, AlertCircle, Trash2, User, Edit } from 'lucide-react';

interface TaskCardProps {
  task: any;
  index: number;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (task: any) => void;
}

export default function TaskCard({ task, index, isAdmin, onDelete, onEdit }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const hasAssignees = task.assignees && task.assignees.length > 0;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`glass-card p-4 mb-3 cursor-grab active:cursor-grabbing group relative ${
            snapshot.isDragging ? 'shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500/50 transform scale-[1.02] z-50' : ''
          }`}
          style={provided.draggableProps.style}
        >
          {isAdmin && (
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-md bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white"
                title="Edit Task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onDelete(task._id)}
                className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-start mb-2 pr-16">
            <h4 className="font-semibold text-slate-100 leading-tight">{task.title}</h4>
          </div>
          
          {task.description && (
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border ${getPriorityColor(task.priority)} flex items-center`}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {task.priority}
              </span>
              
              {hasAssignees && task.assignees.map((assignee: any) => (
                <span key={assignee._id || assignee} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 text-indigo-400 flex items-center" title="Assignee">
                  <User className="w-3 h-3 mr-1" />
                  {assignee.name || 'Assigned'}
                </span>
              ))}
            </div>

            {task.deadline && (
              <span className="text-xs font-medium text-slate-400 flex items-center bg-slate-800/50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 mr-1 text-indigo-400" />
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
