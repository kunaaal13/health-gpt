import { OpenAIEmbeddings } from '@langchain/openai'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'

const API_KEY = ''

async function getVectorStore() {
  // Use Cheerio to scrape content from webpage and create documents
  // const loader = new CheerioWebBaseLoader(
  //   'https://js.langchain.com/docs/expression_language/'
  // )

  const loader = new DirectoryLoader('src/app/', {
    '.txt': (path) => new TextLoader(path),
  })

  // const loader = new PuppeteerWebBaseLoader('https://basil.health/menu/')
  //   const loader = new PlaywrightWebBaseLoader('https://basil.health/menu/')
  const docs = await loader.load()

  console.log(docs)

  // Text Splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 2,
  })
  const splitDocs = await splitter.splitDocuments(docs)
  console.log(splitDocs)

  // Instantiate Embeddings function
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: API_KEY,
  })

  // Create Vector Store
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  )

  return vectorstore
}

export { getVectorStore }
