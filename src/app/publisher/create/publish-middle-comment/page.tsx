import React, { Suspense } from 'react';
import PublishMiddleCommentForm from '@/components/client/PublishMiddleCommentForm';

export default function PublishTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublishMiddleCommentForm />
    </Suspense>
  );
}