'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '../../components/ui/icons';
import { TagsModal, Tag, TagColor } from '../../components/tags-modal';
import { DecksResponse } from '@/app/lib/types';

export function SidebarTagsSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecks() {
      try {
        const response = await fetch('/api/decks');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: DecksResponse = await response.json();

        const convertedTags: Tag[] = data.decks.map(deck => ({
          id: deck.id,
          name: deck.title,
          color: (deck.color || '#137fec') as TagColor,
        }));

        setTags(convertedTags);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDecks();
  }, []);

  const handleUpdateTags = async (addedTag: Tag) => {
    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addedTag.name,
          description: '',
          color: addedTag.color,
          isPublic: false,
        }),
      });

      if (response.ok) {
        // Refetch all decks from database to get fresh state
        await refreshDecks();
        return;
      }
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleDeleteTags = async (tagId: string) => {
    try {
      await fetch(`/api/decks/${tagId}`, { method: 'DELETE' });
      // Refetch all decks from database to get fresh state
      await refreshDecks();
      return;
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  }

  const refreshDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      if (response.ok) {
        const data: DecksResponse = await response.json();
        const convertedTags: Tag[] = data.decks.map(deck => ({
          id: deck.id,
          name: deck.title,
          color: (deck.color || '#137fec') as TagColor,
        }));
        setTags(convertedTags);
      }
    } catch (error) {
      console.error('Error refetching decks:', error);
    }
  };

  return (
    <>
      <div className="px-5 py-4">
        <div className="text-sm font-semibold text-gray-700 mb-4">
          Tags ({tags.length})
        </div>

        {loading ? (
          <div className="text-sm text-gray-400">Loading tags...</div>
        ) : (
          <div>
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="flex items-center w-full h-10 px-3 rounded-md mb-2 text-left hover:bg-gray-50 transition-colors group"
              >
                <div
                  className="w-3 h-3 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {tag.name}
                </span>
              </button>
            ))}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center w-full h-10 px-3 rounded-md text-left text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="w-[18px] h-[22px] shrink-0 text-gray-400" />
              <span className="ml-2 text-sm font-medium">New Tag</span>
            </button>
          </div>
        )}
      </div>

      <TagsModal
        isOpen={isOpen}
        onClose={() => {
          refreshDecks()
          setIsOpen(false)
        }}
        tags={tags}
        onCreate={handleUpdateTags}
        onDelete={handleDeleteTags}
      />
    </>
  );
}
