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
  currentPageId
}: {
  functionsList: { id: string; content: string }[];
  setFunctionsList: (newList: { id: string; content: string }[], pageId: string) => void;
  currentPageId: string;
}) {
  // 使用内部状态来管理功能列表
  const [items, setItems] = useState(functionsList);

  useEffect(() => {
    setItems(functionsList);
  }, [functionsList]);

  // 处理拖放
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
    setFunctionsList(reorderedItems, currentPageId);
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

  // 添加新功能
  const addFunction = () => {
    const newItem = {
      id: nanoid(),
      content: '',
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setFunctionsList(newItems, currentPageId);
  };

  // 更新功能内容
  const updateFunction = (id: string, content: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, content } : item
    );
    setItems(newItems);
    setFunctionsList(newItems, currentPageId);
  };

  // 删除功能
  const deleteFunction = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    setFunctionsList(newItems, currentPageId);
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
