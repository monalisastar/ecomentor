import { Loader2 } from 'lucide-react'

export default function ProfileLoader() {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="animate-spin h-8 w-8 text-green-600" />
    </div>
  )
}
