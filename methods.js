var controlh = require("ControlH3");
var express = require('express');
var router = express.Router();
var ipOffice = require("./config/config.json").ipOffice;

router.get('/test1', function (req, res, next) {
 	var hora;
 	var a;
 	var b 
 	controlh.hi(function(result){
 		result = JSON.parse(result);
 		var fecha= new Date();
 		fecha.getSeconds(result.timestamp + 1000 * 3600);
 		a = new Date("February 13, 2014 04:29:00");
		b = new Date("February 12, 2014 03:00:00");
		//La diferencia se da en milisegundos así que debes dividir entre 1000
		var c = ((a-b)/3600000);
	  	console.log(result.timestamp + 1000 *3600);		
		res.send('Hora fecha	: ' + fecha);
 	});

});

router.post('/user', function (req, res) {
	var user = {
		name : req.body.name,
		password :req.body.password
	};

	controlh.signUp(user, function(err, usuario){
		if(err)
			res.send(err);
		else
			res.send(usuario);
	});
});

router.post('/login', function (req, res) {
	if(req.body.name && req.body.password && req.body.date){
		controlh.signIn(req.body.name, req.body.password, new Date(req.body.date), inOffice(req), function(err,usuario){
			if(err){
				res.status(500).jsonp({error : err});
			}
			else{
				var user = {
					name : req.body.name,
					date : req.body.date,
					type : usuario.type
				};
				res.status(200).jsonp(user);
			}
		});
	}
	else{
		res.status(500).jsonp({error: "Enter username and password"});
	}
});

router.post('/logout', function (req, res) {
	if(req.body.name && req.body.password && req.body.date){
		controlh.signOut(req.body.name, req.body.password, new Date(req.body.date), inOffice(req), req.body.labored, function(err,usuario){
			if(err)
			{
				res.status(500).jsonp({error : err});
			}
			else{
				var user = {
					name : req.body.name,
					date : req.body.date,
					type : usuario.type
				};
				res.status(200).jsonp(user);
			}
		});
	}
});

router.get('/workingNow',function (req, res) {
	controlh.workingNow(function(err,usuarios){
		if(err)
			res.status(500);
		else{
			var usersResult = [];
			for (var i = usuarios.length - 1; i >= 0; i--) {
				var usuario = {
					name : usuarios[i].name,
					state : usuarios[i].state	
				} 
				usersResult.push(usuario);
			};
			res.status(200).jsonp(usersResult);
		}
	});
});

router.post('/passwordChange',function(req,res){
	if(req.body.name && req.body.password && req.body.newPassword){
		var user = {
			name : req.body.name,
			password:req.body.password,
			newPassword: req.body.newPassword
		};
		controlh.passwordChange(user,function(err,usuario){				
			if(err){
				res.status(500).jsonp({error : err});
			}else{				
				res.status(200).jsonp(usuario);
			}
		});
	}else{
		res.status(500).jsonp({error: "The data are not complete"});
	}
});

router.post('/schedules',function(req,res){
	if(Object.keys(req.body).length==2){		
		var agendaSubmit={
			idUser: req.body.idUser,
			day: req.body.day
		};		
		controlh.addSchedule(agendaSubmit,function(err,agenda){
			if(err)
				res.status(500).jsonp({error : err});
			else{				
				res.status(200).jsonp(agenda);
			}	
		});
	}else{
		res.status(500).jsonp({error: "The form is incomplete"});
	}
});

router.get('/schedules/:idUser',function(req,res){
	controlh.getSchedulesByUser(parseInt(req.param("idUser")),function(err,agendas){
		if(err){	
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(agendas);
		}
	});
	
});

router.get('/schedules',function(req,res){
	controlh.getAllSchedules(function(err,agendas){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(agendas);
		}
	});
});

var inOffice =function(req){
	var office = false;
	var ipClient = getClientIp(req);
	for (var i = 0; i < ipOffice.length; i++) {
		if(ipClient == 	ipOffice[i].ip){
			office = true;
			i = ipOffice.length; 
		}
	};	
	return office;
}

var getClientIp = function(req) {
  var ipAddress = null;
  var forwardedIpsStr = req.headers['x-forwarded-for'];
  if (forwardedIpsStr) {
    ipAddress = forwardedIpsStr[0];
  }
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

router.get('/horas/:idUser/:year/:month/:day', function (req, res) {
	var info = {
		idUser  : parseInt(req.param("idUser")),
		year  : parseInt(req.param("year")),
		month  : parseInt(req.param("month")),
		day  : parseInt(req.param("day"))
	}
	controlh.getTotalHours(info, function(err, result){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(result);
		}
	});
});

router.get('/horas/:idUser/:year/:month', function (req, res) {
	var info = {
		idUser  : parseInt(req.param("idUser")),
		year  : parseInt(req.param("year")),
		month  : parseInt(req.param("month")),
	}
	controlh.getTotalHours(info, function(err, result){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(result);
		}
	});
});

router.get('/rango/:idUser/:fechaInicial/:fechaFinal', function (req, res) {
	var info = {
		idUser : req.param('idUser'),
		initDate: req.param('fechaInicial'),
		finalDate: req.param('fechaFinal')
	}
	controlh.getHoursInDateRange(info, function(err, result){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(result);
		}
	});
});

router.post('/projects', function(req, res){
	if(Object.keys(req.body).length == 5){
		controlh.addProject(req.body,function(errror,response){
			if(error){
				res.status(500).jsonp({error:error});
			}else{
				res.status(200).jsonp(result);
			}
		});	
	}}else{
		res.status(500).jsonp({error: "The form is incomplete"});
	}	
});

router.get('/projects', function(req,res){
	controlh.getAllProjects(function(err,response){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(response);
		}
	});
});

router.get('/projects/:idProject', function(req,res){
	controlh.getProjectById(parseInt(req.param("idProject")),function(err,response){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(response);
		}
	});
});

module.exports = router;