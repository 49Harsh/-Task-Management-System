import { Suspense } from 'react';
import TaskDetail from './TaskDetail';

// Next.js types for dynamic route parameters
interface TaskDetailPageProps {
  params: {
    id: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <TaskDetail id={params.id} />
    </Suspense>
  );
} 