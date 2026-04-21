import { Select, MenuItem, Box, Typography, Paper, Tooltip, Avatar, IconButton, TextField, Button } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const STATUS_CONFIG = {
    todo: {
        label: 'Todo',
        color: '#6b7280',
        bg: '#f3f4f6',
        icon: <RadioButtonUncheckedIcon sx={{ fontSize: 12 }} />
    },
    'in-progress': {
        label: 'In Progress',
        color: '#92400e',
        bg: '#fef3c7',
        icon: <PendingOutlinedIcon sx={{ fontSize: 12 }} />
    },
    done: {
        label: 'Done',
        color: '#166534',
        bg: '#dcfce7',
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 12 }} />
    }
};

export const StatusBadge = ({ status }) => {
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: s.bg,
            color: s.color,
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 9px',
            borderRadius: 20,
            border: `1px solid ${s.color}30`
        }}>
            {s.icon} {s.label}
        </span>
    );
};

export const TaskItem = ({ task, onStatusChange, onDelete, onUpdateTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDesc, setEditDesc] = useState(task.description || '');

    const handleSave = () => {
        if (!editTitle.trim()) return;
        onUpdateTask(task._id, { title: editTitle, description: editDesc });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(task.title);
        setEditDesc(task.description || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Paper
                elevation={0}
                sx={{
                    background: '#ffffff',
                    border: '2px solid #FFD600',
                    borderRadius: 3,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    label="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                />
                <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    multiline
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton size="small" onClick={handleCancel}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleSave}
                        sx={{ bgcolor: '#111827', color: '#fff', '&:hover': { bgcolor: '#1f2937' } }}
                    >
                        Save
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'all 0.2s',
                cursor: 'pointer',
                position: 'relative',
                '&:hover': {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    transform: 'translateY(-2px)',
                    borderColor: '#cbd5e1',
                    '& .card-actions': { opacity: 1 }
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: task.status === 'done' ? '#94a3b8' : '#1e293b',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                    lineHeight: 1.4,
                    flex: 1
                }}>
                    {task.title}
                </Typography>

                <Select
                    value={task.status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    size="small"
                    variant="standard"
                    disableUnderline
                    sx={{
                        fontSize: 10,
                        ml: 1,
                        '& .MuiSelect-select': { py: 0.5, pr: '24px !important' },
                        color: '#64748b'
                    }}
                >
                    <MenuItem value="todo" sx={{ fontSize: 11 }}>Todo</MenuItem>
                    <MenuItem value="in-progress" sx={{ fontSize: 11 }}>In Progress</MenuItem>
                    <MenuItem value="done" sx={{ fontSize: 11 }}>Done</MenuItem>
                </Select>
            </Box>

            {task.description && (
                <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>
                    {task.description}
                </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                {task.assignedUser && (
                    <Tooltip title={`Assigned to ${task.assignedUser.username}`}>
                        <Avatar
                            sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#FFD600', color: '#111827', fontWeight: 800 }}
                        >
                            {task.assignedUser.username.charAt(0).toUpperCase()}
                        </Avatar>
                    </Tooltip>
                )}

                <Box className="card-actions" sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    gap: 0.5,
                    ml: 1
                }}>
                    <IconButton
                        size="small"
                        onClick={() => setIsEditing(true)}
                        sx={{ color: '#64748b' }}
                    >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => onDelete(task._id)}
                        sx={{ color: '#ef4444' }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <Box sx={{ flex: 1 }} />
                <StatusBadge status={task.status} />
            </Box>
        </Paper>
    );
};

export default TaskItem;
