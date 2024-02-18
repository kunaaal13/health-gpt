import {
  OpenAIStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
} from 'ai'
import { NextRequest } from 'next/server'

import { getVectorStore } from '@/lib/vectors'
import OpenAI from 'openai'

const API_KEY = ''

// // Set the runtime to edge for best performance
// export const runtime = 'edge'

// Template for the prompt
const Template = `You are a health care professional named Kunni. Whenever a person greets you, you will respond with a greeting, tell them your name, and occupation and ask them how you can help them. The patient will tell you about their symptoms and you will ask them questions to diagnose their condition. You will suggest patient some food and exercises to improve their health conditions and if possible suggest drinks (menu items) from given context {context}. All responses must be verbose and in Doctor dialect.

Current Conversation: 
{chat_history}

User: {input}
Kunni: 
`

// Message format
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const messages = body.messages ?? []

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content

  // get vector store
  const vectorstore = await getVectorStore()

  // Message similarity
  const results = await vectorstore.similaritySearch(currentMessageContent, 4)

  const openai = new OpenAI({
    apiKey: API_KEY,
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
    stream: true,
    messages: [
      {
        role: 'user',
        content: `You are a health care professional named Kunaaal. Whenever a person greets you, you will respond with a greeting, tell them your name, and occupation and ask them how you can help them. The patient will tell you about their symptoms and you will ask them questions to diagnose their condition. You will suggest patient some exercises to improve their health conditions and always suggest drinks (menu items) from given context {context} that can help in treatment. All responses must be verbose and in Doctor dialect.

Current Conversation: 
${formattedPreviousMessages.join('\n')}

context:   ${results.map((r) => r.pageContent).join('\n\n')}

User: ${currentMessageContent}
Kunaaal: `,
      },
    ],
  })

  const stream = OpenAIStream(response)

  return new StreamingTextResponse(stream)
}

// export async function POST(req: Request) {
//   const body = await req.json()
//   const messages = body.messages ?? []
//   const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
//   const currentMessageContent = messages[messages.length - 1].content

//   // Create the prompt
//   const prompt = PromptTemplate.fromTemplate(Template)

//   // output parser
//   const outputParser = new StringOutputParser()

//   // create the chat model
//   const model = new ChatOpenAI({
//     modelName: 'gpt-3.5-turbo',
//     temperature: 0.6,
//     openAIApiKey: API_KEY,
//     cache: true,
//     streaming: true,
//   }).pipe(outputParser)

//   // Get the vector store
//   const vectorstore = await getVectorStore()

//   // Retrieve the vector store
//   const retriever = vectorstore.asRetriever({
//     k: 2,
//   })

//   // Generate the chai
//   const chain = await createStuffDocumentsChain({
//     llm: model,
//     prompt,
//   })

//   // Create a retrieval chain
//   const retrievalChain = await createRetrievalChain({
//     combineDocsChain: chain,
//     retriever,
//   })

//   // const { stream, handlers } = LangChainStream()

//   const stream = await retrievalChain.stream({
//     chat_history: formattedPreviousMessages.join('\n'),
//     input: currentMessageContent,
//   })

//   // for await (const message of stream) {
//   //   console.log(message)
//   // }

//   return new StreamingTextResponse(stream)
// }
