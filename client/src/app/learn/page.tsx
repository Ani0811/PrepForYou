import { Suspense } from 'react';
import StudyPage from '../pages/learn/LessonsPage';

export default function LearnPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <StudyPage />
        </Suspense>
    );
}
