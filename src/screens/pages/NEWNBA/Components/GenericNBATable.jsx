// GenericNBATable.jsx
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Plus } from "lucide-react";

const GenericNBATable = ({
  columns,
  data = [],
  onChange,
  disabled = false,
  addButtonText = "Add Row",
  minRows = 1,
  enableDrag = true,
}) => {
  const safeData = Array.isArray(data) && data.length > 0
    ? data.map((row, i) => ({ ...row, id: row.id || `row-${i}` }))
    : [{ id: "1", ...columns.reduce((acc, col) => ({ ...acc, [col.field]: "" }), {}) }];

  const handleChange = (index, field, value) => {
    const newData = [...safeData];
    newData[index][field] = value;
    onChange(newData);
  };

  const addRow = () => {
    const emptyRow = columns.reduce((acc, col) => ({
      ...acc,
      [col.field]: col.type === "select" ? 3 : ""
    }), { id: Date.now().toString() });

    onChange([...safeData, emptyRow]);
  };

  const removeRow = (index) => {
    if (safeData.length <= minRows) return;
    onChange(safeData.filter((_, i) => i !== index));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(safeData);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(items);
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <table className="w-full table-auto border-collapse bg-white rounded-xl shadow-md overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-left">
              {enableDrag && <th className="p-4 w-12"></th>}
              {columns.map((col) => (
                <th key={col.field} className="p-4 font-medium">
                  {col.header}
                  {col.subHeader && (
                    <div className="text-xs opacity-90">{col.subHeader}</div>
                  )}
                </th>
              ))}
              {!disabled && <th className="w-20"></th>}
            </tr>
          </thead>
          <Droppable droppableId="table-rows">
            {(provided) => (
              <tbody {...provided.droppableProps} ref={provided.innerRef}>
                {safeData.map((row, rowIndex) => (
                  <Draggable
                    key={row.id}
                    draggableId={row.id}
                    index={rowIndex}
                    isDragDisabled={disabled || !enableDrag}
                  >
                    {(provided, snapshot) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border-b transition ${snapshot.isDragging ? "bg-indigo-50 shadow-lg" : "hover:bg-gray-50"
                          }`}
                      >
                        {enableDrag && (
                          <td className="p-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab text-gray-500"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                          </td>
                        )}
                        {columns.map((col) => (
                          <td key={col.field} className="p-3">
                            {col.type === "select" ? (
                              <select
                                value={row[col.field] || ""}
                                onChange={(e) =>
                                  handleChange(rowIndex, col.field, e.target.value)
                                }
                                disabled={disabled}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">-</option>
                                <option value="1">1 (Low)</option>
                                <option value="2">2 (Medium)</option>
                                <option value="3">3 (High)</option>
                              </select>
                            ) : col.type === "textarea" ? (
                              <textarea
                                value={row[col.field] || ""}
                                onChange={(e) =>
                                  handleChange(rowIndex, col.field, e.target.value)
                                }
                                disabled={disabled}
                                rows={3}
                                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={col.placeholder}
                              />
                            ) : (
                              <input
                                type="text"
                                value={row[col.field] || ""}
                                onChange={(e) =>
                                  handleChange(rowIndex, col.field, e.target.value)
                                }
                                disabled={disabled}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder={col.placeholder}
                              />
                            )}
                          </td>
                        ))}
                        {!disabled && (
                          <td className="text-center">
                            {safeData.length > minRows && (
                              <button
                                onClick={() => removeRow(rowIndex)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded-full"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>

      {!disabled && (
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition"
        >
          <Plus className="w-5 h-5" />
          {addButtonText}
        </button>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Note:</strong> Mapping Levels: 3 = High, 2 = Medium, 1 = Low, - = No correlation
      </div>
    </div>
  );
};

export default GenericNBATable;