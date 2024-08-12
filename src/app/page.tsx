'use client'
import { useState } from "react"

type TaskContainerProps = {
  id: string | number
  content: string
  delTask: (taskId: number, columnId: number) => void
}

const TaskContainer = ({id, content, delTask}:TaskContainerProps) => {
  return(
    <div className=" bg-black rounded-sm p-1">
      <h1 className="mb-1">Task1</h1>
      <p className="overflow-y-scroll h-20">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi repellat alias optio in natus facere voluptates eos debitis nesciunt iste aspernatur, autem, harum inventore ipsum culpa ut corporis qui sint?</p>
    </div>
  )
}
type ColumnContainerProps = {
  id: string | number
  title: string
  tasks: TaskContainerProps[]
  delColumns: (columnId: string | number) => void
  delTaskFromColumn: (taskId: number, columnId: number) => void
}
const ColumnContainer = ({title, delColumns, id, tasks, delTaskFromColumn}: ColumnContainerProps) => {
  return(
    <div className="flex flex-col gap-4 min-h-[400px] min-w-[200px] w-[200px] bg-gray-500 text-white  overflow-hidden bg-gray-800 rounded-sm">
      <div className="flex gap-4 items-center  p-2">
        <p>{title}</p>
        <button className="ml-auto hover:bg-gray-400 p-1" onClick={()=>delColumns(id)}>del</button>
      </div>
      <div className="flex flex-grow flex-col px-2">
        {
          tasks.map((value)=>
          <TaskContainer id={value.id} content={value.content} delTask={delTaskFromColumn}/>
        )
        }
      </div>
      <button className="hover:bg-gray-400">New task</button>
    </div>
  )
}

export default function Home() {

  const [columns, setColumns] = useState<Omit<Omit<ColumnContainerProps, 'delColumns'>, 'delTaskFromColumn'>[]>([])

  const AddColumn = () => {
    const newColumn = {
      id: Math.random() * 1001,
      title: `Column ${columns.length + 1}`,
      tasks: []
    }
    setColumns([...columns, newColumn])
  }
  const DelColumn = (columnId: string | number) => {
    const filteredColumns = columns.filter((el) => el.id != columnId)
    setColumns(filteredColumns)
  }
  const DelTaskFromColumn = (taskId:number, columnId: number) => {
    const prevColumn = columns.filter((el)=>el.id == columnId)[0]
    const newTasks = prevColumn.tasks.filter((el)=>el.id != taskId)
    setColumns(()=>{
      const prevColumns = columns.filter(el=>el.id!=columnId)
      const newColumns = [...prevColumns, {...prevColumn, tasks: newTasks}]
      return newColumns
    })
  }

  return (
    <main className="flex gap-8 overflow-x-auto p-4 items-center h-screen w-full">
      {
        columns.map((value) =>
          <ColumnContainer 
            key={value.id} 
            id={value.id} 
            title={value.title} 
            delColumns={DelColumn}
            delTaskFromColumn={DelTaskFromColumn}
            tasks={value.tasks}
          />
        )
      }
      <div className="bg-black text-white p-2 ml-auto">
        <button onClick={AddColumn}>Add column</button>
      </div>
    </main>
  );
}
