import React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import TimezoneSelect from 'react-timezone-select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';

import '../Assets/settings-panel.css';

export default function SettingsPanel() {
  const [text, setText] = React.useState('');
  const [timezone, setTimezone] = React.useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [timer, setTimer] = React.useState(30);

  React.useEffect(() => {
    chrome.storage.local.get(['name', 'timezone', 'timer'], (result) => {
      if (result.name?.name !== undefined) {
        setText(result.name.name);
      }
      if (result.timezone !== undefined) {
        setTimezone(result.timezone);
      }
      if (result.timer !== undefined) {
        setTimer(result.timer);
      }
    });
  }, []);

  const handleName = (event) => {
    const name = event.target.value;
    setText(name);
    chrome.storage.local.set({ name: { name } });
  };

  const handleTimezone = (value) => {
    setTimezone(value);
    chrome.storage.local.set({ timezone: value });
  };

  const handleTimer = (event) => {
    const minutes = event.target.value;
    setTimer(minutes);
    chrome.storage.local.set({ timer: minutes });
  };

  const handleBackup = () => {
    chrome.storage.local.get(null, (items) => {
      const blob = new Blob([JSON.stringify(items, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tabify-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const items = JSON.parse(reader.result);
      chrome.storage.local.set(items, () => {
        if (items.name?.name !== undefined) setText(items.name.name);
        if (items.timezone !== undefined) setTimezone(items.timezone);
        if (items.timer !== undefined) setTimer(items.timer);
      });
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <Box className="panel">
      <Box
        height="100px"
        fontSize="20px"
        padding="10px"
        display="flex"
        alignItems="center"
      >
        General Settings
      </Box>
      <Divider color="white" width="80%" />
      <Grid container>
        <Grid item xs={4}>
          <List>
            <ListItem>
              <Box padding="10px" fontSize="14px">
                Display Name
              </Box>
            </ListItem>
            <ListItem>
              <Box padding="10px" fontSize="14px">
                TimeZone
              </Box>
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={8}>
          <List>
            <ListItem>
              <TextField
                sx={{
                  background: '#36454F',
                  input: { color: 'white' },
                  borderRadius: '10px',
                  width: '190px',
                }}
                size="small"
                id="standard-helperText"
                label="input your name"
                onChange={handleName}
                value={text}
              ></TextField>
            </ListItem>
            <ListItem>
              <TimezoneSelect value={timezone} onChange={handleTimezone} />
            </ListItem>
          </List>
        </Grid>
      </Grid>
      <Box
        height="100px"
        fontSize="16px"
        padding="10px"
        display="flex"
        alignItems="center"
      >
        Focus Mode
      </Box>
      <Grid container>
        <Grid item xs={4}>
          <List>
            <ListItem>
              <Box padding="10px" fontSize="14px">
                Timer Length
              </Box>
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={8}>
          <List>
            <ListItem>
              <FormControl>
                <InputLabel id="demo-simple-select-label"></InputLabel>
                <Select
                  sx={{
                    background: '#36454F',
                    input: { color: 'white' },
                    borderRadius: '10px',
                    width: '190px',
                  }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={timer}
                  label="Timer Length"
                  onChange={handleTimer}
                >
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
        </Grid>
      </Grid>
      <Box
        height="100px"
        fontSize="16px"
        padding="10px"
        display="flex"
        alignItems="center"
      >
        <Button
          variant="contained"
          sx={{ backgroundColor: '#36454F', borderRadius: '10px', marginRight: '10px' }}
          onClick={handleBackup}
        >
          Backup
        </Button>
        <Button
          variant="contained"
          component="label"
          sx={{ backgroundColor: '#36454F', borderRadius: '10px' }}
        >
          Restore
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={handleRestore}
          />
        </Button>
      </Box>
    </Box>
  );
}
