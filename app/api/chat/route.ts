import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = 'asst_S9t6Xm5W0KUDqq9VXhn5TPY9';

export async function POST(request: Request) {
  try {
    const { message, threadId } = await request.json();

    // Use existing thread or create new one
    const currentThread = threadId ? 
      threadId : 
      (await openai.beta.threads.create()).id;

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(currentThread, {
      role: 'user',
      content: message,
    });

    // Run the Assistant
    const run = await openai.beta.threads.runs.create(currentThread, {
      assistant_id: ASSISTANT_ID,
    });

    // Wait for the completion with timeout
    let runStatus = await openai.beta.threads.runs.retrieve(currentThread, run.id);
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(currentThread, run.id);
      attempts++;
      
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        throw new Error(`Assistant run ${runStatus.status}`);
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Assistant run timed out');
    }

    // Get the messages
    const messages = await openai.beta.threads.messages.list(currentThread);
    const lastMessage = messages.data[0];

    if (!lastMessage || !lastMessage.content || lastMessage.content.length === 0) {
      throw new Error('No response from assistant');
    }

    const messageContent = lastMessage.content[0];
    if (messageContent.type !== 'text') {
      throw new Error('Unexpected response type from assistant');
    }

    return NextResponse.json({
      response: messageContent.text.value,
      threadId: currentThread
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 