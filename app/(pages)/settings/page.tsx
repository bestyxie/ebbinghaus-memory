import TokenManager from './components/TokenManager'

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your account settings and API access.</p>
      <TokenManager />
    </div>
  )
}
