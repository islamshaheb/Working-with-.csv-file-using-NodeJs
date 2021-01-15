const csvtojson = require('csvtojson')
const fs = require('fs')
const csvfilepath = 'input.csv'
const csv = require('csv-parser')

const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');


csvtojson ()
.fromFile(csvfilepath)
.then((json) => {
    var len = json.length;
    var alluser = []; // to store all user name 
    var list = new Array(len); //Create one dimensional array 
    for (var i=0; i<len; i++)
    {
        //console.log(json[i].length);

        //Loop to create 2D array using 1D array
        list[i] = new Array(5);
        list[i][0] = json[i].date; list[i][1] = json[i].shift;list[i][2] = json[i].volunteerId;
        list[i][3] = json[i].volunteerName;list[i][4] = json[i].shiftReason;
        
        /*
         insert user in "alluser", if  this user already exist there
         then no need to insert this user */ 
        var present = 0;
        for(var j=0; j< alluser.length ; j++)
        {
            if(list[i][3] == alluser[j])present=1;
        }

        if(!present)alluser.push(list[i][3]);
    }

    //now I have every element in array.Playing with data would be easer than before

    //let "graph_rep" (graph representation) is a list of list(2D array) to store conflicted person 
    var  graph_rep= [];

    //"uwsd" (user with shift and date) is list of a all user with their differnt shift and date 
    var uwsd = [];
    for(var i=0; i<alluser.length; i++)
    {
        graph_rep[alluser[i]]=[];
        uwsd[alluser[i]]=[];
    }


    for(let i=0; i<alluser.length; i++)
    {
        for(let j=0; j<len; j++)
        {
            if(list[j][3] == alluser[i])
            {
                let temp= "";
                temp=temp.concat(list[j][0]);
                temp=temp.concat('+');
                temp=temp.concat(list[j][1]);
                uwsd[alluser[i]].push(temp);
            }
        }
        
    }

    for(let i=0; i<alluser.length; i++)
    {
        for(let j=0; j<uwsd[alluser[i]].length; j++)
        {
            let cur_date_shift = uwsd[alluser[i]][j];
            for(let k=0 ; k<len; k++)
            {
                let temp= "";
                temp=temp.concat(list[k][0]);
                temp=temp.concat('+');
                temp=temp.concat(list[k][1]);
                if(temp == cur_date_shift && list[k][3]!=alluser[i])
                {
                    var pre = 0;
                    for(let l=0; l<graph_rep[alluser[i]].length; l++)
                    {
                        if(graph_rep[alluser[i]][l] == list[k][3])
                        {
                            pre = 1;
                        }
                    }
                    graph_rep[alluser[i]].push(list[k][3]);
                    if(pre == 0)
                    {
                        graph_rep[alluser[i]][list[k][3]]=[];
                    }
                    graph_rep[alluser[i]][list[k][3]].push(temp);
                }
            }
        }
    }
    /*
    "vis" is the array I'm using to mark down which node I already visited.
     I initialize every node as zero as I did not visited a single node yet
    */
    var vis=[];
    for(var i = 0; i<alluser.length; i++)vis[alluser[i]]=0;

    var weighted_array_for_csv =[];

    for(let i=0; i<alluser.length; i++)
    {
        for(let j=0; j<graph_rep[alluser[i]].length; j++)
        {
            let cur_member = graph_rep[alluser[i]][j];
            if(vis[cur_member] == 0)
            {
                let chk = 0;
                for( let k=0; k<j; k++)
                {
                    if(cur_member == graph_rep[alluser[i]][k])
                    {
                        chk = 1;
                        break;
                    }
                }
                if(chk == 0)
                {
                    let cnt = 0;
                    for(let k =0; k<graph_rep[alluser[i]].length; k++)
                    {
                        if(cur_member == graph_rep[alluser[i]][k])cnt++;
                    } 
                    let temp=[alluser[i],cur_member,cnt];
                    weighted_array_for_csv.push(temp);
                }
            }
        }
        vis[alluser[i]]=1;
    }
    //coding phase finished,section is written bellow is for writting data onto the file

    // write .csv file for table 2 and 3
    const header = ['node1', 'Node2','Weight']; 
    const table3 = convertArrayToCSV(weighted_array_for_csv, {
    header,
    separator: ','
    });

    fs.writeFile("output.csv",table3, (err) => { 
    if (err) 
        console.log(err); 
    else { 
        console.log("File  2 written successfully\n"); 
    } 
    });

    //convert our .csv file into .json incase we need it future
    /*
    
    var encodedUri = encodeURI(csv);
        fs.writeFileSync("out.json",JSON.stringify(json),"utf-8",(err) =>
    {
        if(err)console.log(err)
    })
    */

 }) 

