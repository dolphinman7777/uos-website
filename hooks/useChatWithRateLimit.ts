import { useState, useCallback } from 'react';

export function useChatWithRateLimit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, threadId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Send message to queue
      const queueResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, threadId }),
      }).then(res => res.json());

      if (queueResponse.error) {
        throw new Error(queueResponse.error);
      }

      const { requestId } = queueResponse;

      // Poll for result
      while (true) {
        const resultResponse = await fetch(`/api/chat?requestId=${requestId}`).then(res => res.json());

        if (resultResponse.error) {
          throw new Error(resultResponse.error);
        }

        if (resultResponse.status === 'queued' || resultResponse.status === 'processing') {
          // Wait before polling again
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // We have a result
        return resultResponse;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
} 