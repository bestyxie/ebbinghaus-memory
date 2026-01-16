import { auth } from '@/auth'
import CreateMemoryItemBtn from './components/createBtn';

export default async function DashboardPage() {
  const session = await auth();
  console.log('session=======', session)
  return (
    <div>
      Dashboard
      <div className="mt-[20px]">
        <CreateMemoryItemBtn />
      </div>
    </div>
  )
}