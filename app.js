const express = require('express');
const { Pool } = require('pg');
const { Event } = require('./classes/Event');
const moment = require('moment');
const app = express();

var types = require('pg').types
var parsedate = function(val) {
  return val === null ? null : moment(val).format("yyyy-MM-DDTHH:mm:ssZ");
}
types.setTypeParser(types.builtins.TIMESTAMPTZ, parsedate);

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.json());

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
          eventarray.push(new Event(event["id"],event["title"],event["date"]));
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
      console.log(latesteventjson);
      res.send(new Event(latesteventjson["id"],latesteventjson["title"],latesteventjson["date"]));
    } catch (err) {
      res.status(400).send(err);
    }
})

app.delete('/deleteevent/:id', async (req, res) => {
    try {
      const client = await pool.connect();
      await client.query('delete from events where id = $1',[req.params.id]).then(async () => {
        const result = await client.query('select * from events where date > now() order by date');
        let eventarray = [];
        result['rows'].forEach(event => {
          eventarray.push(new Event(event["id"],event["title"],event["date"]));
        });
        res.send(eventarray);
      }).catch(err =>{
        res.status(400).send(err);
      });
      client.release();
    } catch (err) {
      res.status(400).send(err);
    }
})

app.post('/addevent', async (req, res) => {
    try {
      const client = await pool.connect();
      await client.query(`insert into events (title,date) values ('${req.body.title}','${moment(req.body.date).format("yyyy-MM-DDTHH:mm:ssZ")}')`).then(async () => {
        const result = await client.query('select * from events where date > now() order by date');
        let eventarray = [];
        result['rows'].forEach(event => {
          eventarray.push(new Event(event["id"],event["title"],event["date"]));
        });
        res.send(eventarray);
      }).catch(err =>{
        res.status(400).send(err);
      });
      client.release();
    } catch (err) {
      res.status(400).send(err);
    }
})

app.put('/editevent/:id', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query(`update events set title = '${req.body.title}', date = '${moment(req.body.date).format("yyyy-MM-DDTHH:mm:ssZ")}' where id = $1;`,[req.params.id]).then(async () => {
      const result = await client.query('select * from events where date > now() order by date');
      let eventarray = [];
      result['rows'].forEach(event => {
        eventarray.push(new Event(event["id"],event["title"],event["date"]));
      });
      res.send(eventarray);
    }).catch(err =>{
      res.status(400).send(err);
    });
    client.release();
  } catch (err) {
    res.status(400).send(err);
  }
})

app.listen(process.env.PORT || 8080,() => {
    console.log('server running');
});
