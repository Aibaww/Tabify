import Menu from './Components/dropdown-menu';
import Greeting from './Components/greeting';
import TabList from './Components/tab-list';
import Task from './Components/tasks/task';
import CanvasButton from './Components/canvas/canvas-button';
import React from 'react';
import { DateTime } from 'luxon';
import axios from 'axios';
import { createClient } from 'pexels';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import './Newtab.css';
import './Newtab.scss';
import PexelLogo from './Components/pexel-logo';

const Quote = require('inspirational-quotes');
const client = createClient(process.env.REACT_APP_APIkey);
const query = 'Nature';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clock: DateTime.now(),
      countdown: DateTime.now(),
      focused: false,
      wallpaper: '',
      quote: '',
      tabs: [],
      tasks: [],
      name: '',
      dayPhase: '',
      canvas: false,
      canvasCalendarData: [],
      courses: [],
      canvasUserID: '',
      backgroundCSS: '',
      end: DateTime.now().plus({ seconds: 5 }),
    };
  }

  componentDidMount() {
    chrome.storage.local.get('tabs', (result) => {
      if (
        result !== undefined &&
        result.tabs !== undefined &&
        result.tabs.tabs !== undefined
      ) {
        this.setState({ tabs: result.tabs.tabs });
      }
    });
    chrome.storage.local.get('tasks', (result) => {
      if (
        result !== undefined &&
        result.tasks !== undefined &&
        result.tasks.tasks !== undefined
      ) {
        this.setState({ tasks: result.tasks.tasks });
      }
    });
    chrome.storage.local.get('name', (result) => {
      if (
        result !== undefined &&
        result.name !== undefined &&
        result.name.name !== undefined
      ) {
        this.setState({ name: result.name.name });
      }
    });
    this.timerID = setInterval(() => this.tick(), 1000);
    this.updateBackground();
    // axios
    //   .get(
    //     'https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1',
    //     { headers: { 'X-Requested-With': 'true' } }
    //   )
    //   .then((res) => {
    //     if (res.status === 200) {
    //       this.setState({ wallpaper: res.data[0].url });
    //     }
    //   })
    //   .catch((err) => {
    //     this.setState({ wallpaper: '' });
    //   });
    this.canvasAPICall();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  canvasAPICall() {
    axios.get('https://canvas.northwestern.edu/').then((res) => {
      if (res.data.includes('Dashboard')) {
        // get courses
        let regex = /course_[0-9]+/g;
        let match = res.data.match(regex);
        let courses = [];
        let tmpJson = {};
        for (let i = 0; i < match.length; i++) {
          if (tmpJson[match[i]] === undefined) {
            tmpJson[match[i]] = true;
          } else {
            courses.push(match[i]);
          }
        }
        //get user id
        regex = /user_[0-9]+/g;
        let userID = res.data.match(regex)[0];
        this.setState({ canvas: true, courses: courses, canvasUserID: userID });
        let calendarURL1 =
          'https://canvas.northwestern.edu/api/v1/calendar_events?type=assignment&context_codes%5B%5D=' +
          userID;
        let calendarURL2 =
          'https://canvas.northwestern.edu/api/v1/calendar_events?&context_codes%5B%5D=' +
          userID;
        for (let i = 0; i < courses.length; i++) {
          calendarURL1 = calendarURL1 + '&context_codes%5B%5D=' + courses[i];
          calendarURL2 = calendarURL2 + '&context_codes%5B%5D=' + courses[i];
        }
        calendarURL1 =
          calendarURL1 +
          '&start_date=' +
          DateTime.now().minus({ months: 1 }).toFormat('yyyy-MM-dd') +
          'T05%3A00%3A00.000Z&end_date=' +
          DateTime.now().plus({ months: 1 }).toFormat('yyyy-MM-dd') +
          'T05%3A00%3A00.000Z&per_page=100';
        calendarURL2 =
          calendarURL2 +
          '&start_date=' +
          DateTime.now().minus({ months: 1 }).toFormat('yyyy-MM-dd') +
          'T05%3A00%3A00.000Z&end_date=' +
          DateTime.now().plus({ months: 1 }).toFormat('yyyy-MM-dd') +
          'T05%3A00%3A00.000Z&include%5B%5D=web_conference&include%5B%5D=series_head&include%5B%5D=series_natural_language&per_page=100';
        axios.all([axios.get(calendarURL1), axios.get(calendarURL2)]).then(
          axios.spread((res1, res2) => {
            var calendarList1 = res1.data.map((item) => {
              return {
                id: item.id,
                title: item.title,
                start: DateTime.fromISO(item.start_at).toJSDate(),
                end: DateTime.fromISO(item.end_at).toJSDate(),
                description: item.description,
                html_url: item.html_url,
                context_name: item.context_name,
                context_code: item.context_code,
              };
            });
            var calendarList2 = res2.data.map((item) => {
              return {
                id: item.id,
                title: item.title,
                start: DateTime.fromISO(item.start_at).toJSDate(),
                end: DateTime.fromISO(item.end_at).toJSDate(),
                description: item.description,
                html_url: item.html_url,
                context_name: item.context_name,
                context_code: item.context_code,
              };
            });
            this.setState({
              canvasCalendarData: [...calendarList1, ...calendarList2],
            });
          })
        );
      }
    });
  }

  tick() {
    this.setState({
      clock: DateTime.now(),
    });
    this.setState({
      quote: Quote.getQuote({ author: false }).text,
    });
    this.getDayPhase();
    chrome.storage.local.get('tabs', (result) => {
      if (
        result !== undefined &&
        result.tabs !== undefined &&
        result.tabs.tabs !== undefined
      ) {
        this.setState({ tabs: result.tabs.tabs });
      }
    });
    chrome.storage.local.get('tasks', (result) => {
      if (
        result !== undefined &&
        result.tasks !== undefined &&
        result.tasks.tasks !== undefined
      ) {
        this.setState({ tasks: result.tasks.tasks });
      }
    });
  }

  getDayPhase() {
    var hour = parseInt(this.state.clock.toFormat('HH'), 10);
    if (hour >= 5 && hour <= 12) {
      this.setState({ dayPhase: 'Morning' });
    } else if (hour > 12 && hour <= 17) {
      this.setState({ dayPhase: 'Afternoon' });
    } else if (hour > 17 && hour <= 21) {
      this.setState({ dayPhase: 'Evening' });
    } else if (hour > 21 && hour <= 24) {
      this.setState({ dayPhase: 'Night' });
    } else if (hour >= 0 && hour <= 4) {
      this.setState({ dayPhase: 'Night' });
    } else {
      this.setState({ dayPhase: 'Morning' });
    }
  }

  updateBackground = () => {
    chrome.storage.local.get('background', (result) => {
      const today = new Date();
      const todayStr = today.toDateString();
      if (
        result != {} ||
        result.background.date !== todayStr ||
        result.background.wallpaper === ''
      ) {
        const splitStr = todayStr.split(' ');
        const num = Number(splitStr[2]);
        client.photos
          .search({
            query,
            size: 'large',
            orientation: 'landscape',
            per_page: 31,
          })
          .then((res) => {
            this.setState({
              wallpaper: res.photos[num].src.landscape,
              backgroundCSS: `url(${res.photos[num].src.landscape})`,
            });
            chrome.storage.local.set({
              background: {
                wallpaper: res.photos[num].src.landscape,
                date: todayStr,
              },
            });
          });
      } else {
        this.setState({
          wallpaper: result.background.wallpaper,
          backgroundCSS: `url(${result.background.wallpaper})`,
        });
      }
    });
  };

  updateTabs = (tabs) => {
    this.setState({ tabs: tabs });
    chrome.storage.local.set({ tabs: { tabs: tabs } });
  };

  updateTasks = (tasks) => {
    this.setState({ tasks: tasks });
    chrome.storage.local.set({ tasks: { tasks: tasks } });
  };

  updateFocused = () => {
    this.setState({ focused: !this.state.focused });
    chrome.storage.local.set({ focused: this.state.focused });
    if (this.state.focused !== true) {
      this.updateTimer();
      this.setState({
        backgroundCSS: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${this.state.wallpaper})`,
      });
    } else {
      this.setState({
        backgroundCSS: `url(${this.state.wallpaper})`,
      });
    }
  };

  updateName = (name) => {
    this.setState({ name: name });
    chrome.storage.local.set({ name: { name: name } });
    console.log(name);
  };

  updateTimer = () => {
    chrome.storage.local.get('timer', (result) => {
      const minutes = result?.timer !== undefined ? result.timer : 30;
      this.setState({ end: DateTime.now().plus({ minutes }) });
    });
  };

  render() {
    return (
      <div
        className="App"
        style={{ backgroundImage: this.state.backgroundCSS }}
      >
        <header className="App-header">
          <Grid container className="menu-bar">
            <Grid item xs={1}>
              <PexelLogo focused={this.state.focused} />
            </Grid>
            <Grid item xs={9}></Grid>
            <Grid item xs={1}>
              <CanvasButton
                canvas={this.state.canvas}
                canvasCalendarData={this.state.canvasCalendarData}
              />
            </Grid>
            <Grid item xs={1}>
              <Menu
                updateFocused={this.updateFocused}
                updateName={this.updateName}
                name={this.state.name}
              />
            </Grid>
          </Grid>
          <Box>
            <Grid container justifyContent="center">
              <Grid item xs={12}>
                <Box className="clock">
                  {this.state.clock.toFormat('HH:mm').toString()}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Greeting
                  focused={this.state.focused}
                  name={this.state.name}
                  dayPhase={this.state.dayPhase}
                  quote={this.state.quote}
                  clock={this.state.clock}
                  end={this.state.end}
                />
              </Grid>
            </Grid>
          </Box>
        </header>
        <Grid container spacing={2} justifyContent={'center'} padding={5}>
          <Grid item xs={4}>
            <Box className="box">
              <Box height="30px"> Tasks </Box>
              <Divider color="gray" />
              <Task tasks={this.state.tasks} updateTasks={this.updateTasks} />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box className="box">
              <Box height="30px"> Tabs </Box>
              <Divider color="gray" />
              <TabList tabs={this.state.tabs} updateTabs={this.updateTabs} />
            </Box>
          </Grid>
        </Grid>
      </div>
    );
  }
}
