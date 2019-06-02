




var express =require("express");
var bodyparser=require("body-parser");
var path=require("path");
var rn = require('random-number');
var multer=require('multer');
var mysql = require('mysql');
var JSAlert = require("js-alert");

var app=express();

var global_umail;
var global_password;
var global_otp;
var port = process.env.PORT || 3000;

var options = 
{
    min:  100
  , max:  1000
  , integer: true
}

"use strict";
const nodemailer = require("nodemailer");





//inittializations
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'public'));

//setting up[ middleweare]
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

//database connection
var con = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12294251",
  password: "ArZtTlfari",
  database: "sql12294251"
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});



//starting file
app.get('/',function(req,res)
  {
  res.render('index');
  })






  
//to main.ejs
app.post('/signin',function(req,res){
  global_umail=req.body.loginmail;
  global_password=req.body.loginpass;
  var dmail;
  var dpass;  
  
  console.log(global_umail);
  
  
  con.query("select email,password from credentials where email='"+global_umail+"'",function(err,result)
  {
    
    if(result.length>0)
    {
      console.log('connected');
    Object.keys(result).forEach(function(key) {
      var row = result[key];
      console.log(row.password)      
      if(row.password==global_password)
      {
        con.query("SELECT * FROM video order by rand() limit 100 ", function (err, result, fields) {
          if (err) throw err;
          console.log(result);
          res.render('shows_video_image',{videos:result});
        });
        
      }
      else{
res.render('index',{msg:"Incorrect USERMAIL OR PASSWORD..!!"})
      }
      console.log(global_umail);

    }); 
    }
    else
    {
      res.render('index',{msg:"Incorrect USERMAIL OR PASSWORD..!!"})
    }
    
  });
 
});




app.post('/send_otp_to_mail',function(req,res){

  console.log(req.body.loginmail) ;
  console.log(req.body.loginpass) ;
  global_umail=req.body.loginmail;
  global_password=req.body.loginpass;
  global_otp=rn(options);
  

    //nodemailer code

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shoaibsshaikh12@gmail.com',
        pass: '9881Superman'
      }
    });
    console.log(options);
    var mailOptions = {
      from: 'shoaibsshaikh12@gmail.com',
      to: global_umail,
      subject: 'One Time Password',
      text: 'OTP is='+global_otp
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    }); 



res.render('newaccount');
  });
  

//veryfy otp
app.post('/verifyotp',function(req,res){
  console.log(req.body.otpvalue);
  if(req.body.otpvalue==global_otp)
  {


    var sql = "INSERT INTO credentials VALUES ('"+global_umail+"', '"+global_password+"')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
  con.query("SELECT * FROM video order by rand() limit 100", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('shows_video_image',{videos:result});
  });
    console.log(global_umail);
    console.log(global_password);
    console.log(global_otp);
    console.log(req.body.otpvalue)
    
  }
  else
  {
   result.render('newaccount');
  }
  });

 
 
  
//uploading video
app.post('/upload_video',function(req,res){
  upload2(req,res,function(err){
      console.log(req.file);
      console.log(req.file.filename);  
      
      var nm="uploads/videos/"+req.file.filename;
      var seatnumbers=req.body.seatnumber;
      var titlevideo=req.body.title;
      console.log(seatnumbers); 
      console.log(titlevideo); 
      
      
      var sql = "INSERT INTO video VALUES ('"+global_umail+"', '"+nm+"','"+titlevideo+"','"+seatnumbers+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
      con.query("SELECT * FROM video order by rand() limit 100", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.render('shows_video_image',{videos:result});
      });
      
      
  });
  });







//multer initializations
var storage = multer.diskStorage({
    destination:'./public/uploads/images',
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() +path.extname(file.originalname));
    }
  });
  var upload = multer({ storage: storage }).single('user_uploaded_image');
var x;
//multer initializations videos
var storage2 = multer.diskStorage({
    destination:'./public/uploads/videos',
    filename: function(req, file, cb) 
    {
      cb(null, file.fieldname + '-' + Date.now() +path.extname(file.originalname));
    }
  });
  var upload2 = multer({ storage: storage2 }).single('user_uploaded_video');
    var vidupdatedlikes=0;
    var vidupdatedupvotes=0;


    










//to main after uploading video
app.get('/toupload',function(req,res){
  res.render('uploadingvideo');
});

//to show videos pictures
app.get('/tomain',function(req,res){
  con.query("SELECT * FROM video order by rand() limit 100", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('shows_video_image',{videos:result});
  });
});

//to show new account
app.get('/tonewaccount',function(req,res){
  res.render('newaccount');
});

//to login
app.get('/tologin',function(req,res){
  res.render('index');
});


//search functionality
app.post('/search',function(req,res){
  var val=req.body.search;
  var val2=val+'%';
  console.log(val2);
  con.query("SELECT * FROM video where seatnumber='"+val+"' or title like '"+val2+"' order by rand() limit 100 ", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('shows_video_image',{videos:result});
  });
});



app.post('/tomain2',function(req,res){
  con.query("SELECT * FROM video limit 100", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('shows_video_image',{videos:result});
  });
});










//listening
app.listen(port,function(req,res){

    console.log('turned on 3000');
    
    })