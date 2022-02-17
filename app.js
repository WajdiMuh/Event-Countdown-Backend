const express = require('express');
const cors = require('express');
const { Pool } = require('pg');
const { Event } = require('./classes/Event');
const moment = require('moment');
const app = express();

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/getallevents', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('select * from events where date > now() order by date');
      let eventarray = [];
      result['rows'].forEach(event => {
          eventarray.push(new Event(event["id"],event["title"],moment(event["date"]).format("yyyy-MM-DD") + "T" + moment(event["date"]).format("hh:mm:ss")));
      });
      res.send(eventarray);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

app.get('/getlatestevent', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('select * from events where date > now() order by date limit 1');
      const latesteventjson = result["rows"][0];
      client.release();
      if(!latesteventjson){
        throw "no event";
      }
      res.send(new Event(latesteventjson["id"],latesteventjson["title"],moment(latesteventjson["date"]).format("yyyy-MM-DD") + "T" + moment(latesteventjson["date"]).format("hh:mm:ss")));
    } catch (err) {
      res.status(400).send(err);
    }
})

app.delete('/deleteevent/:id', async (req, res) => {
    try {
      const client = await pool.connect();
      await client.query('delete from events where id = $1',[req.params.id]);
      client.release();
      res.send("successful deletion");
    } catch (err) {
      res.status(400).send(err);
    }
})

app.post('/addevent', async (req, res) => {
    try {
      console.log(`insert into events (title,date) values ('${req.body.title}',${moment(req.body.date).format("yyyy-MM-DD") + "T" + moment(req.body.date).format("hh:mm:ss.SSS") + "Z"})`);
      const client = await pool.connect();
      await client.query(`insert into events (title,date) values ('${req.body.title}','${moment(req.body.date).format("yyyy-MM-DD") + "T" + moment(req.body.date).format("hh:mm:ss.SSS") + "Z"}')`);
      client.release();
      res.send("successful creation");
    } catch (err) {
      res.status(400).send(err);
    }
})

app.listen(process.env.PORT || 5000,() => {
    console.log('server running');
});
