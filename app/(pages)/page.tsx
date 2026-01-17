import { TagsModal, useTagsModal, type TagColor } from "../components/tags-modal";

// Example initial tags
const INITIAL_TAGS = [
  { id: "1", name: "Biology 101", color: "#137fec" as TagColor },
  { id: "2", name: "Spanish Verbs", color: "#ff5733" as TagColor },
  { id: "3", name: "Coding Syntax", color: "#ffbd33" as TagColor },
  { id: "4", name: "History Facts", color: "#10b981" as TagColor },
  { id: "5", name: "General Knowledge", color: "#f333ff" as TagColor },
  { id: "6", name: "Personal Notes", color: "#33f0ff" as TagColor },
];

export default function Home() {
  const { isOpen, tags, openModal, closeModal, updateTags } =
    useTagsModal(INITIAL_TAGS);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold">Ebbinghaus Memory</h1>
        <p className="text-slate-600 max-w-md">
          Spaced repetition flashcard app. Click the button below to open the
          Tags Modal (from Figma design).
        </p>

        <button
          onClick={openModal}
          className="px-6 py-3 bg-[#137fec] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
          Manage Tags
        </button>

        {/* Display current tags */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-3">Current Tags:</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <TagsModal
          isOpen={isOpen}
          onClose={closeModal}
          tags={tags}
          onUpdateTags={updateTags}
        />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-sm text-slate-400">
          Built with Next.js 15, Prisma, and Tailwind CSS 4
        </span>
      </footer>
    </div>
  );
}
