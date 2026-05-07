import { useRouter } from 'next/navigation';

interface ReviewErrorViewProps {
  error: string;
}

export function ReviewErrorView({ error }: ReviewErrorViewProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
