const express = require('express');
const app = express();
const Sequelize = require('sequelize');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = 3000;

// Initialize sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// Auth
sequelize
    .authenticate()
    .then(()=>{
        console.log('Connection has been established succesfully')
    })
    .catch(err=>{
        console.error('Unable to connect to the database: ', err);
    });
//Create simple model called Note
const Note = sequelize.define('notes', {note: Sequelize.TEXT, tag: Sequelize.STRING});

//Syncing database force = mean to drop tables if exsists and create new one
sequelize.sync({force: true})
    .then(()=>{
        console.log(`Database & tables created!`);
        //createing some notes
        Note.bulkCreate([
            { note: 'pick up some bread after work', tag: 'shopping'},
            { note: 'remember to write up metting notes', tag: 'work'},
            { note: 'learn how to use node orm', tag: 'work'},
        ]).then(()=>{
            return Note.findAll();
        }).then(notes =>{
            console.log(notes);
        });
    });



// index route
app.get('/', (req,res)=>{
    res.send('Welcome to notes app!!!');
});

// Read all Notes
app.get('/notes',(req, res)=>{
    Note.findAll().then(notes=>res.json(notes));
});

//Read notes WHERE 
app.get('/notes/:id', (req, res)=>{
    Note.findAll({where: {id: req.params.id}}).then(notes=>res.json(notes));
});

//  Read notes WHERE AND
//  Here, we're looking for notes that match both the note and tag specified by the parameters. Again, let's test it out via curl:
//  $ curl "http://localhost:3000/notes/search?note=pick%20up%20some%20bread%20after%20work&tag=shopping"
//  [{"id":1,"note":"pick up some bread after work","tag":"shopping","createdAt":"2020-02-27T17:09:53.964Z","updatedAt":"2020-02-27T17:09:53.964Z"}]

// app.get('/notes/search', function(req, res) {
//     Note.findAll({ where: { note: req.query.note, tag: req.query.tag } }).then(notes => res.json(notes));
//   });

// //   Read Entities OR
// //   If we're trying to be a bit more vague, we can use the OR statement 
// //   and search for notes that match any of the given parameters. 
// //   Change the /notes/search route to:
// const Op = Sequelize.Op;

// app.get('/notes/search', function(req, res) {
//   Note.findAll({
//     where: {
//       tag: {
//         [Op.or]: [].concat(req.query.tag)
//       }
//     }
//   }).then(notes => res.json(notes));
// });


//  Read Entities LIMIT

//  The last thing we'll cover in this section is LIMIT. 
//  Let's say that we wanted to modify the pervious query to only return two results max. 
//  We'll do this by adding the limit parameter and assigning it a positive integer:
app.get('/notes/search', function(req, res) {
    Note.findAll({
      limit: 2,
      where: {
        tag: {
          [Op.or]: [].concat(req.query.tag)
        }
      }
    }).then(notes => res.json(notes));
  });

// Create a new Note
app.post('/notes', function(req, res) {
    Note.create({ note: req.body.note, tag: req.body.tag }).then(function(note) {
      res.json(note);
    });
  });

// Update Note 
app.put('/notes/:id', function(req, res) {
    Note.findByPk(req.params.id).then(function(note) {
      note.update({
        note: req.body.note,
        tag: req.body.tag
      }).then((note) => {
        res.json(note);
      });
    });
  });

//Delete note
app.delete('/notes/:id', function(req, res) {
    Note.findByPk(req.params.id).then(function(note) {
      note.destroy();
    }).then((note) => {
      res.sendStatus(200);
    });
  });

app.listen(port, ()=>{console.log(`notes-app listening on port ${port}`)});
