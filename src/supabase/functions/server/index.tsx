import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Authentication routes
app.post('/make-server-22ef7db9/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since no email server configured
    })
    
    if (error) {
      return c.json({ error: error.message }, 400)
    }
    
    return c.json({ user: data.user })
  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Chat routes using KV store
app.get('/make-server-22ef7db9/messages', async (c) => {
  try {
    const messages = await kv.getByPrefix('message:') || []
    
    // Sort messages by timestamp
    const sortedMessages = messages
      .map(msg => JSON.parse(msg))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    return c.json({ messages: sortedMessages })
  } catch (error) {
    console.error('Get messages error:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

app.post('/make-server-22ef7db9/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { content, user_name } = await c.req.json()
    
    const message = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: user_name || user.user_metadata?.name || 'Unknown User',
      content,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`message:${message.id}`, JSON.stringify(message))
    
    return c.json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

// Tasks routes using KV store
app.get('/make-server-22ef7db9/tasks', async (c) => {
  try {
    const tasks = await kv.getByPrefix('task:') || []
    
    const parsedTasks = tasks
      .map(task => JSON.parse(task))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return c.json({ tasks: parsedTasks })
  } catch (error) {
    console.error('Get tasks error:', error)
    return c.json({ error: 'Failed to fetch tasks' }, 500)
  }
})

app.post('/make-server-22ef7db9/tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { title, assignee_name, due_date, priority, source } = await c.req.json()
    
    const task = {
      id: crypto.randomUUID(),
      title,
      assignee_name,
      due_date,
      priority: priority || 'medium',
      completed: false,
      source: source || 'manual',
      created_by: user.id,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`task:${task.id}`, JSON.stringify(task))
    
    return c.json({ task })
  } catch (error) {
    console.error('Create task error:', error)
    return c.json({ error: 'Failed to create task' }, 500)
  }
})

app.put('/make-server-22ef7db9/tasks/:id', async (c) => {
  try {
    const taskId = c.req.param('id')
    const { completed } = await c.req.json()
    
    const existingTask = await kv.get(`task:${taskId}`)
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404)
    }
    
    const task = JSON.parse(existingTask)
    task.completed = completed
    
    await kv.set(`task:${taskId}`, JSON.stringify(task))
    
    return c.json({ task })
  } catch (error) {
    console.error('Update task error:', error)
    return c.json({ error: 'Failed to update task' }, 500)
  }
})

// Polls routes using KV store
app.get('/make-server-22ef7db9/polls', async (c) => {
  try {
    const polls = await kv.getByPrefix('poll:') || []
    const votes = await kv.getByPrefix('vote:') || []
    
    // Process polls with vote counts
    const pollsWithVotes = polls.map(pollData => {
      const poll = JSON.parse(pollData)
      const pollVotes = votes
        .map(voteData => JSON.parse(voteData))
        .filter(vote => vote.poll_id === poll.id)
      
      const voteCounts: { [key: number]: number } = {}
      let totalVotes = 0
      
      pollVotes.forEach(vote => {
        voteCounts[vote.option_index] = (voteCounts[vote.option_index] || 0) + 1
        totalVotes++
      })
      
      return {
        ...poll,
        votes: voteCounts,
        totalVotes
      }
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return c.json({ polls: pollsWithVotes })
  } catch (error) {
    console.error('Get polls error:', error)
    return c.json({ error: 'Failed to fetch polls' }, 500)
  }
})

app.post('/make-server-22ef7db9/polls', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { question, options } = await c.req.json()
    
    const poll = {
      id: crypto.randomUUID(),
      question,
      options,
      creator_id: user.id,
      creator_name: user.user_metadata?.name || 'Unknown User',
      is_active: true,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`poll:${poll.id}`, JSON.stringify(poll))
    
    return c.json({ poll: { ...poll, votes: {}, totalVotes: 0 } })
  } catch (error) {
    console.error('Create poll error:', error)
    return c.json({ error: 'Failed to create poll' }, 500)
  }
})

app.post('/make-server-22ef7db9/polls/:id/vote', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const pollId = c.req.param('id')
    const { option_index } = await c.req.json()
    
    const vote = {
      id: crypto.randomUUID(),
      poll_id: pollId,
      user_id: user.id,
      option_index,
      created_at: new Date().toISOString()
    }
    
    // Store vote with user+poll as key to prevent duplicate voting
    await kv.set(`vote:${pollId}:${user.id}`, JSON.stringify(vote))
    
    return c.json({ vote })
  } catch (error) {
    console.error('Vote error:', error)
    return c.json({ error: 'Failed to record vote' }, 500)
  }
})

// Action items routes using KV store
app.get('/make-server-22ef7db9/action-items', async (c) => {
  try {
    const actionItems = await kv.getByPrefix('action:') || []
    
    const parsedItems = actionItems
      .map(item => JSON.parse(item))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return c.json({ actionItems: parsedItems })
  } catch (error) {
    console.error('Get action items error:', error)
    return c.json({ error: 'Failed to fetch action items' }, 500)
  }
})

app.post('/make-server-22ef7db9/action-items', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { task, assignee_name, due_date, priority, extracted_from } = await c.req.json()
    
    const actionItem = {
      id: crypto.randomUUID(),
      task,
      assignee_name,
      due_date,
      priority: priority || 'medium',
      status: 'pending',
      extracted_from,
      created_by: user.id,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`action:${actionItem.id}`, JSON.stringify(actionItem))
    
    return c.json({ actionItem })
  } catch (error) {
    console.error('Create action item error:', error)
    return c.json({ error: 'Failed to create action item' }, 500)
  }
})

app.put('/make-server-22ef7db9/action-items/:id', async (c) => {
  try {
    const itemId = c.req.param('id')
    const { status } = await c.req.json()
    
    const existingItem = await kv.get(`action:${itemId}`)
    if (!existingItem) {
      return c.json({ error: 'Action item not found' }, 404)
    }
    
    const actionItem = JSON.parse(existingItem)
    actionItem.status = status
    
    await kv.set(`action:${itemId}`, JSON.stringify(actionItem))
    
    return c.json({ actionItem })
  } catch (error) {
    console.error('Update action item error:', error)
    return c.json({ error: 'Failed to update action item' }, 500)
  }
})

// Health check
app.get('/make-server-22ef7db9/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Meeting routes using KV store
app.get('/make-server-22ef7db9/meetings', async (c) => {
  try {
    const meetings = await kv.getByPrefix('meeting:') || []
    
    const parsedMeetings = meetings
      .map(meeting => JSON.parse(meeting))
      .filter(meeting => meeting.is_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return c.json({ meetings: parsedMeetings })
  } catch (error) {
    console.error('Get meetings error:', error)
    return c.json({ error: 'Failed to fetch meetings' }, 500)
  }
})

app.post('/make-server-22ef7db9/meetings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { name, password } = await c.req.json()
    
    const meeting = {
      id: crypto.randomUUID(),
      name,
      password: password || null,
      creator_id: user.id,
      creator_name: user.user_metadata?.name || 'Unknown User',
      participant_count: 1,
      is_active: true,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`meeting:${meeting.id}`, JSON.stringify(meeting))
    
    return c.json({ meeting })
  } catch (error) {
    console.error('Create meeting error:', error)
    return c.json({ error: 'Failed to create meeting' }, 500)
  }
})

app.post('/make-server-22ef7db9/meetings/:id/join', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const meetingId = c.req.param('id')
    const { password } = await c.req.json()
    
    const meetingData = await kv.get(`meeting:${meetingId}`)
    if (!meetingData) {
      return c.json({ error: 'Meeting not found' }, 404)
    }
    
    const meeting = JSON.parse(meetingData)
    
    // Check password if meeting is password protected
    if (meeting.password && meeting.password !== password) {
      return c.json({ error: 'Incorrect password' }, 401)
    }
    
    // Update participant count
    meeting.participant_count = (meeting.participant_count || 0) + 1
    await kv.set(`meeting:${meetingId}`, JSON.stringify(meeting))
    
    return c.json({ meeting })
  } catch (error) {
    console.error('Join meeting error:', error)
    return c.json({ error: 'Failed to join meeting' }, 500)
  }
})

console.log('Server initialized successfully')

Deno.serve(app.fetch)