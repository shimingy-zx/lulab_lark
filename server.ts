import express from 'express'
import { startCronJob } from './cron/cronJob';
import { searchAndReplace } from './playground/search_and_replace'
import { sync } from './playground/user_sync'
import { test } from './playground/test'

const app = express()
const port = 3000

//let cronJob = startCronJob();

// http trigger
// app.get('/search_and_replace', async (req, res) => {
//   await searchAndReplace('abc', '123');
//   res.send('success!!!')
// });

app.get('/user_sync', async (req, res) => {
  await sync("abc", "123");
  res.send('Cron job scheduled!');
});

app.get('/stop_cron', (req, res) => {
  if (cronJob) {
    cronJob.stop();
    res.send('Cron job stopped.');
  } else {
    res.send('No cron job to stop.');
  }
});


app.get('/test', async (req, res) => {
  await test("abc", "123");
  res.send('Cron job scheduled!');
});

app.get('/', async (req, res) => {
  await sync("abc", "123");
  res.send('hello world')
});

app.listen(port, () => {
  // Code.....
  console.log('Listening on port: ' + port)
})