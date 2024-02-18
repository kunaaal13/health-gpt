'use client'

import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className='min-h-dvh w-full'>
      <div className='w-full flex flex-col items-start'>
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'whitespace-pre-wrap mb-3 flex items-center w-full px-5',
              m.role === 'user' ? 'justify-start' : 'justify-end'
            )}
          >
            <div
              className={cn(
                'w-1/2 rounded shadow-xl p-3',
                m.role === 'user' ? 'text-blue-500' : 'text-rose-500'
              )}
            >
              <p>
                {m.role + ': '}

                {m.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className='fixed w-full bottom-0 flex items-center justify-center'
      >
        <input
          className='w-1/2 p-2 mb-8 border border-gray-300 rounded shadow-xl'
          value={input}
          placeholder='Say something...'
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
