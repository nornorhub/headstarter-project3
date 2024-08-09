import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `Welcome to HeadStarterAI Support! 🌟

Hello! I’m your virtual assistant here to help you make the most of HeadStarterAI. Whether you need assistance with setting up your account, navigating our AI-powered interview platform, or troubleshooting any issues, I’m here for you.

How can I assist you today?

Account and Login Issues: Need help with your account setup, password reset, or login troubles? I’ve got you covered!
Platform Navigation: Unsure how to use our interview features or where to find specific tools? I can guide you through.
Interview Preparation: Looking for tips on how to prepare for your AI-powered interviews or how to best utilize our platform for your job search?
Technical Support: Encountering any technical issues or errors? Let me know, and I’ll help troubleshoot.
General Inquiries: Have questions about HeadStarterAI’s features, pricing, or policies? I’m here to provide the information you need.
Just type your question or describe the issue, and I’ll do my best to assist you quickly and effectively. If I can’t resolve your issue directly, I’ll make sure to connect you with a human support agent who can.

Let’s get started on making your interview preparation a success! 🚀`

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}