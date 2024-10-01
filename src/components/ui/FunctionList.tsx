// ... Existing imports ...
import React, { useState, useEffect } from 'react';
import {
  Draggable,
  DropResult,
  DragDropContext,
} from 'react-beautiful-dnd';
import StrictModeDroppable from './StrictModeDroppable'; // Ensure correct import
import { nanoid } from 'nanoid';

function FunctionList({
  functionsList,
  setFunctionsList,
}: {
  functionsList: { id: string; content: string }[];
  setFunctionsList: React.Dispatch<React.SetStateAction<{ id: string; content: string }[]>>;
}) {
  // Use internal state to manage function list
  const [items, setItems] = useState(functionsList);

  useEffect(() => {
    setItems(functionsList);
  }, [functionsList]);

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    setItems(reorderedItems);
    setFunctionsList(reorderedItems);
  };

  // Reorder function
  const reorder = (
    list: { id: string; content: string }[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  // Add new function
  const addFunction = () => {
    const newItem = {
      id: nanoid(),
      content: '',
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setFunctionsList(newItems);
  };

  // Update function content
  const updateFunction = (id: string, content: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, content } : item
    );
    setItems(newItems);
    setFunctionsList(newItems);
  };

  // Delete function
  const deleteFunction = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    setFunctionsList(newItems);
  };

  return (
    <div className="function-list w-full max-w-xl bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <StrictModeDroppable droppableId="droppable">
          {(provided) => (
            <ul
              className="list-none"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {items.map((func, index) => (
                <Draggable key={func.id} draggableId={func.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative group py-2 px-2 bg-gray-50 dark:bg-zinc-700 mb-2 rounded ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          {...provided.dragHandleProps}
                          className="mr-2 cursor-move text-gray-400"
                        >
                          ::: {/* Drag handle */}
                        </span>
                        <input
                          type="text"
                          value={func.content}
                          onChange={(e) =>
                            updateFunction(func.id, e.target.value)
                          }
                          className="flex-1 bg-transparent border-none focus:outline-none"
                        />
                        <button
                          className="ml-2 opacity-0 group-hover:opacity-100 text-red-500"
                          onClick={() => deleteFunction(func.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </StrictModeDroppable>
      </DragDropContext>
      <div className="mt-2">
        <button
          onClick={addFunction}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Function
        </button>
      </div>
    </div>
  );
}

export default FunctionList;
