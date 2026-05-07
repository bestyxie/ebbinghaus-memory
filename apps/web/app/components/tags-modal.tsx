"use client";

import { useState } from "react";
import { X, Tag, Plus, Trash2 } from "lucide-react";

export type TagColor =
  | "#137fec"
  | "#ff5733"
  | "#33ff57"
  | "#f333ff"
  | "#ffbd33"
  | "#33f0ff"
  | "#10b981";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreate: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
}

const TAG_COLORS: TagColor[] = [
  "#137fec",
  "#ff5733",
  "#33ff57",
  "#f333ff",
  "#ffbd33",
  "#33f0ff",
  "#10b981",
];

export function TagsModal({ isOpen, onClose, tags, onCreate: onUpdateTags, onDelete }: TagsModalProps) {
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState<TagColor>("#137fec");

  if (!isOpen) return null;

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: `deck-temp-${Date.now()}`,
      name: newTagName.trim(),
      color: selectedColor,
    };

    onUpdateTags(newTag);
    setNewTagName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[558px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Tag className="w-6 h-[28px] text-slate-900" />
            </div>
            <h2 className="text-xl font-bold tracking-[-0.5px] text-slate-900">
              Manage Tags
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Create New Tag Section */}
          <div className="bg-slate-50/50 border-b border-slate-100 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.7px] text-slate-900 mb-4">
              Create New Tag
            </h3>

            <div className="flex flex-col gap-4">
              {/* Tag Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">
                  Tag Name
                </label>
                <div className="bg-white border border-slate-200 rounded-lg h-11 px-4 py-3 flex items-center">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g., Biology, Medical Terminology"
                    className="flex-1 bg-transparent outline-none text-base text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-3 py-1">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                      style={{
                        backgroundColor: color,
                        ...(selectedColor === color
                          ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${color}` }
                          : {}),
                      }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Create Tag Button */}
              <button
                onClick={handleCreateTag}
                className="bg-[#137fec] h-11 rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
                <span className="text-base font-bold text-white">Create Tag</span>
              </button>
            </div>
          </div>

          {/* Your Tags Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.7px] text-slate-900">
                Your Tags ({tags.length})
              </h3>
            </div>

            <div className="flex flex-col gap-1">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-base font-medium text-slate-600">
                      {tag.name}
                    </span>
                  </div>

                  {/* Action Buttons - Visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onDelete(tag.id)}
                      className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"
                      aria-label="Delete tag"
                    >
                      <Trash2 className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}

              {tags.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No tags created yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing tags modal state
export function useTagsModal(initialTags: Tag[] = []) {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>(initialTags);

  return {
    isOpen,
    tags,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    updateTags: (newTags: Tag[]) => setTags(newTags),
    setTags,
  };
}
