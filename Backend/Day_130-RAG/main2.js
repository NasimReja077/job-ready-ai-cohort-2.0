import dotenv from "dotenv";
dotenv.config();

import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import fs from 'fs';

import { Pinecone } from '@pinecone-database/pinecone'
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("rag-pdf-index")

let dataBuffer = fs.readFileSync('./story.pdf');

const parser = new PDFParse({
    data: dataBuffer
})

const data = await parser.getText()

const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed"
})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
})

// create chunks using pdf read
const chunks = await splitter.splitText(data.text)
// const docs = await embeddings.embedQuery(chunks)
// const docs = await embeddings.embedDocuments(chunks);

// object
const docs = await Promise.all(chunks.map(async (chunk) => {
    const embedding = await embeddings.embedQuery(chunk)
    return {
        text: chunk,
        embedding
    }
}))

// console.log(docs); // 1024

// store in VDB
const result = await index.upsert({
    records: docs.map((doc, i) => ({
        id: `doc-${i}`,
        values: doc.embedding,
        metadata: {
            text: doc.text
        }
    }))
})

console.log(result);