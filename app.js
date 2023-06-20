const express = require ("express");
const fs = require ('fs');
const path = require('path');
var pug = require('pug');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});

const upload = multer({ storage: storage })



const app=express();
const port= 27017;
const hostname = '127.0.0.1';
//EXPRESS RELATED
app.use('/static' ,express.static('static'));
app.use(express.static(__dirname));
app.use(express.urlencoded());
// Set the view engine

const connectionString = 'mongodb://localhost:27017/';
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('Connected to MongoDB');
      // Start your application logic here
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
    });



//Schema
const data = new mongoose.Schema({
  enrollment: String,
  password: String,
  gymMember : Boolean,
    name: String,
    fname: String,
    country : String,
    gender : String,
    dob : Date,
    email:String,
    obt : Number,
    total :Number,
    obtained : Number,
    recent :String,
    degree: String,
    dept : String,
    spec:String
  });

  const teachdata = new mongoose.Schema({
    enrollment: String,
    password: String,
    gymMember : Boolean,
      name: String,
      fname: String,
      country : String,
      gender : String,
      dob : Date,
      email:String
    });

  const confirm = new mongoose.Schema({
    enrollment: String,
    password: String
  });

  const contac = new mongoose.Schema({
    name: String,
    email: String,
    message : String
  });

  const gym = new mongoose.Schema({
    name: String,
    email: String,
    password : String,
    confirmpassword : String ,
    dob : Date,
    gender : String,
    gymMember : Boolean
  });

  const confirmteach = new mongoose.Schema({
    enrollment: String,
    password: String
  });

  const fileSchema = new mongoose.Schema({
    originalFilename: String,
    filePath: String,
    fileSize: Number,
    mimeType: String
  });
  
  
  
  //Making a model
  var submitForm =mongoose.model('submitForm', data);
  var submitTeachersForm =mongoose.model('submitTeachersForm', teachdata);
  var validate =mongoose.model('validate', confirm);
  var validateteach =mongoose.model('validateteach', confirmteach);
  var contact =mongoose.model('contact', contac);
  var gymforms =mongoose.model('gymforms', gym);
  const File = mongoose.model('File', fileSchema);
  const File1 = mongoose.model('File1', fileSchema);
  



//CALL BACKS
app.get('/', (req, res) => {
  res.sendFile('mainPage.html', { root: __dirname });
});

app.post("/submit",(req,res)=>
{
    console.log(req.body);
    var mydata = new submitForm(req.body);
    mydata.save().then(()=>{
      res.sendFile('recieved.html', {root: __dirname,});
    }).catch((error)=>
    {
      console.log(error);
        res.status(404);
    });
});

app.post("/jobs",(req,res)=>
{
    console.log(req.body);
    var mydata = new submitTeachersForm(req.body);
    mydata.save().then(()=>{
      res.sendFile('recievedfaculty.html', {root: __dirname,});
    }).catch((error)=>
    {
      console.log(error);
        res.status(404);
    });
});

app.post("/roll", async (req,res)=>
{
    console.log(req.body);
    var mydata = new validate(req.body);
    mydata.save().then(()=>{
      res.sendFile('admissions.html', {root: __dirname});
    }).catch((error)=>
    {
      console.log(error);
        res.status(404);
    });

try{
    const qu = await submitForm.updateOne(
      { name : req.body.name },
      { $set: { enrollment : req.body.enrollment ,password: req.body.password } } );
        if (qu) {
          console.log('updated');
        } else {
          console.error(err);
        }
      }catch (error) {
        // Handle error
        console.log("Error:", error);
        res.send("Error occurred");
      }
});

app.post("/rollfaculty", async (req,res)=>
{
    console.log(req.body);
    var mydata = new validateteach(req.body);
    mydata.save().then(()=>{
      res.sendFile('jobs.html', {root: __dirname});
    }).catch((error)=>
    {
      console.log(error);
        res.status(404);
    });

try{
    const qu = await submitForm.updateOne(
      { name : req.body.name },
      { $set: { enrollment : req.body.enrollment ,password: req.body.password } } );
        if (qu) {
          console.log('updated');
        } else {
          console.error(err);
        }
      }catch (error) {
        // Handle error
        console.log("Error:", error);
        res.send("Error occurred");
      }
});

app.post("/contact",(req,res)=>
{
    console.log(req.body);
    var mydata = new contact(req.body);
    mydata.save().then(()=>{
      res.send(`
    <script>
      alert('Thans for communicating to us!');
      window.location.href = '/contact.html'; // Redirect to the home page
    </script>
  `);
      res.sendFile('contact.html', {root: __dirname});
    }).catch((error)=>
    {
      console.log(error);
        res.status(404);
    });
});

app.post("/gym", async (req,res)=>
{
    console.log(req.body);
    var mydata = new gymforms(req.body);
    mydata.save().then(()=>{
      res.send(`
    <script>
      alert('Registered for gym successfully!');
      window.location.href = '/gymregister.html'; // Redirect to the home page
    </script>
  `);
    }).catch((error)=>
    {
      console.log(error);
        res.status(404);
    });

    try{
    const q = await submitForm.updateOne({ name: req.body.name }, { gymMember : true });
      if (q) {
        console.log('updated');
      } else {
        
        console.error(err);
      }
    }catch (error) {
      // Handle error
      console.log("Error:", error);
      res.send("Error occurred");
    }
});

app.post('/login', async (req, res) => {
  const { enrollment, password } = req.body;
try{
  // Perform MongoDB query to validate username and password
  const user = await validate.findOne({ enrollment: enrollment, password: password });
    if (user) {
      // User found, perform further operations
      console.log("User found:", user);
      res.sendFile('studentfp.html', {root: __dirname});
    } else {
      // User not found
      console.log("User not found");
      res.status(200).sendFile('studentLogin.html', {root: __dirname}); 
    }
}catch (error) {
  // Handle error
  console.log("Error:", error);
  res.send("Error occurred");
}
});

app.post('/facultylogin', async (req, res) => {
  const { enrollment, password } = req.body;
try{
  // Perform MongoDB query to validate username and password
  const user = await validateteach.findOne({ enrollment: enrollment, password: password });
    if (user) {
      // User found, perform further operations
      console.log("User found:", user);
      res.sendFile('quizfp.html', {root: __dirname});
    } else {
      // User not found
      console.log("User not found", req.body);
      res.status(200).sendFile('facultylog.html', {root: __dirname}); 
    }
}catch (error) {
  // Handle error
  console.log("Error:", error);
  res.send("Error occurred");
}
});

app.get('/logout', (req, res) => {
  // Implement logout logic here
  // For example, clear the session or remove the user token
  // Redirect the user to the login page or any other desired page
  res.redirect('/studentlogin.html');
});

app.get('/logoutf', (req, res) => {
  // Implement logout logic here
  // For example, clear the session or remove the user token
  // Redirect the user to the login page or any other desired page
  res.redirect('/facultylog.html');
});

app.post('/profile', upload.single('avatar'), async (req,res) =>{
console.log(req.body);
console.log(req.file);

const originalFilename = req.file.originalname;
  const filePath = req.file.path;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;

  // Step 4: Save file metadata to the database
  const mydata = new File({
    originalFilename,
    filePath,
    fileSize,
    mimeType
  });

  mydata.save().then(()=>{
    res.sendFile('/paper.html', {root: __dirname,});
  }).catch((error)=>
  {
    console.log(error);
      res.status(404);
  });

});

app.post('/profile1', upload.single('avatar1'), async (req,res) =>{
  console.log(req.body);
  console.log(req.file);
  
  const originalFilename = req.file.originalname;
    const filePath = req.file.path;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;
  
    // Step 4: Save file metadata to the database
    const mydata = new File1({
      originalFilename,
      filePath,
      fileSize,
      mimeType
    });
  
    mydata.save().then(()=>{
      res.sendFile('/asgn.html', {root: __dirname,});
    }).catch((error)=>
    {
      console.log(error);
        res.status(404);
    });
  
  });

app.get('/fileget', async (req, res) => {
try{
  // Perform MongoDB query to validate username and password
  const user = await File.find({});
    if (user) {
      console.log("Doc Found:", user);
      res.sendFile('studentfp.html', {root: __dirname});
    } else {
      // User not found
      console.log("Doc not found", req.body);
      res.status(200).sendFile('studentfp.html', {root: __dirname}); 
    }
}catch (error) {
  // Handle error
  console.log("Error:", error);
  res.send("Error occurred");
}
});

app.get('/fileget1', async (req, res) => {
  try{
    // Perform MongoDB query to validate username and password
    const user = await File1.find({});
      if (user) {
        console.log("Doc FOund:", user);
        res.sendFile('studentfp.html', {root: __dirname});
      } else {
        // User not found
        console.log("Doc not found", req.body);
        res.status(200).sendFile('studentfp.html', {root: __dirname}); 
      }
  }catch (error) {
    // Handle error
    console.log("Error:", error);
    res.send("Error occurred");
  }
  });

//LISTEN PORT
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });