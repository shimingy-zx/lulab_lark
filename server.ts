import express from 'express'
import { startCronJob } from './cron/cronJob';
import { sync } from './playground/sync'
import { test } from './playground/test'

const app = express()
const port = 3000


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
  //await sync("abc", "123"); 
  res.send('hello world')
});

app.listen(port, () => {
  // Code.....
  console.log('Listening on port: ' + port)
})