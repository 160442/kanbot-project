import GuardLoader from '@/guards/GuardLoader'

export default function PageLoader({ message }: { message?: string }) {
  return <GuardLoader message={message || 'Loading…'} fullScreen={false} />
}
