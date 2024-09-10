"use client";
import React, { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 定义自定义节点组件
const CustomNode = ({ data, updateNodeData, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const [items, setItems] = useState(data.items);

    const handleLabelChange = (e) => setLabel(e.target.value);
    const handleItemChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };

    const handleSave = () => {
        setIsEditing(false);
        updateNodeData(id, { label, items });
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f5f5f5', width: '200px', minHeight: '100px' }}>
            {isEditing ? (
                <div>
                    <input
                        type="text"
                        value={label}
                        onChange={handleLabelChange}
                        style={{ width: '100%', marginBottom: '10px', fontSize: '16px' }}
                    />
                    <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
                        {items.map((item, index) => (
                            <li key={index} style={{ marginBottom: '5px' }}>
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                    style={{ width: '100%', padding: '5px', fontSize: '14px' }}
                                />
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSave} style={{ marginTop: '10px' }}>Save</button>
                </div>
            ) : (
                <div onClick={() => setIsEditing(true)}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{label}</h4>
                    <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
                        {items.map((item, index) => (
                            <li key={index} style={{ backgroundColor: '#e0e0e0', padding: '5px', borderRadius: '3px', marginBottom: '5px', fontSize: '14px' }}>
                                {index + 1}. {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// 使用之前的初始数据
const initialNodes = [
    {
        id: '1',
        type: 'customNode',
        data: {
            label: 'Landing page',
            items: [
                "Dashboard of management Webapp",
                "Camera views of each online Camera",
                "Profile page",
                "Add/Del device"
            ]
        },
        position: { x: 100, y: 50 },
    },
    {
        id: '2',
        type: 'customNode',
        data: {
            label: 'Settings page',
            items: [
                "User settings",
                "System settings",
                "Notifications"
            ]
        },
        position: { x: 350, y: 200 },
    },
    {
        id: '3',
        type: 'customNode',
        data: {
            label: 'Reports page',
            items: [
                "Generate report",
                "View history",
                "Export data"
            ]
        },
        position: { x: 350, y: 400 },
    },
    {
        id: '4',
        type: 'customNode',
        data: {
            label: 'Analytics page',
            items: [
                "Real-time analysis",
                "Data visualization"
            ]
        },
        position: { x: 600, y: 300 },
    },
    {
        id: '5',
        type: 'customNode',
        data: {
            label: 'Help page',
            items: [
                "FAQ",
                "Contact support",
                "User guides"
            ]
        },
        position: { x: 100, y: 400 },
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-5', source: '3', target: '5' },
];

const nodeTypes = { customNode: CustomNode };

const Tree = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // 更新节点数据的回调
    const updateNodeData = (id, newData) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        data: { ...node.data, ...newData }
                    }
                    : node
            )
        );
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={{
                    customNode: (props) => (
                        <CustomNode {...props} updateNodeData={updateNodeData} />
                    ),
                }}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesConnectable={false}
                nodesDraggable={false}
                panOnDrag={true} // 启用平移功能来查看整个图
                zoomOnScroll={true} // 启用缩放功能
                zoomOnPinch={true} // 启用缩放功能
                zoomOnDoubleClick={true} // 启用双击缩放
            >
                <MiniMap />
                <Controls />
            </ReactFlow>

        </div>
    );
};

export default Tree;
