import { SessionCard } from './SessionCard';
import { mockSessions } from '../data/mockData';

export function Feed() {
  return (
    <div className="space-y-2">
      {mockSessions.map((session, index) => (
        <SessionCard key={session.id} session={session} index={index} />
      ))}
    </div>
  );
}