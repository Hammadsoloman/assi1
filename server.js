'use strict';

require('dotenv').config();
const express= require('express');
const cors=require('cors');
const pg =require('pg');
const app=express();
const methodOverride=require('method-override');

const PORT = process.env.PORT || 5555;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error',(err)=>console.log(err));



app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'))
app.set('view engine','ejs');
app.use(methodOverride('_method'));


app.get('/', getTasks);
app.get('/tasks/:task_id', getOneTask);
app.get('/add', getform);
app.post('/add',addTask);
app.put('/update/:task_id',updateTask);
app.delete('/delete/:task_id',deleteTask);
app.use('*',notFoundHandler);



function getTasks(req,res){
    const SQL='SELECT * FROM tasks;';
    client.query(SQL).then(results=>{
        res.render('index',{tasks:results.rows});
    })
    .catch((err)=>{
        errorHandler(err,req,res)
    })
}



function getOneTask(req, res) {
    const SQL = 'SELECT * FROM tasks WHERE id=$1;';
    const values = [req.params.task_id];
    client
      .query(SQL, values)
      .then((results) => {
        res.render('pages/detail-view', { task: results.rows[0] });
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
}


function getform(req,res){
  res.render('pages/add-view');
}



function addTask(req,res){
    const {title,description,contact,status,category}=req.body
    const SQL = 'INSERT INTO tasks(title,description,contact,status,category) VALUES($1,$2,$3,$4,$5);';
    const values=[title,description,contact,status,category];
    client.query(SQL,values)
    .then((results)=>{
        res.redirect('/');
    })
    .catch((err)=>{
        errorHandler(err,req,res);
    })
}




function updateTask(req,res){
 let {title,description,contact,status,category}=req.body
 const SQL='UPDATE tasks SET title=$1,description=$2,contact=$3,status=$4,category=$5 WHERE id=$6;';
 const values=[title,description,contact,status,category,req.params.task_id];
 client.query(SQL,values)
 .then(res.redirect(`/tasks/${req.params.task_id}`))
}


function deleteTask(req,res){
   let SQL='DELETE FROM tasks WHERE id=$1;';
   let value=[req.params.task_id];
   client.query(SQL,value)
   .then(res.redirect('/'))
}

function notFoundHandler(req,res){
   res.status(404).send('page not found')
}

function errorHandler(err,req,res){
    res.status(500).render('pages/error-view',{error:err})
}




client.connect().then(()=>{
    app.listen(PORT,()=>console.log('up and running in port', PORT))
})




