
import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2 } from 'lucide-react';
import { db } from '../services/database';
import { ChecklistItem } from '../types';

const RamadanChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    db.checklist.get().then(setItems);
  }, []);

  const toggleItem = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
    setItems(updated);
    db.checklist.save(updated);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const item: ChecklistItem = {
        id: Date.now().toString(),
        text: newItem,
        completed: false,
        isDefault: false
    };
    const updated = [...items, item];
    setItems(updated);
    db.checklist.save(updated);
    setNewItem('');
  };

  const deleteItem = (id: string) => {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      db.checklist.save(updated);
  };

  return (
    <div className="glass-card rounded-[2rem] p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <CheckSquare size={20} />
            </div>
            <div>
                <h3 className="font-bold text-white">দৈনিক আমল</h3>
                <p className="text-xs text-white/50">চেকলিস্ট</p>
            </div>
        </div>

        <div className="space-y-3 mb-4">
            {items.map(item => (
                <div key={item.id} className="flex items-center justify-between group">
                    <button 
                        onClick={() => toggleItem(item.id)}
                        className="flex items-center gap-3 text-left flex-1"
                    >
                        {item.completed ? (
                            <CheckSquare size={20} className="text-avex-lime min-w-[20px]" />
                        ) : (
                            <Square size={20} className="text-white/20 min-w-[20px]" />
                        )}
                        <span className={`text-sm ${item.completed ? 'text-white/30 line-through' : 'text-white'}`}>
                            {item.text}
                        </span>
                    </button>
                    {!item.isDefault && (
                        <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 p-2">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
            <input 
                type="text" 
                value={newItem} 
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="নতুন আমল যুক্ত করুন..." 
                className="bg-transparent text-sm text-white placeholder-white/30 flex-1 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <button onClick={addItem} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-avex-lime">
                <Plus size={16} />
            </button>
        </div>
    </div>
  );
};

export default RamadanChecklist;
