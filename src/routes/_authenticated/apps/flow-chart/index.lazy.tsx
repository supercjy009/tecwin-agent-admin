import { createLazyFileRoute } from '@tanstack/react-router'
import FlowChart from '@/features/flowchart'

export const Route = createLazyFileRoute('/_authenticated/apps/flow-chart/')({
  component: FlowChart,
})
