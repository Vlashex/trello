import { arrayMove } from '@dnd-kit/sortable'
import { create } from 'zustand'

export interface ITask {
    id: number
    content: string
}

export interface IColumn {
    id: number,
    title: string,
    tasks: ITask[]
}

interface ColumnsState {
    columns: IColumn[],
    createColumn: () => void,
    createTask: (columnId: number) => void,
    delColumn: (columnId: number) => void,
    delTaskFromColumn: (taskId: number, columnId: number) => void

    moveColumns: (activeColumnId: number, overColumnId: number) => void
    moveTasks: (activeColumnId: number, overColumnId:number, activeTaskId: number, overTaskId: number) => void
    moveTaskToColumn: (activeColumnId: number, overColumnId:number, activeTaskId: number) => void
}

const useStore = create<ColumnsState>()((set) => ({
  columns: [],
  createColumn: () => set((state) => {
    const newColumn:IColumn = {
        id: Math.round(Math.random() * 100001),
        title: `Column ${state.columns.length + 1}`,
        tasks: []
    }
    return {
        columns: [...state.columns, newColumn]
    }
  }),
  delColumn: (columnId) => set((state) => {
    const newColumns = state.columns.filter((el) => el.id != columnId)
    return {
        ...state,
        columns: newColumns
    }
  }),
  createTask: (columnId) => set((state) => {
    const newTask:ITask = {
        id: Math.round(Math.random() * 100001),
        content: 'New Task'
    }
    let newColumns = state.columns

    const colIndex = state.columns.findIndex((el) => el.id === columnId)

    newColumns[colIndex].tasks = [
        ...newColumns[colIndex].tasks,
        newTask
    ]
    const cols = [...newColumns]
    return {
        ...state,
        columns: cols
    }
  }),
  delTaskFromColumn: (taskId, columnId) => set(state => {
    let columns = [...state.columns]
    let selectedColumn = columns.find((el) => el.id === columnId)

    if (selectedColumn === undefined) return state

    const columnIndex = columns.findIndex((el) => el.id === selectedColumn.id)
    const tasks = selectedColumn.tasks

    columns[columnIndex].tasks = tasks.filter((el) => el.id !== taskId)

    return {
      ...state,
      columns: [...columns]
    }

  }),
  moveColumns: (activeColumnId, overColumnId) => set((state) => {
      const activeColumnIndex = state.columns.findIndex((el) => el.id === activeColumnId)
      const overColumnIndex = state.columns.findIndex((el) => el.id === overColumnId)
      return {
        ...state,
        columns: arrayMove(state.columns, activeColumnIndex, overColumnIndex)
      }
  }),
  moveTasks: (activeColumnId, overColumnId, activeTaskId, overTaskId) => set((state) => {
      let activeColumn = state.columns.find((el) => el.id === activeColumnId)
      let overColumn = state.columns.find((el) => el.id === overColumnId)
      
      
      if (activeColumn === undefined || overColumn === undefined) return state

      if (activeColumn === overColumn) {

        const activeColumnIndex = state.columns.findIndex((el) => el.id === activeColumnId)
        
        const tasks = activeColumn.tasks
        const activeTaskIndex = tasks.findIndex((el) => el.id === activeTaskId)
        const overTaskIndex = tasks.findIndex((el) => el.id === overTaskId)
        
        activeColumn.tasks = arrayMove(activeColumn.tasks, activeTaskIndex, overTaskIndex)
        
        let columns = state.columns
        columns[activeColumnIndex] = activeColumn
        
        
        return {
          ...state,
          columns: [...columns]
        }
    } else {
        const activeColumnIndex = state.columns.findIndex((el) => el.id === activeColumnId)
        const overColumnIndex = state.columns.findIndex((el) => el.id === overColumnId)
        
        const tasks = activeColumn.tasks
        const activeTask = tasks.find((el) => el.id === activeTaskId)

        if (activeTask === undefined) return state
        
        let columns = state.columns
        
        columns[activeColumnIndex].tasks = activeColumn.tasks.filter((el) => el.id !== activeTaskId)

        columns[overColumnIndex].tasks = [...overColumn.tasks, activeTask]

        const overColumnTasks = overColumn.tasks

        const activeTaskIndex = overColumnTasks.findIndex((el) => el.id === activeTaskId)
        const overTaskIndex = overColumnTasks.findIndex((el) => el.id === overTaskId)

        columns[overColumnIndex].tasks = arrayMove(columns[overColumnIndex].tasks, activeTaskIndex, overTaskIndex)

        return {
          ...state,
          columns: [...columns]
        }
    }
  }),
  moveTaskToColumn: (activeColumnId, overColumnId, activeTaskId) => set((state) => {
      let activeColumn = state.columns.find((el) => el.id === activeColumnId)
      let overColumn = state.columns.find((el) => el.id === overColumnId)

      console.log('AAAAA')
      
      
      if (activeColumn === undefined || overColumn === undefined) return state

      console.log('BBBBB')

      const activeColumnIndex = state.columns.findIndex((el) => el.id === activeColumnId)
      const overColumnIndex = state.columns.findIndex((el) => el.id === overColumnId)
      
      const activeTask = activeColumn.tasks.find((el) => el.id === activeTaskId)

      if (activeTask === undefined) return state

      console.log('CCCCC')

      
      let columns = state.columns
      columns[activeColumnIndex].tasks = activeColumn.tasks.filter((el) => el.id !== activeTaskId)
      columns[overColumnIndex].tasks = [...overColumn.tasks, activeTask]
      
      
      return {
        ...state,
        columns: [...columns]
      }
  }),
}))

export { useStore }