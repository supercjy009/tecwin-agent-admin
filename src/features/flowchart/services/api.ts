'use server'

import { NodeData, ApiResponse, DifyApiResponse } from '../types/types'

// API endpoints
const API_ENDPOINTS = {
  URL: 'http://127.0.0.1:7860/api/v1/run/1e9960df-6b9d-48eb-81c2-26af9e877f50?stream=false',
  YOUTUBE:
    'http://127.0.0.1:7860/api/v1/run/13b817f9-1478-4f5a-8775-c6f4de8019e7?stream=false',
  PROMPT:
    // "http://127.0.0.1:7860/api/v1/run/4d0b2b50-b0b9-4661-b9dc-9ae144a85a58?stream=false",
    '/api/v1/chat-messages',
}

// Helper function to determine the input type
function determineInputType(input: string): 'URL' | 'YOUTUBE' | 'PROMPT' {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
  const urlRegex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

  if (youtubeRegex.test(input)) {
    return 'YOUTUBE'
  } else if (urlRegex.test(input)) {
    return 'URL'
  } else {
    return 'PROMPT'
  }
}

function extractJsonBlock(input: string): string {
  const match = input.match(/```json([\s\S]*)```/) // 匹配 ````json` 到 ```` 之间的内容
  return match ? match[1].trim() : '' // 返回匹配的内容，去除前后空格
}

function test() {
  let input = '<div><think>需要移除的内容</think>其他内容</div>'
  input = input.replace(/<think>[\s\S]*?<\/think>/gi, '')
  console.log('input...' + input)
}

function extractCodeBlock(input: string): string {
  input = input.replace(/<think>[\s\S]*?<\/think>/gi, '')
  console.log('去掉think以后的input:', input)
  input = input.replace('mermaid', '').replaceAll(/"/g, '')
  // 使用正则表达式匹配三个反引号后面的内容，直到遇到下一个三个反引号
  const regex = /```([\s\S]*?)```/
  const match = input.match(regex)
  if (match && match[1]) {
    return match[1].trim() // 返回匹配的内容并去除首尾空白字符
  }
  return ''
}

const escapeLabel = (text: string): string => {
  // 转义双引号
  let escapedText = text.replaceAll(/"/g, '\\"')

  // 转义大括号
  escapedText = escapedText.replaceAll('{', '')
  escapedText = escapedText.replaceAll('}', '')

  // 转义中括号
  escapedText = escapedText.replaceAll('[', '')
  escapedText = escapedText.replaceAll(']', '')
  // 如果还有其他需要转义的字符，可以继续添加
  return escapedText
}

// Function to call the appropriate API based on input type
export async function generateMindMap(input: string): Promise<string> {
  // test()
  // return ''
  input = escapeLabel(input)
  const inputType = determineInputType(input)
  console.log('Input type:', inputType)
  const endpoint = API_ENDPOINTS[inputType]
  try {
    // const response = await fetch(endpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": "Bearer <your api key>",
    //     // "x-api-key": <your api key>,
    //   },
    //   body: JSON.stringify({
    //     input_value: input,
    //     output_type: "chat",
    //     input_type: "chat",
    //     tweaks: {},
    //   }),
    // });
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <your api key>',
      },
      body: JSON.stringify({
        inputs: { text: input },
        query: input,
        user: 'greatshu',
        response_mode: 'blocking',
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data: DifyApiResponse = await response.json()
    // Log the full response for debugging
    console.log('Full API response:', JSON.stringify(data, null, 2))

    // Extract the JSON string from the nested response
    const mindMapString = data.answer

    if (!mindMapString) {
      throw new Error('No mind map data received from API')
    }
    // const mindMapJsonString = extractJsonBlock(mindMapString)
    // Parse the JSON string into an object
    // console.log('Parsed mind map data:', mindMapJsonString)
    // const parsedData: NodeData = JSON.parse(mindMapJsonString)
    let parsedData = extractCodeBlock(mindMapString)
    parsedData = parsedData.replaceAll('(', '')
    parsedData = parsedData.replaceAll(')', '')
    console.log('Parsed mind map data:', parsedData)
    return parsedData
  } catch (error) {
    console.error('Error calling API:', error)
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON received:', error.message)
    }
    throw error
  }
}
