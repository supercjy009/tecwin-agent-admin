'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast'
import MindMap from '@/components/flowchart/MindMap'
import NodeDetails from '@/components/flowchart/NodeDetails'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { generateMindMap } from './services/api'
import { NodeData } from './types/types'
import { Search } from '@/components/search'

export default function FlowChart() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // const [mindMapData, setMindMapData] = useState<NodeData>({} as NodeData)
  const [mindMapData, setMindMapData] = useState<string>('')

  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [activeTab, setActiveTab] = useState('prompt')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL, YouTube link, or prompt',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    // setMindMapData({} as NodeData)
    setMindMapData('')
    setSelectedNode(null)

    try {
      const data = await generateMindMap(input)
      console.log(data)
      setMindMapData(data)
      toast({
        title: 'Success',
        description: 'Mind map generated successfully',
      })
    } catch (error) {
      console.error('Error generating mind map:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate mind map. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setInput('')
  }

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'url':
        return 'Enter a URL (e.g., https://example.com/article)'
      case 'youtube':
        return 'Enter a YouTube link (e.g., https://youtube.com/watch?v=...)'
      case 'prompt':
        return '填入提示词'
      default:
        return 'Enter input'
    }
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
        </div>
      </Header>
      {/* flex min-h-screen max-w-7xl flex-col p-4 md:p-8 */}
      <Main className='flex min-h-screen flex-col p-4 md:p-8'>
        {/* <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mind Mapper</h1>
        <p className="text-gray-600">Generate interactive mind maps from URLs, YouTube videos, or text prompts</p>
        </header> */}
        <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
          <div className='lg:col-span-1'>
            <div className='rounded-lg border bg-white p-6 shadow-sm'>
              <Tabs defaultValue='prompt' onValueChange={handleTabChange}>
                <TabsList className='mb-4 grid grid-cols-1'>
                  {/* <TabsTrigger value='youtube'>YouTube</TabsTrigger> */}
                  {/* <TabsTrigger value="url">URL</TabsTrigger> */}
                  <TabsTrigger value='prompt'>Prompt</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='input'>输入</Label>
                    <Textarea
                      id='input'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={getPlaceholder()}
                      disabled={isLoading}
                    />
                  </div>

                  <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Generating...' : '生成思维导图'}
                  </Button>
                </form>
              </Tabs>

              {selectedNode && (
                <div className='mt-6'>
                  <h3 className='mb-2 text-lg font-medium'>Node Details</h3>
                  <NodeDetails node={selectedNode} />
                </div>
              )}
            </div>
          </div>

          <div className='h-[600px] overflow-hidden rounded-lg border bg-white shadow-sm lg:col-span-2'>
            <MindMap data={mindMapData} onNodeClick={handleNodeClick} />
          </div>
        </div>

        <Toaster />
      </Main>
    </>
  )
}
