import TaskInput from './task-input';
import TaskList from './task-list';
import '../../Assets/task';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

export default function TaskBox(props) {
  const [sortBy, setSortBy] = React.useState('none');

  const handleTaskInput = (text, date, priority) => {
    if (text !== '' && date !== undefined && date !== null) {
      const originalDate = date.toString();
      const splitString = originalDate.split(' ');
      const NewDate =
        'Due ' + splitString[0] + ' ' + splitString[2] + ' ' + splitString[1];
      props.updateTasks([
        ...props.tasks,
        { text: text, date: NewDate, rawDate: date.getTime(), priority: priority },
      ]);
    }
  };

  const sortedTasks = React.useMemo(() => {
    if (sortBy === 'date') {
      return [...props.tasks].sort(
        (a, b) => (a.rawDate ?? Infinity) - (b.rawDate ?? Infinity)
      );
    }
    if (sortBy === 'priority') {
      return [...props.tasks].sort(
        (a, b) =>
          (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0)
      );
    }
    return props.tasks;
  }, [props.tasks, sortBy]);

  return (
    <div>
      <Box className="task-sort">
        <Select
          size="small"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <MenuItem value="none">Sort by: None</MenuItem>
          <MenuItem value="date">Sort by: Due Date</MenuItem>
          <MenuItem value="priority">Sort by: Priority</MenuItem>
        </Select>
      </Box>
      <Box className="task-box">
        <TaskList taskList={sortedTasks} updateTasks={props.updateTasks} />
      </Box>
      <Box>
        <TaskInput handleTaskInput={handleTaskInput} />
      </Box>
    </div>
  );
}
