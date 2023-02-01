let { Client } = require("pg");
const client = new Client({
    user:"postgres",
    password:"Saloni@1231",
    database:"postgres",
    port:5432,
    host:"db.eyzlslzfvanhmztlwcls.supabase.co",
    ssl:{ rejectUnauthorized: false },
});
client.connect(function(res,error){
    console.log(`Connected!!!`);
});

let express = require("express");
let app = express();
app.use(express.json());
app.use(function(req,res,next){
res.header("Access-Control-Allow-Origin","*");
res.header("Access-Control-Allow-Methods",
"GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD");
res.header("Access-Control-Allow-Headers",
"Origin,X-Requested-With,Content-Type,Accept");
next();
});
var port = process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app listening on port ${port}!`));

makeSearchString=(query)=>{
    let {department="",designation="",gender=""}=query
    let searchStr="";
    let count1 = 1;
    let count2 = department?2:1;
    let count3 = department?designation?3:2:designation?department?3:2:1;
    searchStr=addToquery(searchStr,"department",department,count1);
    searchStr=addToquery(searchStr,"designation",designation,count2);
    searchStr=addToquery(searchStr,"gender",gender,count3);
    return searchStr;
    }
addToquery=(str,paraNam,paraVal,count)=>
    paraVal?str?str+" AND "+paraNam+"=$"+count:paraNam+"=$"+count:str;

makeStr=(query)=>{
    let {department="",designation="",gender=""}=query;
    let searchStr="";
    searchStr=addTo(searchStr,department);
    searchStr=addTo(searchStr,designation);
    searchStr=addTo(searchStr,gender);
    return searchStr;
    }
addTo=(str,pval)=>
pval?str?str+","+pval:pval:str;

app.get("/emps",function(req,res,next){

 let qry = `SELECT * FROM employees`;
 let department = req.query.department;
 let designation = req.query.designation;
 let sortBy= req.query.sortBy;
 let gender = req.query.gender;
 let values = "";
 let queries = {department,designation,gender};

   if(department||designation||gender){
    if(sortBy){
    qry = `SELECT * FROM employees WHERE ${makeSearchString(queries)} ORDER BY ${sortBy}`;
    values= makeStr(queries).split(",");
   }else{
    qry = `SELECT * FROM employees WHERE ${makeSearchString(queries)}`;
    values= makeStr(queries).split(",");
   }
   }else if(sortBy){
    qry = `SELECT * FROM employees ORDER BY ${sortBy} `;
   }
 if(values){
    client.query(qry,values,function(err, results){
        if(err){ res.status(404).send(err); }
        res.send(results.rows);
     });
 }
 else{
 client.query(qry,function(err, results){
    if(err){ res.status(404).send(err); }
     res.send(results.rows);
 });
}
})
app.put("/emps/:empcode",function(req,res,next){
    console.log("Inside put of user");
    let empCode = req.params.empcode;
    let body = req.body;
    let values = [body.name,body.department,body.designation,body.salary,body.gender,empCode];
    let qry = `UPDATE employees SET name=$1,department=$2,designation=$3,salary=$4,gender=$5 WHERE empcode=$6`;
    client.query(qry,values,function(err,result){
        if(err){res.status(404).send(err);}
        res.send(""+result.rowCount+" updation successful");
    });
})
app.post("/emps",function(req,res,next){
 console.log("Inside post of employees");
 var values = Object.values(req.body);
 //console.log(values);
 const query = `INSERT INTO employees(empcode,name,department,designation,salary,gender) VALUES($1,$2,$3,$4,$5,$6)`;
 client.query(query,values,function(err,result){
    if(err){res.status(404).send(err);}
    res.send(""+result.rowCount+" insertion successful");
 })
})
app.get("/emps/:empcode",function(req,res,next){
    let empcode = req.params.empcode;
    //console.log(empcode);
    const qry =`SELECT * FROM employees WHERE empcode=$1`;
    client.query(qry,[empcode],function(err,result={}){
        let {rows=[]}= result;
        if(err){res.status(404).send(err);
        }
        if(rows.length>0){
            res.send(rows);
        }else{
            res.status(404).send("No employee found")
        }
       // client.end();
    })   
})

app.delete("/emps/:empcode",function(req,res){
    let empcode = req.params.empcode;
    let qry = `DELETE FROM employees WHERE empcode=$1`;
    client.query(qry,[empcode],function(err,result){
        if(err) res.status(404).send(err);
        res.send(""+result.rowCount+" Deleted Successfully");
    })
})