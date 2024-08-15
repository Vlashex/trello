'use client'

import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { IColumn, ITask, useStore } from "./store"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { useEffect, useMemo, useState } from "react"
import { CSS } from '@dnd-kit/utilities'
import { createPortal } from "react-dom"

const TaskContainer = ({id, content, columnId}:ITask & {columnId: number}) => {

  const delTask = useStore((state) => state.delTaskFromColumn)


  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: id,
    data: {
      type: "Task",
      task: {
        id,
        content
      },
      columnId: columnId
    }
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className=" bg-white text-black rounded-sm p-1 opacity-50 border-solid border-[1px] border-rose-500"
      >
        <h1 className="mb-1">Task {id}</h1>
        <p className="overflow-y-scroll h-20">{content}</p>
      </div>
    )
  }

  return(
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className=" bg-white text-black rounded-sm p-1"
    >
      <div className="flex justify-between pr-2">
        <h1 className="mb-1">Task {id}</h1>
        <button onClick={() => delTask(id, columnId)}>del</button>
      </div>
      <p className="overflow-y-scroll h-20">{content}</p>
    </div>
  )
}

const ColumnContainer = ({title, id, tasks}: IColumn) => {

  const delColumn = useStore((state) => state.delColumn)
  const createTask = useStore((state) => state.createTask)

  const tasksIds = useMemo(()=>{
    return tasks.map((task) => task.id)
  }, [tasks])

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: id,
    data: {
      type: "Column",
      column: {
        id,
        title,
        tasks
      }
    }
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="flex flex-col gap-4 min-h-[400px] min-w-[250px] w-[250px] text-white  overflow-hidden bg-gray-800 rounded-sm opacity-20"/>
    )
  }

  return(
    <div 
      ref={setNodeRef}
      style={style}

      className="flex flex-col gap-4 min-h-[400px] min-w-[250px] w-[250px] text-white  overflow-hidden bg-gray-800 rounded-sm">
      <div 
        {...attributes}
        {...listeners}
        className="flex gap-4 items-center  p-2">
        <p>{title}</p>
        <button className="ml-auto hover:bg-gray-400 p-1" onClick={()=>delColumn(id)}>del</button>
      </div>
      <div className="flex flex-grow gap-2 flex-col px-2">
      <SortableContext items={tasksIds}>
        {
          tasks.map((value)=>
            <TaskContainer key={value.id} id={value.id} content={value.content} columnId={id}/>
          )
        }
      </SortableContext>
      </div>
      <button className="hover:bg-gray-400" onClick={()=>createTask(id)}>New task</button>
    </div>
  )
}

export default function Home() {

  const addColumn = useStore((state) => state.createColumn)
  const columns = useStore((state) => state.columns)
  const columsId = useMemo(()=> columns.map((el) => el.id), [columns])

  const moveColumns = useStore((state)=> state.moveColumns)
  const moveTasks = useStore((state) => state.moveTasks)
  const moveTaskToColumn = useStore((state) => state.moveTaskToColumn)

  const [activeColumn, setActiveColumn] = useState<IColumn | null>(null)

  const [activeTask, setActiveTask] = useState<ITask | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  }))

  const onDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === "Column") {
      setActiveColumn(e.active.data.current.column)
      return
    }
    if (e.active.data.current?.type === "Task") {
      setActiveTask(e.active.data.current.task)
      return
    }
  }

  const onDragEnd = (e:DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)
    const {active, over} = e

    if (!over) return
    
    const activeColumnId = active.id as number
    const overColumnId = over.id as number

    if (activeColumnId === overColumnId) return

    const isActiveColumn = active.data.current?.type === "Column"
    const isOverColumn = over.data.current?.type === "Column"


    if (isActiveColumn && isOverColumn) {
      moveColumns(activeColumnId, overColumnId)
    }
    
  }

  const onDragOver = (e: DragOverEvent) => {
    const {active, over} = e

    if (!over) return

    const isActiveTask = active.data.current?.type === "Task"
    const isOverTask = over.data.current?.type === "Task"

    if (isActiveTask && isOverTask) {

      const activeTaskId = active.id as number
      const overTaskId = over.id as number

      const activeColumnId = active.data.current?.columnId as number
      const overColumnId = over.data.current?.columnId as number

      
      moveTasks(activeColumnId, overColumnId, activeTaskId, overTaskId)
    } else if (isActiveTask) {
      const activeTaskId = active.id as number

      const activeColumnId = active.data.current?.columnId as number
      const overColumnId = over.id as number

      
      moveTaskToColumn(activeColumnId, overColumnId, activeTaskId)
    }
  }

  const [nextDocument, setDocument] = useState<any>(null)

  useEffect(()=>{
    setDocument(document)
  }, [])


  return (
    <main className="flex gap-8 p-4 items-center h-screen w-full overflow-x-scroll">

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <SortableContext items={columsId}>

          {
            columns.map((value) =>
              <ColumnContainer 
                key={value.id} 
                id={value.id} 
                title={value.title}
                tasks={value.tasks}
              />
            )
          }

        </SortableContext>
        {
          nextDocument !== null
          ?createPortal(
            <DragOverlay>
              {
                activeColumn
                ?<ColumnContainer id={activeColumn?.id} tasks={activeColumn?.tasks} title={activeColumn?.title}/>
                :<div/>
              }
              {
                activeTask
                ?<TaskContainer id={activeTask.id} content={activeTask.content} columnId={0}/>
                :<div/>
              }
            </DragOverlay>,
            nextDocument.body
          )
          :null
        }
      </DndContext>
      
      <div className="bg-black text-white p-2 ml-auto min-w-fit">
        <button onClick={addColumn}>Add column</button>
      </div>
    </main>
  );
}
