import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from './checkbox';
import '../../Assets/tab-list.css';

const PRIORITY_COLOR = { high: '#f44336', medium: '#ffb300', low: '#4caf50' };

export default function TaskList(props) {
  return (
    <List className="list">
      {props.taskList.length > 0
        ? props.taskList.map((taskItem, i) => {
            return (
              <ListItem
                sx={{ height: '50px' }}
                key={i}
                secondaryAction={
                  <div>
                    <Checkbox />
                    <IconButton
                      edge="end"
                      color="inherit"
                      aria-label="delete"
                      onClick={() => {
                        var arr = props.taskList.filter((taskItem, j) => {
                          return i !== j;
                        });
                        props.updateTasks(arr);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                }
              >
                <span
                  className="priority-dot"
                  style={{
                    backgroundColor:
                      PRIORITY_COLOR[taskItem.priority] || PRIORITY_COLOR.medium,
                  }}
                />
                <ListItemText
                  primaryTypographyProps={{ fontSize: '16px' }}
                  primary={taskItem.text}
                  secondaryTypographyProps={{
                    fontSize: '12px',
                    color: 'white',
                  }}
                  secondary={taskItem.date}
                />
              </ListItem>
            );
          })
        : null}
    </List>
  );
}
