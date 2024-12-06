import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The Assistant ID you provided
const ASSISTANT_ID = 'asst_S9t6Xm5W0KUDqq9VXhn5TPY9';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  try {
    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: lastMessage.content,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed');
      }
    }

    // Get the messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastAssistantMessage = messages.data
      .filter(msg => msg.role === 'assistant')
      .pop();

    if (!lastAssistantMessage || !lastAssistantMessage.content[0]) {
      throw new Error('No response from assistant');
    }

    const content = lastAssistantMessage.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from assistant');
    }

    // Return the response as a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(content.text.value));
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error processing your request', { status: 500 });
  }
} 