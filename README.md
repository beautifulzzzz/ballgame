##-上传接口
**`上传接口是硬件用的，用来将一个篮球比赛的实时数据发送给服务器`**

###1.创建游戏 creategame

http://139.224.67.24:8002/creategame    
POST    
{    
　　"userid":"100"    
}    

返回参数：error == null 表示无错误，否则有错    
{    
　　"error":null,    
　　"gameid":7      
}      

> 创建一个比赛，创建的时候将用户ID传给服务器，服务器会返回一个比赛ID


###2.设置步数 setGameUserSteps

http://139.224.67.24:8002/setusersteps       
POST        
{       
　　"gameid":7,         
　　"userid":"100",       
　　"steps":100        
}         

返回参数：error == null 表示无错误，否则有错          
{         
　　"error":null        
}   
     
> 设置用户当前运动步数，用来计算卡里路等数据，上传时需要设置用户id,比赛id,当前步数steps


###3.添加投篮记录  shotIn:0 表示没投进，1表示投进， 为1时必须有angle和distance参数

http://139.224.67.24:8002/addusershot
      
POST       
{         
　　"gameid":7,          
　　"userid":"100",         
　　"shotIn":1,        
　　"angle":120,          
　　"distance":100        
}            

返回参数：error == null 表示无错误，否则有错          
{         
　　"error":null         
}          


##- 查询接口         
**`查询接口是APP客户端调用的，用来获取比赛信息`**

###1.查询最近场次的比赛         

http://139.224.67.24:8002/recentgame        

{        
　　"error":null        
　　"gameid":7,       
　　"createTime":"147xxxxxx"         
}        


###2.查询某用户某个比赛的步数        
http://139.224.67.24:8002/userSteps?gameid=7&userid=100          

{       
　　"error":null,        
　　"steps":100        
}        


###3.查询某用户某个比赛的投球情况      
http://139.224.67.24:8002/userShotResults?gameid=7&userid=100    
{    
　　"error":null,    
　　"shotNum":20,   
　　"shotInNum":12    
}

###4.查询某用户某比赛的投球细节
http://139.224.67.24:8002/userShotDetails?gameid=7&userid=100    
POST    
{    
　　"shotIn":1,    
　　"fromItem":10,    
　　"numItem":5   
}
> - shotIn 为1表示查询投中的细节；为0表示查询未投中的细节；为2表示查询所有投球细节
> - fromItem, numItem 表示从fromItem开始往前查numItem个投球细节（注意：numItem为投中和未投中的总数）   

返回参数：error == null 表示无错误，否则有错          
{         
　　"error":null,     
　　"backNum":3,      
　　"detail":[    
　　　　　　{"shotIn":1,"angle":40,"distance":210,"shotTime":'1476774088446'},   
　　　　　　{"shotIn":1,"angle":30,"distance":230,"shotTime":'1476774088357'},   
　　　　　　{"shotIn":1,"angle":20,"distance":260,"shotTime":'1476774088190'},  
　　　　　　]        
}          