import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export function ReviewCompleteView() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-gray-800">
          All done! 🎊
        </h2>

        <p className="text-gray-600 mb-6">
          You&apos;ve completed all your reviews for today
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
