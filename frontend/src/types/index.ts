export interface User {
    id: string
    name: string
    email: string
    avatar?: string
    role: "admin" | "developer" | "designer" | "tester"
  }
  
  export interface Comment {
    id: string
    content: string
    author: User
    createdAt: string
    updatedAt?: string
  }
  
  export interface Attachment {
    id: string
    name: string
    url: string
    type: "image" | "document" | "link"
    size?: number
  }
  
  export interface Activity {
    id?: string
    type: "created" | "updated" | "moved" | "commented" | "assigned"
    description: string
    user: User
    timestamp: string
    metadata?: Record<string, any>
  }
  
  export interface Task {
    id: string
    title: string
    description: string
    status: "backlog" | "todo" | "progress" | "review" | "done"
    priority: "low" | "medium" | "high" | "urgent"
    assignee?: User
    reporter: User
    startDate?: string  // Adicione esta linha
    endDate?: string    // Adicione esta linha
    estimatedHours?: number
    actualHours?: number
    tags: string[]
    comments: Comment[]
    attachments: Attachment[]
    activities: Activity[]
    subtasks: SubTask[]
    dependencies: string[] // IDs of tasks this depends on
    createdAt: string
    updatedAt: string
  }
  
  export interface SubTask {
    id: string
    title: string
    completed: boolean
    assignee?: User
  }
  
  export interface Requirement {
    id: string
    title: string
    description: string
    color: string
    status: "planning" | "pending-approval" | "active" | "completed" | "on-hold" | "cancelled"
    priority: "low" | "medium" | "high"
    owner: User
    startDate?: string
    endDate?: string
    estimatedHours?: number
    budget?: number
    progress: number
    tasks: Task[]
    milestones: Milestone[]
    comments: RequirementComment[]
    dependencies: string[] // IDs of requirements this depends on
    category?: string
    tags: string[]
    approvalRequired: boolean
    createdAt: string
    updatedAt: string
  }
  
  export interface ProjectStats {
    totalRequirements: number
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    tasksInProgress: number
    averageCompletionTime: number
  }
  
  export interface RequirementTemplate {
    id: string
    name: string
    description: string
    color: string
    priority: "low" | "medium" | "high"
    defaultTasks: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "attachments" | "activities">[]
    createdBy: User
    createdAt: string
  }
  
  export interface Milestone {
    id: string
    title: string
    description: string
    dueDate: string
    status: "pending" | "completed"
    tasks: string[] // Task IDs
  }
  
  export interface RequirementComment {
    id: string
    content: string
    author: User
    createdAt: string
    updatedAt?: string
  }
  
  export interface ApprovalRequest {
    id: string
    requirementId: string
    requestedBy: User
    approvers: User[]
    status: "pending" | "approved" | "rejected"
    reason?: string
    createdAt: string
    resolvedAt?: string
    resolvedBy?: User
  }
  