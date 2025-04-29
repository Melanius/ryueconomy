export type CategoryId = 'crypto-morning' | 'invest-insight' | 'real-portfolio' | 'code-lab' | 'daily-log'

export interface NotionPage {
  id: string
  created_time: string
  last_edited_time: string
  properties: {
    Name: {
      title: Array<{
        plain_text: string
      }>
    }
    Slug: {
      rich_text: Array<{
        plain_text: string
      }>
    }
    Published: {
      checkbox: boolean
    }
    Category: {
      select: {
        name: CategoryId
      }
    }
    Views: {
      number: number
    }
  }
} 