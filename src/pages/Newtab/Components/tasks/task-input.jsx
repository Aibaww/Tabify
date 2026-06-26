import React from 'react';
import CalendarSelect from './calendar-select';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import '../../Assets/task-input.css';

export default function TaskInput(props) {
  const [text, setText] = React.useState('');

  const [date, setDate] = React.useState(null);

  const [priority, setPriority] = React.useState('medium');

  const handleChange = (date) => {
    setDate(date);
  };

  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={5}>
        <TextField
          className="task-input"
          size="small"
          id="standard-helperText"
          label="To-do"
          onChange={(event) => {
            setText(event.target.value);
          }}
          value={text}
        ></TextField>
      </Grid>
      <Grid item xs={2}>
        <Select
          className="priority-select"
          size="small"
          value={priority}
          onChange={(event) => {
            setPriority(event.target.value);
          }}
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={1}>
        <CalendarSelect date={date} setDate={handleChange} />
      </Grid>
      <Grid item xs={1}>
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => {
            if (text !== undefined && date != null) {
              props.handleTaskInput(text, date.$d, priority);
              setText('');
            }
          }}
        >
          <CheckIcon />
        </IconButton>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}
