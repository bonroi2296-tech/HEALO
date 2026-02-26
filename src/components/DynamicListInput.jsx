"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

export const DynamicListInput = ({ items, onAdd, onRemove, placeholder, icon: Icon }) => {
    const [newItem, setNewItem] = useState('');
    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem('');
        }
    };
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    {Icon && <Icon size={16} className="absolute left-3 top-3 text-gray-400"/>}
                    <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())} className={`w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition ${Icon ? 'pl-10' : ''}`} placeholder={placeholder} />
                </div>
                <button type="button" onClick={handleAdd} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-lg font-bold text-sm transition">추가</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {Array.isArray(items) && items.map((item, idx) => (
                    <span key={idx} className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-teal-100">
                        {item} <button type="button" onClick={() => onRemove(idx)} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                ))}
            </div>
        </div>
    );
};
