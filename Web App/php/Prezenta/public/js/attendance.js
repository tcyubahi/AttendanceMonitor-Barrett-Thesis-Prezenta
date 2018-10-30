/*
*	Author: Tresor Cyubahiro
*	Barrett Thesis Project - Web Portal - Iteration 2
*	
*/
var app = angular.module('attendanceApp', ['ngRoute', 'ngAnimate', 'toastr']);

app.controller('Login', function($scope, $timeout, $http, toastr, $window) {

	$scope.cookiesDisabled = !navigator.cookieEnabled;

	//console.log($scope.cookiesDisabled);

	// Enable disabled cokkies Overlay in GUI
	if ($scope.cookiesDisabled) {
		document.getElementById("cookieOverlay").style.visibility = "visible";
	}

	// =============== VARS ====================
	$scope.showLoader = false;
	showSignUpLoader = true;
	$scope.showLogin = true;
	$scope.showRegister = false;
	$scope.username = "";
	$scope.password = "";

	// SignUp Vars
	$scope.signUpEmail = "";
	$scope.signUpUserName = "";
	$scope.signUpPassword = "";
	$scope.signUpConfirmPassword = "";

	$scope.forgotEmail = "";
	$scope.tempUsername = "";
	$scope.tempPass = "";

	//Enable Password reset in GUI
	$scope.forgot = function () {
		$('#forgotModal').modal('show');
	}

	// Recover password
	$scope.AccRecover = function () {

		if (!$scope.validateEmail($scope.forgotEmail)) {
			toastr.warning('Please enter a valid email address', 'Invalid Email');
		} else {

			$('#forgotModal').modal('hide');

			$scope.showLoader = false;

			$scope.data = {
				'email': $scope.forgotEmail
			};

			console.log($scope.data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/password/reset',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				$scope.showLoader = false;

				if (response.data.status == 'success') {
					$scope.tempUsername = response.data.data.username;
					$scope.tempPass = response.data.data.password;
					$('#resetModal').modal('show');
				} else {

					toastr.error(response);
				}

			}, function (response) {
				$scope.showLoader = false;
				console.log(response);
				toastr.error("Unkown error occured, please try again", "Server Error");
			});
		}
	}

	// Re-check whether Cookies are enabled in browser
	$scope.checkCookies = function () {
		$scope.cookiesDisabled = !navigator.cookieEnabled;
	}

	// Menu toggle == Experimental == Ignore 
	$scope.menu = function () {
		$scope.showLogin = !$scope.showLogin;
		$scope.showRegister = !$scope.showRegister;
	}

	// Log user In
	$scope.login = function() {

		if ($scope.username == "" || $scope.password == "") {
			toastr.warning('All fields are required', 'Empty Fields');
		} else {

			$scope.showLoader = true;

			$scope.data = {
				'username': $scope.username, 
				'password': $scope.password
			};

			console.log($scope.data);
			return $http({
				url: 'http://localhost/php/Prezenta/public/user/login',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					$scope.showLoader = false;
					$window.location.href = '/php/Prezenta/public'+response.data.render;
				} else {
					$scope.showLoader = false;
					toastr.error(response.data.message, response.data.code);
				}

			}, function (response) {
				$scope.showLoader = false;
				console.log("Failed:");
				toastr.error("Unkown error occured, please try again", "Server Error");
			});

		}

	}

	// Sign new user
	$scope.signUp = function () {

		if (!$scope.validateEmail($scope.signUpEmail)) {
			toastr.warning('Please enter a valid email address', 'Invalid Email');
		} else if ($scope.signUpEmail == "" || $scope.signUpUserName == "" || $scope.signUpPassword == "" || $scope.signUpConfirmPassword == "") {
			toastr.warning('All fields are required', 'Empty Fields');
		} else if ($scope.signUpPassword != $scope.signUpConfirmPassword) {
			toastr.warning('Your passwords do not match', 'Password Mismatch');
		} else {

			$scope.showLoader = true;
			$scope.data = {
				'username': $scope.signUpUserName, 
				'email': $scope.signUpEmail,
				'password': $scope.signUpPassword
			};

			console.log($scope.data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/user/signUp',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					$('#addUserModal').modal('hide');
					$scope.showLoader = false;
					$window.location.href = '/php/Prezenta/public'+response.data.render;
				} else {
					$scope.showLoader = false;
					toastr.error(response.data.message, response.data.code);
					//$('#addUserModal').modal('hide');
				}

			}, function (response) {
				$scope.showLoader = false;
				console.log("Failed:");
				toastr.error("Unkown error occured, please try again", "Server Error");
				$('#addUserModal').modal('hide');
			});

		}
	}

	// Validate email
	$scope.validateEmail = function (email){
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
			return true;
		} else {
			return false;
		}
	}
})

app.controller('Home', function($scope, $interval, $http, toastr, $timeout, $window) {

	// Route to dashboard
	$scope.goBack = function () {
		$window.location.href = ('/php/Prezenta/public/dashboard');
	}

	// Route to students list
	$scope.goToAddAttendees = function () {
		$window.location.href = ('/php/Prezenta/public/add');
	}

	// Route to class logs
	$scope.goToLogs = function () {
		$window.location.href = ('/php/Prezenta/public/logs');
	}

	// Route to reports
	$scope.goToReports = function () {
		$window.location.href = ('/php/Prezenta/public/reports');
	}

	// ========= VARS ================
	$scope.showLoader = false;
	$scope.showReadIDLoader = false;
	$scope.date = new Date(); 
	$scope.startTime = new Date();
	$scope.timer = 0;
	$scope.buttonText = "Start Session";
	$scope.sessionStarted = false;
	$scope.newAttendeeID = "";
	$scope.newAttendeeFirstName = "";
	$scope.newAttendeeLastName = "";
	$scope.reportTable = true;
	$scope.singleReport = false;
	//$scope.signature = false;

	$scope.users = null;
	$scope.allAttendees = null;
	$scope.attendeeData = null;
	$scope.attendeeFirstName = "";
	$scope.attendeeLastName = "";
	$scope.attendeeID = "";
	$scope.attendeeData = null;
	$scope.presentNum = 0;

	$scope.jsonFile = "";

	// =======================
	$scope.students = [];
	$scope.sessionLogs = [];
	$scope.showAllLogs = true;
	// =======================

	$scope.sessionTitle = "";
	$scope.deletePassword = "";
	$scope.showAddAttendeeLoader = false;

	// List class (session) logs
	$scope.getSessionLogs = function () {

		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/session/get/logs',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);
			if (response.data.status == 'success') {
				$scope.sessionLogs = [];
				console.log(response.data.data);
				$scope.sessionLogs = response.data.data;
				$('#logsModal').modal('show');
			} else {

			}

			$scope.showLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showLoader = true;
			});

	}

	// Stop running session
	$scope.stopSession = function() {

		var date = new Date();
		var time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

		var data = {
			'date': $scope.startedDate,
			'starttime': $scope.startedTime,
			'endtime': time
		};

			console.log(data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/session/end',
				method: 'POST',
				data: data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);
				if (response.data.status == 'success') {
					$scope.timer = 0;
					$interval.cancel($scope.timerInterval);
					$interval.cancel($scope.readPresenceInterval);
					document.getElementById("buttonIcon").classList.remove('fa-pause');
					document.getElementById("buttonIcon").classList.add('fa-play');
					document.getElementById("sessionButton").classList.remove('round-btn-active');
					document.getElementById("sessionButton").classList.add('round-btn');
					$scope.buttonText = "Start Session";
					$scope.sessionStarted = false;
				} else {
					toastr.error("Error starting session, please reload and try again", "Server Error");
				}

				$scope.showLoader = false;

			}, function (response) {
				toastr.error(response);
				console.log(response);
				$scope.showLoader = false;
			});

	}

	// Save stopped session
	$scope.saveSessionLog = function(log) {

		console.log(log);

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/sessionLogs/add',
			method: 'POST',
			data: log,
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response);

			if (response.data.status == 'success') {

			} else {

			}


		}, function (response) {

		});

	}

	$scope.sessionRunning = false;
	$scope.startedTime = "";
	$scope.satrtedDate = "";

	// Set active session in DB
	$scope.setActiveSession = function () {
		if(!$scope.sessionStarted){

			var date = new Date();

			var year = date.getFullYear();
			var month = date.getMonth()+1;
			var day = date.getDate();
			var time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
			var date = year+"-"+month+"-"+day;

			$scope.showLoader = true;

			$scope.startedTime = time;
			$scope.startedDate = date;

			var data = {
				'date': date,
				'starttime': time
			};

			console.log(data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/session/start',
				method: 'POST',
				data: data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);
				if (response.data.status == 'success') {
					$scope.saveSessionLog(data);
					$scope.startSession(date, time);
				} else {
					toastr.error("Error starting session, please reload and try again", "Server Error");
				}

				$scope.showLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				console.log(response);
				$scope.showLoader = false;
			});

		} else{
			console.log("STOPPP!!!");
			$scope.stopSession();
		}

	}

	// start a session
	$scope.startSession = function(date, time) {

		$scope.timer = 0;

			$scope.sessionStarted = true;

			if ($scope.timerInterval) {
				$interval.cancel($scope.timerInterval);
				$interval.cancel($scope.readPresenceInterval);
			}

			$scope.onInterval = function(){
				$scope.timer++;
			}

			$scope.readPresence = function() {

				return $http({
					url: 'http://localhost/php/Prezenta/public/data/session/get/ckechins',
					method: 'GET',
					params: {
						'date': date,
						'time': time
					},
					headers:{
						'Content-Type': 'application/json; charset=UTF-8'
					}
				}).then(function (response) {

					console.log(response.data);

					if (response.data.status == 'success') {
						$scope.students = [];
						console.log(response.data.data);
						$scope.students = response.data.data;

					} else {

					}

				}, function (response) {
					console.log(response);
				});
			}

			$scope.timerInterval = $interval($scope.onInterval, 1000);
			$scope.readPresenceInterval = $interval($scope.readPresence, 1000);

			document.getElementById("buttonIcon").classList.remove('fa-play');
			document.getElementById("buttonIcon").classList.add('fa-pause');
			document.getElementById("sessionButton").classList.remove('round-btn');
			document.getElementById("sessionButton").classList.add('round-btn-active');

			$scope.buttonText = "End Session";

	}

	// Print current session
	$scope.printSession = function() {
		$scope.printPDF();	
	}

	// Print to PDF
	$scope.printPDF = function(component, session) {

		var header = "";
		var pdf = new jsPDF('p', 'pt', 'letter');
		var options = {
			background: '#FFFFFF'
		};

		var year = $scope.date.getFullYear();
		var month = $scope.date.getMonth()+1;
		var day = $scope.date.getDate();
		header = session+" "+year+"-"+month+"-"+day;
		pdf.addHTML(document.getElementById(component), options, function() {
			pdf.autoPrint();
			pdf.save(header+'_Prezenta.pdf');
		});

	}

	// Permanently delete class
	$scope.deleteSession = function () {
		console.log($scope.sessionTitle);
		if ($scope.deletePassword == "") {
			toastr.warning("Please type your password to confirm", "Password needed");
		} else {

			var data = {
				'session': $scope.sessionTitle,
				'password': $scope.deletePassword
			}

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/delete/session',
				method: 'DELETE',
				data: data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					//$scope.showReadIDLoader = false;

					$('#deleteModal').modal('hide');

					$window.location.href = '/php/Prezenta/public/dashboard';
					//$scope.getStudents();
				} else {
					//$scope.showReadIDLoader = false;
					toastr.error(response.data.message, response.data.code);
				}


			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				//$scope.showReadIDLoader = true;
			});

		}
	}

	// ==== Experimantal == Ignore
	$scope.showReport = function() {
		$scope.reportTable = !$scope.reportTable;
		$timeout(function() { $scope.singleReport = !$scope.singleReport;}, 100);
	}

	// Log user out
	$scope.logout = function() {
		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/user/logout',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$window.location.href = '/php/Prezenta/public'+response.data.render;
			} else {
				$scope.showLoader = false;
				toastr.error(response.data.message, response.data.code);
			}

			}, function (response) {

		});
	}

})

app.controller('Logs', function($scope, $interval, $http, toastr, $timeout, $window) {

	// Route to class home
	$scope.goBack = function () {
		$window.location.href = ('/php/Prezenta/public/session');
	}

	// Route to students' list
	$scope.goToAddAttendees = function () {
		$window.location.href = ('/php/Prezenta/public/add');
	}

	// Route to Reports
	$scope.goToReports = function () {
		$window.location.href = ('/php/Prezenta/public/reports');
	}

	// Log user out
	$scope.logout = function() {
		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/user/logout',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$window.location.href = '/php/Prezenta/public'+response.data.render;
			} else {
				$scope.showLoader = false;
				toastr.error(response.data.message, response.data.code);
			}

			}, function (response) {

		});
	}

	// =========== VARS ===============
	$scope.showLoader = false;
	$scope.showDeleteLoader = false;
	$scope.date = new Date(); 
	$scope.startTime = new Date();
	$scope.timer = 0;
	$scope.buttonText = "Start Session";
	$scope.sessionStarted = false;
	$scope.newAttendeeID = "";
	$scope.newAttendeeFirstName = "";
	$scope.newAttendeeLastName = "";
	$scope.reportTable = true;
	$scope.singleReport = false;
	//$scope.signature = false;

	$scope.users = null;
	$scope.allAttendees = null;
	$scope.attendeeData = null;
	$scope.attendeeFirstName = "";
	$scope.attendeeLastName = "";
	$scope.attendeeID = "";
	$scope.attendeeData = null;
	$scope.presentNum = 0;

	$scope.jsonFile = "";

	// ============================
	$scope.students = [];
	$scope.sessionLogs = [];
	$scope.showAllLogs = true;
	// ============================

	$scope.sessionTitle = "";
	$scope.deletePassword = "";
	$scope.showAddAttendeeLoader = false;

	$scope.selectedSession = {};

	// List class (session) logs
	$scope.getSessionLogs = function () {
		
		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/session/get/logs',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);
			if (response.data.status == 'success') {
				$scope.sessionLogs = [];
				console.log(response.data.data);
				$scope.sessionLogs = response.data.data;
			} else {

			}

			$scope.showLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showLoader = true;
			});

	}

	$scope.getSessionLogs();

	// view log's details
	$scope.viewLog = function (session) {
		$scope.showAllLogs = false;

		$scope.selectedSession = session;

		$scope.showLoader = true;


		return $http({
			url: 'http://localhost/php/Prezenta/public/data/session/log/get/attendees',
			method: 'POST',
			data: {'date': session.date, 'starttime': session.starttime, 'endtime': session.endtime},
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);
			if (response.data.status == 'success') {
				$scope.students = response.data.data;
				$('#logsModal').modal('show');
			} else {

				toastr.error(response.data.message, response.data.code);

			}

			$scope.showLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				console.log(response);
				$scope.showLoader = true;
			});
	}

	$scope.selectedLog = {};
	$scope.deleteLog =  function(log){
		$('#deleteModal').modal('show');
		$scope.selectedLog = log;

	}


	// Permanently delete log and its data
	$scope.confirmLogDelete = function () {
		console.log($scope.selectedLog);
		if ($scope.deletePassword == "") {
			toastr.warning("Please type your password to confirm", "Password needed");
		} else {

			$scope.showDeleteLoader = true;

			var data = {
				'session': $scope.selectedLog.session,
				'date': $scope.selectedLog.date,
				'starttime': $scope.selectedLog.starttime,
				'endtime': $scope.selectedLog.endtime,
				'password': $scope.deletePassword
			}

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/session/log/delete',
				method: 'DELETE',
				data: data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);
				$scope.showDeleteLoader = false;

				if (response.data.status == 'success') {

					$('#deleteModal').modal('hide');

					$scope.getSessionLogs();

				} else {
					toastr.error(response.data.message, response.data.code);
				}


			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showDeleteLoader = false;
			});

		}
	}

	// Print session
	$scope.printSession = function() {
		$scope.printPDF();	
	}

	// Print PDF
	$scope.printPDF = function(component) {

		var header = "";
		var pdf = new jsPDF('p', 'pt', 'letter');
		var options = {
			background: '#FFFFFF'
		};

		var year = $scope.date.getFullYear();
		var month = $scope.date.getMonth()+1;
		var day = $scope.date.getDate();
		header = $scope.selectedSession.session+" Log "+$scope.selectedSession.date+" "+$scope.selectedSession.starttime;
		pdf.addHTML(document.getElementById(component), options, function() {
			pdf.autoPrint();
			pdf.save(header+'_Prezenta.pdf');
		});

	}

	// Experimental == Ignore
	$scope.showReport = function() {
		$scope.reportTable = !$scope.reportTable;
		$timeout(function() { $scope.singleReport = !$scope.singleReport;}, 100);
	}

})

app.controller('Reports', function($scope, $interval, $http, toastr, $timeout, $window) {

	// Route to class home
	$scope.goBack = function () {
		$window.location.href = ('/php/Prezenta/public/session');
	}

	// Route to logs
	$scope.goToLogs = function () {
		$window.location.href = ('/php/Prezenta/public/logs');
	}

	// Route to attendees
	$scope.goToAddAttendees = function () {
		$window.location.href = ('/php/Prezenta/public/add');
	}

	// Log user out 
	$scope.logout = function() {
		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/user/logout',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$window.location.href = '/php/Prezenta/public'+response.data.render;
			} else {
				$scope.showLoader = false;
				toastr.error(response.data.message, response.data.code);
			}

			}, function (response) {

		});
	}

	// ========= VARS ===============
	$scope.showLoader = false;
	$scope.showReadIDLoader = false;
	$scope.date = new Date(); 
	$scope.startTime = new Date();
	$scope.timer = 0;
	$scope.buttonText = "Start Session";
	$scope.sessionStarted = false;
	$scope.newAttendeeID = "";
	$scope.newAttendeeFirstName = "";
	$scope.newAttendeeLastName = "";
	$scope.reportTable = true;
	$scope.singleReport = false;
	//$scope.signature = false;

	$scope.users = null;
	$scope.allAttendees = null;
	$scope.attendeeData = null;
	$scope.attendeeFirstName = "";
	$scope.attendeeLastName = "";
	$scope.attendeeID = "";
	$scope.attendeeData = null;
	$scope.presentNum = 0;

	$scope.jsonFile = "";

	// =============================
	$scope.students = [];
	$scope.sessionLogs = [];
	$scope.showAllLogs = true;
	// =============================

	$scope.sessionTitle = "";
	$scope.deletePassword = "";
	$scope.showAddAttendeeLoader = false;

	//var pdfdoc = new jsPDF();

	// Experimantal == Ignore
	$scope.seeLogs = function() {
		$('#reportsModal').modal('show');
	}

	// List students in a class
	$scope.getStudents = function () {

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/session/get/students',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$scope.students = [];
				console.log(response.data.data);
				$scope.students = response.data.data;
			} else {

			}

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
			});
	}

	// Get class logs
	$scope.getSessionLogs = function () {

		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/session/get/logs',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);
			if (response.data.status == 'success') {
				$scope.sessionLogs = [];
				console.log(response.data.data);
				$scope.sessionLogs = response.data.data;
				$('#logsModal').modal('show');
			} else {
				//$scope.showLoader = false;
				//toastr.error(response.data.message, response.data.code);
					//$('#addUserModal').modal('hide');
			}

			$scope.showLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showLoader = true;
			});

	}

	$scope.viewLog = function (session) {
		$scope.showAllLogs = false;
		//console.log(session.date);

		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/session/log/get/attendees',
			method: 'POST',
			data: {'date': session.date},
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);
			if (response.data.status == 'success') {
				//$scope.sessionLogs = [];
				//console.log(response.data.data);
				//$scope.sessionLogs = response.data.data;
				//$('#logsModal').modal('show');
			} else {
				//$scope.showLoader = false;
				//toastr.error(response.data.message, response.data.code);
					//$('#addUserModal').modal('hide');
			}

			$scope.showLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				console.log(response);
				$scope.showLoader = true;
			});
	}

	function saveLog (log) {

		console.log(log);

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/logs/add',
			method: 'POST',
			data: log,
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response);

			if (response.data.status == 'success') {

			} else {

			}


		}, function (response) {

		});

	}

	function saveSessionLog (log) {

		console.log(log);

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/sessionLogs/add',
			method: 'POST',
			data: log,
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response);

			if (response.data.status == 'success') {

			} else {

			}


		}, function (response) {

		});

	}

	function saveAttendee (attendee) {

			$scope.data = {
				'idNum': attendee.ID,
				'firstName': attendee.firstname, 
				'lastName': attendee.lastname,
				'asurite': attendee.asurite
			};

			console.log($scope.data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/attendees/add',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {

				} else {

				}

			}, function (response) {
			});

	}

	$scope.jsonFileData = "";
	$scope.uploadJson = function () {

		//console.log("JSON");
		//console.log($scope.fileData);

		$scope.showLoader = true;

		var date = new Date($scope.jsonFileData.Date);

		console.log(date);

		//var formattedDate = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate();

		for (var i = 0; i < $scope.jsonFileData.ids.length; i++) {
			
			var log = {
				'id': $scope.jsonFileData.ids[i].id,
				'date': date,
				'time': $scope.jsonFileData.ids[i].time
			}

			saveLog(log);
		}

		var sessionLog = {
			'date': date,
			'time': $scope.jsonFileData.Time,
		};

		saveSessionLog(sessionLog);

		$scope.showLoader = false;
		$('#uploadModal').modal('hide');
		toastr.success("Log has been added", "Success");

	}

	$scope.csvFileData = "";
	$scope.uploadCsv = function () {

		//console.log("JSON");
		//console.log($scope.fileData);

		$scope.showAddAttendeeLoader = true;

		var titles = $scope.csvFileData[0].split(",");
		console.log(titles);

		for (var i = 1; i < $scope.csvFileData.length; i++) {

			var currentAttendee = $scope.csvFileData[i].split(",");

			if (currentAttendee.length === 4) {
				var data = {
					'firstname': currentAttendee[0],
					'lastname': currentAttendee[1],
					'asurite': currentAttendee[2],
					'ID': currentAttendee[3] 
				}

				saveAttendee(data);
			}

		}

		$scope.showAddAttendeeLoader = false;
		$scope.getStudents();
		$('#addUserModal').modal('hide');
		toastr.success("Attendees have been added", "Success");

	}

	function handleFileJSONSelection(evt) {
		
		var files = evt.target.files;
		
		var selectFile = files[0];
		$scope.jsonFile = selectFile;
		var name = selectFile.name;
		var size = selectFile.size;
		var type = selectFile.type;
		var dateModified = selectFile.lastModifiedDate? selectFile.lastModifiedDate.toLocaleDateString(): 'n/a';

		var output = '<p style="font-size:12px;"><strong>'+name+'</strong> ('+type+') - '+size+' bytes, last modified: '+dateModified+'</p>';
		document.getElementById("selectJSONFile").innerHTML = output;

		var reader = new FileReader();
		reader.onload = onJSONReaderLoad;

		reader.readAsText(selectFile, 'UTF-8');

	}

	function handleFileCSVSelection(evt) {
		
		var files = evt.target.files;
		
		var selectFile = files[0];
		$scope.csvFile = selectFile;
		var name = selectFile.name;
		var size = selectFile.size;
		var type = selectFile.type;
		var dateModified = selectFile.lastModifiedDate? selectFile.lastModifiedDate.toLocaleDateString(): 'n/a';

		var output = '<p style="font-size:12px;"><strong>'+name+'</strong> ('+type+') - '+size+' bytes, last modified: '+dateModified+'</p>';
		document.getElementById("selectCSVFile").innerHTML = output;

		var reader = new FileReader();
		reader.onload = onCSVReaderLoad;

		reader.readAsText(selectFile, 'UTF-8');

	}

	function onJSONReaderLoad(evt) {
		$scope.jsonFileData = JSON.parse(evt.target.result);
	}

	function onCSVReaderLoad(evt) {
		$scope.csvFileData = evt.target.result.split("\n");
		console.log($scope.csvFileData);
	}

	document.getElementById('jsonFile').addEventListener('change', handleFileJSONSelection, false);
	document.getElementById('csvFile').addEventListener('change', handleFileCSVSelection, false);


	$scope.stopSession = function() {
		$scope.timer = 0;
		$interval.cancel($scope.timerInterval);
		$interval.cancel($scope.readPresenceInterval);
		document.getElementById("buttonIcon").classList.remove('fa-pause');
		document.getElementById("buttonIcon").classList.add('fa-play');
		document.getElementById("sessionButton").classList.remove('round-btn-active');
		document.getElementById("sessionButton").classList.add('round-btn');
		$scope.buttonText = "Start Session";
		$scope.sessionStarted = false;
	}

	$scope.startSession = function() {

		$scope.timer = 0;

		if(!$scope.sessionStarted){

			$scope.sessionStarted = true;

			if ($scope.timerInterval) {
				$interval.cancel($scope.timerInterval);
				$interval.cancel($scope.readPresenceInterval);
			}

			$scope.onInterval = function(){
				$scope.timer++;
			}

			$scope.readPresence = function() {

				var year = $scope.date.getFullYear();
				var month = $scope.date.getMonth()+1;
				var day = $scope.date.getDate();
				var time = $scope.date.getHours()+":"+$scope.date.getMinutes()+":"+$scope.date.getSeconds();

				//console.log(time);

			$http({
            	method: 'GET',
            	url: 'http:/localhost/php/AM/readData.php',
            	params: {'dateToday': year+"-"+month+"-"+day, 'meeting': "ser456", 'time': time}  

        	}).then(function (response) {
            $scope.users = response.data; 
            $scope.presentNum = $scope.users.length; 
            console.log(response.data);
          }, function (response) {
          	console.log("Failed:");
            console.log(response.data,response.status);
        });
	}

			$scope.timerInterval = $interval($scope.onInterval, 1000);
			$scope.readPresenceInterval = $interval($scope.readPresence, 1000);

			document.getElementById("buttonIcon").classList.remove('fa-play');
			document.getElementById("buttonIcon").classList.add('fa-pause');
			document.getElementById("sessionButton").classList.remove('round-btn');
			document.getElementById("sessionButton").classList.add('round-btn-active');

			$scope.buttonText = "End Session";

		} else{
			$scope.stopSession();
		}
	}

	$scope.printSession = function() {
		// if($scope.sessionStarted == false){
		// 	toastr.info('No Session is in progress!');
		// } else if ($scope.users.length == 0) {
		// 	toastr.info('No attendees in Session :(');
		// }else{

		// }
		$scope.printPDF();	
	}

	$scope.printPDF = function(component) {

		var header = "";
		var pdf = new jsPDF('p', 'pt', 'letter');
		var options = {
			background: '#FFFFFF'
		};

		if (component == 'oneReport') {
			header = $scope.attendeeFirstName+"-"+$scope.attendeeLastName;	
			pdf.addHTML(document.getElementById(component), options, function() {
				pdf.autoPrint();
	    		pdf.save(header+'_Prezenta.pdf');
			});

		} else {
			if($scope.sessionStarted == false){
				toastr.info('No Session is in progress!');
			} else if ($scope.users.length == 0) {
				toastr.info('No attendees in Session :(');
			} else{
				var year = $scope.date.getFullYear();
				var month = $scope.date.getMonth()+1;
				var day = $scope.date.getDate();
				header = "ser456_"+year+"-"+month+"-"+day;
				pdf.addHTML(document.getElementById(component), options, function() {
					pdf.autoPrint();
		    		pdf.save(header+'_Prezenta.pdf');
				});
			}
		} 
	}

	$scope.readNewID = function() {

		$scope.showReadIDLoader = false;
		$scope.clickTime = new Date();
		var year = $scope.clickTime.getFullYear();
		var month = $scope.clickTime.getMonth()+1;
		var day = $scope.clickTime.getDate();
		var date = year+"-"+month+"-"+day;

		console.log($scope.clickTime.getHours()+":"+$scope.clickTime.getMinutes()+":"+$scope.clickTime.getSeconds());

		$scope.getID = function () {
			$http({
			method: 'GET',
            url: 'http:/localhost/php/AM/readNewID.php',
            params: {meeting: "ser456", time: $scope.clickTime.getHours()+":"+$scope.clickTime.getMinutes()+":"+$scope.clickTime.getSeconds(), date: date } 
        	}).then(function (response) {
        		//console.log("Success");
        		if (response.data != 'error') {	
        			$interval.cancel($scope.getIDInterval);
            		$scope.newAttendeeID = response.data;
            		console.log($scope.newAttendeeID);
        			$scope.showReadIDLoader = false;
        		}
          	}, function (response) {
          		console.log("Failed:");
        	});
		}

		$scope.getIDInterval = $interval($scope.getID, 1000);
	}

	$scope.addAttendee = function() {

		if ($scope.newAttendeeID == "" || $scope.newAttendeeFirstName == "" || $scope.newAttendeeLastName == "") {
			toastr.warning("All fields are required", "Empty Field(s)");
		} else {
			$scope.showReadIDLoader = true;
			$scope.data = {
				'idNum': $scope.newAttendeeID,
				'firstName': $scope.newAttendeeFirstName, 
				'lastName': $scope.newAttendeeLastName
			};

			console.log($scope.data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/attendees/add',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					$scope.showReadIDLoader = false;
					console.log(response.data.data);
					$scope.getStudents();
					$('#addUserModal').modal('hide');
					toastr.success('Attendee was successfully added', 'Success');
				} else {
					$scope.showReadIDLoader = false;
					toastr.error(response.data.message, response.data.code);
				}


			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showReadIDLoader = true;
			});

			$scope.newAttendeeID = "";
			$scope.newAttendeeFirstName = ""; 
			$scope.newAttendeeLastName = "";

		}
			
	}

	$scope.deleteSession = function () {
		console.log($scope.sessionTitle);
		if ($scope.deletePassword == "") {
			toastr.warning("Please type your password to confirm", "Password needed");
		} else {

			var data = {
				'session': $scope.sessionTitle,
				'password': $scope.deletePassword
			}

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/delete/session',
				method: 'DELETE',
				data: data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					//$scope.showReadIDLoader = false;

					$('#deleteModal').modal('hide');

					$window.location.href = '/php/Prezenta/public/dashboard';
					//$scope.getStudents();
				} else {
					//$scope.showReadIDLoader = false;
					toastr.error(response.data.message, response.data.code);
				}


			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				//$scope.showReadIDLoader = true;
			});

		}
	}

	$scope.showReport = function() {
		$scope.reportTable = !$scope.reportTable;
		$timeout(function() { $scope.singleReport = !$scope.singleReport;}, 100);
	}

	$scope.getAllAttendees = function() {
		
		$http({
			method: 'GET',
            url: 'http:/localhost/php/AM/readAllAttendees.php'
        	}).then(function (response) {
        		console.log("Success");
        		console.log(response.data);
        		$scope.allAttendees = response.data;
          	}, function (response) {
          		console.log("Failed:");
        	});
	}

	$scope.getAttendeeReport = function(fName, lName, id) {

		$scope.attendeeFirstName = fName;
		$scope.attendeeLastName = lName;
		$scope.attendeeID = id;	

		var data = {
			'id': $scope.attendeeID
		}

		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/attendee/logs',
			method: 'POST',
			data: data,
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				console.log(response.data.data);
				$scope.attendeeData = response.data.data;
				$('#reportsModal').modal('show');
			} else {

				toastr.error(response.data.message, response.data.code);

			}

			$scope.showLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showLoader = false;
			});

	}


	$scope.newFirstName = "";
	$scope.newLastName = "";
	$scope.currentAttendeeID = "";

	$scope.edit = function (id, firstname, lastname) {
		$scope.newFirstName = firstname;
		$scope.newLastName = lastname;
		$scope.currentAttendeeID = id;

		console.log(id+" "+firstname+" "+lastname);

		$('#editAttendeeModal').modal('show');

	}

	$scope.deleteAttendee = function (id, firstname, lastname) {
		
		$scope.newFirstName = firstname;
		$scope.newLastName = lastname;
		$scope.currentAttendeeID = id;

		$('#deleteAttendeeModal').modal('show');

	}

	$scope.deleteAttendeeConfirm = function () {

		var data = {
			'id': $scope.currentAttendeeID
		}

		console.log(data);

		return $http({
			url: 'http://localhost/php/Prezenta/public/data/delete/attendee',
			method: 'DELETE',
			data: data,
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
					//$scope.showReadIDLoader = false;

					$('#deleteAttendeeModal').modal('hide');
					$scope.getStudents();

				} else {
					//$scope.showReadIDLoader = false;
					toastr.error(response.data.message, response.data.code);
				}


			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				//$scope.showReadIDLoader = true;
			});

	}

	$scope.editAttendee = function () {

		if (newFirstName == "" || newLastName == "") {
			toastr.warning("All fields are required", "Empty field(s)");
		} else {
			$scope.newFirstName = firstname;
			$scope.newLastName = lastname;
			$scope.currentAttendeeID = id;
			var data = {
				'firstname': $scope.newFirstName,
				'lastname': $scope.newLastName,
				'id': $scope.currentAttendeeID
			}

			return $http({
				url: 'http://localhost/php/Prezenta/public/user/logout',
				method: 'GET',
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					$window.location.href = '/php/Prezenta/public'+response.data.render;
				} else {
					$scope.showLoader = false;
					toastr.error(response.data.message, response.data.code);
				}

			}, function (response) {

			});
		}
	}

	$scope.logout = function() {
		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/user/logout',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$window.location.href = '/php/Prezenta/public'+response.data.render;
			} else {
				$scope.showLoader = false;
				toastr.error(response.data.message, response.data.code);
			}

			}, function (response) {

		});
	}

	$scope.getStudents();

})


app.controller('Add', function($scope, $interval, $http, toastr, $timeout, $window) {

	if (window.File && window.FileReader && window.FileList && window.Blob) {

	} else {
  		alert('The File APIs are not fully supported in this browser.');
	}

	$scope.goBack = function () {
		$window.location.href = ('/php/Prezenta/public/session');
	}

	$scope.goToLogs = function () {
		$window.location.href = ('/php/Prezenta/public/logs');
	}

	$scope.goToReports = function () {
		$window.location.href = ('/php/Prezenta/public/reports');
	}

	$scope.logout = function() {
		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/user/logout',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$window.location.href = '/php/Prezenta/public'+response.data.render;
			} else {
				$scope.showLoader = false;
				toastr.error(response.data.message, response.data.code);
			}

			}, function (response) {

		});
	}

	$scope.showLoader = false;
	$scope.showReadIDLoader = false;
	$scope.date = new Date(); 
	$scope.startTime = new Date();
	$scope.uploadFile = true;
	$scope.currentAttendeePos = 1;
	$scope.enableUpload = false;
	$scope.doneUpload = false;
	$scope.currentAttendeeData = {
		firstName: '',
		lastName: '',
		asurite: '',
		idNumber: ''
	};
	$scope.totalAdded = 0;

	$scope.upload = function () {

		if ($scope.csvFileData.length > 0 ) {

			$scope.uploadFile = false;
			var currentAttendee = $scope.csvFileData[$scope.currentAttendeePos].split(",");

			$scope.currentAttendeeData = {
				firstName: currentAttendee[0],
				lastName: currentAttendee[1],
				asurite: currentAttendee[2]
			};

			$scope.readNewID();

		} else {
			toastr.warning("Please select valid file to continue", "Invalid Operation");
		}

	}

	$scope.saveAttendee = function (attendee) {

			$scope.data = {
				'idNum': attendee.idNumber,
				'firstName': attendee.firstName, 
				'lastName': attendee.lastName,
				'asurite': attendee.asurite
			};

			console.log($scope.data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/attendees/add',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					$scope.totalAdded++;
					if ($scope.currentAttendeePos == $scope.csvFileData.length - 1) {
						$scope.doneUpload = true;
					} else {
						$scope.currentAttendeePos++;
						var currentAttendee = $scope.csvFileData[$scope.currentAttendeePos].split(",");

						$scope.currentAttendeeData = {
							firstName: currentAttendee[0],
							lastName: currentAttendee[1],
							asurite: currentAttendee[2]
						};
						$scope.readNewID();
					}

				} else {
					toastr.error(response.data.message, response.data.code);
				}

			}, function (response) {

			});

	}

	$scope.readNext = function () {
		if ($scope.currentAttendeePos == $scope.csvFileData.length - 1) {
			$scope.doneUpload = true;
		} else {
			$scope.currentAttendeePos++;
			var currentAttendee = $scope.csvFileData[$scope.currentAttendeePos].split(",");

			$scope.currentAttendeeData = {
				firstName: currentAttendee[0],
				lastName: currentAttendee[1],
				asurite: currentAttendee[2]
			};
		}
	}


	$scope.csvFileData = "";
	$scope.uploadCsv = function () {

		//console.log("JSON");
		//console.log($scope.fileData);

		$scope.showAddAttendeeLoader = true;

		var titles = $scope.csvFileData[0].split(",");
		console.log(titles);

		for (var i = 1; i < $scope.csvFileData.length; i++) {

			var currentAttendee = $scope.csvFileData[i].split(",");

			if (currentAttendee.length === 4) {
				var data = {
					'firstname': currentAttendee[0],
					'lastname': currentAttendee[1],
					'asurite': currentAttendee[2],
					'ID': currentAttendee[3] 
				}

				saveAttendee(data);
			}

		}

		$scope.showAddAttendeeLoader = false;
		$('#addUserModal').modal('hide');
		toastr.success("Attendees have been added", "Success");

	}

	function handleFileCSVSelection(evt) {
		
		var files = evt.target.files;
		
		var selectFile = files[0];
		$scope.csvFile = selectFile;
		var name = selectFile.name;
		var size = selectFile.size;
		var type = selectFile.type;
		var dateModified = selectFile.lastModifiedDate? selectFile.lastModifiedDate.toLocaleDateString(): 'n/a';

		var output = '<p style="font-size:12px;"><strong>'+name+'</strong> ('+type+') - '+size+' bytes, last modified: '+dateModified+'</p>';
		document.getElementById("selectCSVFile").innerHTML = output;

		var reader = new FileReader();
		reader.onload = onCSVReaderLoad;

		reader.readAsText(selectFile, 'UTF-8');

	}

	function onCSVReaderLoad(evt) {
		$scope.csvFileData = evt.target.result.split("\n");
		console.log($scope.csvFileData+" ----- "+$scope.csvFileData.length);
	}

	document.getElementById('csvFile').addEventListener('change', handleFileCSVSelection, false);


	$scope.readNewID = function() {

		$scope.showReadIDLoader = true;
		$scope.clickTime = new Date();
		var year = $scope.clickTime.getFullYear();
		var month = $scope.clickTime.getMonth()+1;
		var day = $scope.clickTime.getDate();
		var date = year+"-"+month+"-"+day;

		console.log($scope.clickTime.getHours()+":"+$scope.clickTime.getMinutes()+":"+$scope.clickTime.getSeconds());

		$scope.getID = function () {
			$http({
			method: 'POST',
            url: 'http://localhost/php/Prezenta/public/data/getNewID',
            data: {
            	time: $scope.clickTime.getHours()+":"+$scope.clickTime.getMinutes()+":"+$scope.clickTime.getSeconds(), 
            	date: date 
            } 
        	}).then(function (response) {

        		if (response.data.status == 'success' && response.data.data) {	
        			$interval.cancel($scope.getIDInterval);
            		$scope.currentAttendeeData.idNumber = response.data.data.idNumber;
            		console.log($scope.currentAttendeeData.idNumber);
        			$scope.showReadIDLoader = false;
        			
        			$scope.saveAttendee($scope.currentAttendeeData);
        		}

          	}, function (response) {
          		console.log(response);
        	});
		}

		$scope.getIDInterval = $interval($scope.getID, 1000);
	}


})


app.controller('Landing', function($scope, $interval, $http, toastr, $timeout, $window) {

	$scope.showLoader = false;
	$scope.showNewSessionLoader = false;
	$scope.date = new Date(); 
	$scope.startTime = new Date();

	$scope.sessions = [];
	$scope.newSessiontitle = "";

	$scope.setNewPassword = false;

	$scope.username = "";
	$scope.password = "";
	$scope.newPassword = "";
	$scope.newConfirmPassword = "";

	$scope.showReadIDLoader = false;

	$scope.getSessions = function () {
		return $http({
			url: 'http://localhost/php/Prezenta/public/data/sessions',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$scope.sessions = [];
				console.log(response.data.data);
				$scope.sessions = response.data.data;
			} else {
				//$scope.showLoader = false;
				//toastr.error(response.data.message, response.data.code);
					//$('#addUserModal').modal('hide');
			}

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
			});
	}

	$scope.addSession = function () {

		if ($scope.newSessiontitle == "") {
			toastr.warning('Session title is required', 'Empty Title');
		} else {

			$scope.showNewSessionLoader = true;

			$scope.data = {
				'title': $scope.newSessiontitle
			};

			return $http({
				url: 'http://localhost/php/Prezenta/public/data/add/session',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {
					console.log(response.data.data);
					$scope.getSessions();
					$('#addSessionModal').modal('hide');
				} else {
					$scope.showLoader = false;
					toastr.error(response.data.message, response.data.code);
				}

				$scope.showNewSessionLoader = false;

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
			});
		}

	}

	function completeUpdate() {

		if ($scope.username == "" || $scope.password == "" || $scope.newPassword == "" || $scope.newConfirmPassword == "") {
			toastr.warning('All fields are required', 'Empty Fields');
		} else if ($scope.newPassword != $scope.newConfirmPassword) {
			toastr.warning('New password values do not match', 'Password Mismatch');
		} else {
			$scope.data = {
				'username': $scope.username,
				'password': $scope.password,
				'newPassword': $scope.newPassword
			}

			console.log($scope.data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/user/account/complete/update',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {

					$scope.showReadIDLoader = false;
					$('#accountModal').modal('hide');
					$window.location.reload();

				} else {
					$scope.showReadIDLoader = false;
					toastr.error(response.data.message, response.data.code);
				}

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showReadIDLoader = false;
			});
		}

	}

	function minimalUpdate () {

		if ($scope.username == "" || $scope.password == "") {
			toastr.warning('All fields are required', 'Empty Fields');
		} else {

			$scope.showReadIDLoader = true;

			$scope.data = {
				'username': $scope.username,
				'password': $scope.password
			}

			console.log($scope.data);

			return $http({
				url: 'http://localhost/php/Prezenta/public/user/account/minimal/update',
				method: 'POST',
				data: $scope.data,
				headers:{
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then(function (response) {

				console.log(response.data);

				if (response.data.status == 'success') {

					$scope.showReadIDLoader = false;
					$('#accountModal').modal('hide');
					$window.location.reload();

				} else {
					$scope.showReadIDLoader = false;
					toastr.error(response.data.message, response.data.code);
				}

			}, function (response) {
				toastr.error("Unkown error occured, please try again", "Server Error");
				$scope.showReadIDLoader = false;
			});
		}

	}

	$scope.updateAccount = function () {
		if ($scope.setNewPassword) {
			completeUpdate();
		} else {
			minimalUpdate();
		}
	}

	$scope.showNewPassword = function () {
		$scope.setNewPassword = true;
		var newPassword = document.getElementById("newPassword");
		var newConfirmPassword = document.getElementById("newConfirmPassword");
    	newPassword.classList.remove("fadeOut");
    	newConfirmPassword.classList.remove("fadeOut");
    	newPassword.classList.add("zoomIn");
    	newConfirmPassword.classList.add("zoomIn");
	}

	$scope.hideNewPassword = function () {
		var newPassword = document.getElementById("newPassword");
		var newConfirmPassword = document.getElementById("newConfirmPassword");
    	newPassword.classList.remove("zoomIn");
    	newConfirmPassword.classList.remove("zoomIn");
    	newPassword.classList.add("fadeOut");
    	newConfirmPassword.classList.add("fadeOut");
		$scope.setNewPassword = false;
		$scope.newPassword = "";
		$scope.newConfirmPassword = "";
	}

	$scope.closeAccount =  function () {
		$scope.newPassword = "";
		$scope.newConfirmPassword = "";
		$scope.password = "";
		$('#accountModal').modal('hide');
		$scope.setNewPassword = false;
	} 

	$scope.goToSession = function (session) {
		//$scope.showLoader = true;
		console.log(session+"dhdddghd");

		$window.location.href = ('/php/Prezenta/public/data/session/'+session);

	}

	$scope.logout = function() {
		$scope.showLoader = true;

		return $http({
			url: 'http://localhost/php/Prezenta/public/user/logout',
			method: 'GET',
			headers:{
				'Content-Type': 'application/json; charset=UTF-8'
			}
		}).then(function (response) {

			console.log(response.data);

			if (response.data.status == 'success') {
				$window.location.href = '/php/Prezenta/public'+response.data.render;
			} else {
				$scope.showLoader = false;
				toastr.error(response.data.message, response.data.code);
			}

			}, function (response) {

		});
	}

	$scope.getSessions();

})

/*
	Filter time display
*/
app.filter('hhmmss', function () {
  return function (time) {

    var sec_num = parseInt(time, 10); 
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    var time    = hours+':'+minutes+':'+seconds;

    return time;
    
  }
});