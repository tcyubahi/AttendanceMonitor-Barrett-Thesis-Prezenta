<?php

/*
 Author: Tresor Cyubahiro
 Barrett Thesis Project Iteration 2
 Descrption: Back end Interface for the Prezenta web portal
 PHP Frameworks used: 
 					- Slim Framework
 					- RedBean Framework
*/

require_once __DIR__ . '/../src/config.php';
require __DIR__ . '/../libs/RedBean/rb.php';
require __DIR__ . '/../libs/classes/SystemUtils.php';
require __DIR__ . '/../vendor/autoload.php';
$settings = require __DIR__ . '/../src/settings.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Slim\Views\PhpRenderer;

$app = new \Slim\App($settings);

$container = $app->getContainer();
$container['renderer'] = new PhpRenderer("../templates");

// ============= Page not found HANDLER ==========================
$container['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        return $c->renderer->render($response, "notFound.html");
    };
};

// Set up database connection
try{
	R::setup('mysql:host=localhost;dbname='.DB_NAME,DB_USER,DB_PASS);
	R::freeze(true);
}catch(Exception $xc){
	echo $xc->getMessage().'..'.$xc->getTraceAsString();
}

session_start();

// ============================= ROUTES ==================================
$app->add(function($request, $response, $next) {
    $route = $request->getAttribute("route");

    $methods = [];

    if (!empty($route)) {
        $pattern = $route->getPattern();

        foreach ($this->router->getRoutes() as $route) {
            if ($pattern === $route->getPattern()) {
                $methods = array_merge_recursive($methods, $route->getMethods());
            }
        }
    } else {
        $methods[] = $request->getMethod();
    }

    $response = $next($request, $response);


    return $response->withHeader("Access-Control-Allow-Methods", implode(",", $methods));
});

// Initial route
$app->get('/', function (Request $request, Response $response) use ($app) {
	if (checkLogin()) {
		return $response->withRedirect('/php/Prezenta/public/dashboard'); 
	} else {
    	return $this->renderer->render($response, "login.html");
	}
});

// Dashboard route
$app->get('/dashboard', function (Request $request, Response $response) {
    
    if (checkLogin()) {
    	$cookieData = [
    		'userkey' => $_SESSION['userkey'],
    		'username' => $_SESSION['username'],
    		'email' => $_SESSION['email']
    	];
		return $this->renderer->render($response, "landing.html", $cookieData);
	} else {
    	return $response->withRedirect('/php/Prezenta/public/'); 
	}
});

// Session Route
$app->get('/session', function (Request $request, Response $response) {
	if (checkLogin()) {
    	$cookieData = [
    		'userkey' => $_SESSION['userkey'],
    		'username' => $_SESSION['username'],
    		'email' => $_SESSION['email'],
    		'title' => $_SESSION['session']
    	];

		return $this->renderer->render($response, "session.html", $cookieData);

	} else {
    	return $response->withRedirect('/php/Prezenta/public/'); 
	}

});

// Add Students route
$app->get('/add', function (Request $request, Response $response) {
	if (checkLogin()) {
    	$cookieData = [
    		'userkey' => $_SESSION['userkey'],
    		'username' => $_SESSION['username'],
    		'email' => $_SESSION['email'],
    		'title' => $_SESSION['session']
    	];

		return $this->renderer->render($response, "add.html", $cookieData);

	} else {
    	return $response->withRedirect('/php/Prezenta/public/'); 
	}

});

// View logs route
$app->get('/logs', function (Request $request, Response $response) {
	if (checkLogin()) {
    	$cookieData = [
    		'userkey' => $_SESSION['userkey'],
    		'username' => $_SESSION['username'],
    		'email' => $_SESSION['email'],
    		'title' => $_SESSION['session']
    	];

		return $this->renderer->render($response, "logs.html", $cookieData);

	} else {
    	return $response->withRedirect('/php/Prezenta/public/'); 
	}

});

// View Reports route
$app->get('/reports', function (Request $request, Response $response) {
	if (checkLogin()) {
    	$cookieData = [
    		'userkey' => $_SESSION['userkey'],
    		'username' => $_SESSION['username'],
    		'email' => $_SESSION['email'],
    		'title' => $_SESSION['session']
    	];

		return $this->renderer->render($response, "reports.html", $cookieData);

	} else {
    	return $response->withRedirect('/php/Prezenta/public/'); 
	}

});

// Session route ========== EXPERIMENTAL ======== IGNORE
$app->get('/data/session[/{title}]', function (Request $request, Response $response) use ($app) {
    $title = $request->getAttribute('title');
    $_SESSION['session'] = $title;
    return $response->withRedirect('/php/Prezenta/public/session');
});
// ==================================================================

// EXPERIMENTAL =============== IGNORE ==============================
$app->get('/play[/{name}]', function (Request $request, Response $response) use ($app) {
    $greet = $request->getAttribute('name');
    return $response->write("Hello $greet");
});
// ==================================================================

// EXPERIMENTAL =========== IGNORE ==================================
$app->get('/user/reset/password', function (Request $request, Response $response) use ($app) {
    return $this->renderer->render($response, "reset.html");
});
// ==================================================================


				// ========= POSTs AND GETs REQUESTS =========

// USER LOGIN
$app->post('/user/login', function (Request $request, Response $response) {
	try {

		$response->withHeader('Content-type', 'application/json');
		$response->withHeader('Allow', 'GET,POST,PUT,DELETE');

		$params = $request->getParsedBody();
		$username = $params['username'];
		$password = $params['password'];

		$account = R::findOne('users','username=?',array($username));
		
		if(isset($account['id'])){
	    if(password_verify($password,$account['password'])) {
	        $_SESSION['username'] = $account['username'];
	        $_SESSION['email'] = $account['email'];
	        $_SESSION['userkey'] = $account['userkey'];

	        echo json_encode(array('status' => 'success', 'render' => '/dashboard'));

	    }else {
	        echo json_encode(array('status' => 'invalid-pass', 'code' => 'Incorrect Password', 'message' => 'The password you entered is incorrect'));
	    }
		} else{
	        echo json_encode(array('status' => 'invalid-account', 'code' => 'Account Not Found', 'message' => 'No account with these credentials was found!'));
		} 
	}	catch(Exception $e) {
		echo json_encode(array('status' => $e->getMessage()));
	}      
});

// USER SIGNUP
$app->post('/user/signUp', function (Request $request, Response $response) {
	try {

		$response->withHeader('Content-type', 'application/json');
		$response->withHeader('Allow', 'POST');

		$params = $request->getParsedBody();

		$username = $params['username'];
		$email = $params['email'];
		$password = $params['password'];

		if (emailInuse($email)) {
			echo json_encode(array('status' => 'email-in-use', 'code' => 'Email In Use', 'message' => $email . ' is already in use. Please log in instead'));
		} elseif (UserNameInuse($username)) {
			echo json_encode(array('status' => 'user-name-in-use', 'code' => 'User Name In Use', 'message' => 'user name ' . $username . ' is already in use. Please choose a different user name'));
		} else {

			$new_user = R::dispense('users');
			$new_user->userkey = SystemUtils::generateKey(255, false, true);
			$new_user->username = $username;
			$new_user->email = $email;
			$new_user->password = password_hash($password, PASSWORD_DEFAULT);

			R::store($new_user);

		    $_SESSION['username'] = $new_user['username'];
		    $_SESSION['email'] = $new_user['email'];
		    $_SESSION['userkey'] = $new_user['userkey'];

			echo json_encode(array('status' => 'success', 'render' => '/dashboard'));

		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => $e->getMessage()));
	}      
});

// LIST USER'S ADDED SESSIONS (CLASSES)
$app->get('/data/sessions', function (Request $request, Response $response) {
	
	$response->withHeader('Content-type', 'application/json');
	$response->withHeader('Allow', 'GET');
	if (checkLogin()) {
		$sessions = R::getAll('SELECT * FROM sessions WHERE owner=?', array($_SESSION['email']));
		echo json_encode(array('status' => 'success', 'data' => $sessions));
	} else {
		echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
	}

});

// ADD SESSION (CLASS)
$app->post('/data/add/session', function (Request $request, Response $response) {
	
	try {

		if (checkLogin()) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'POST');

			$params = $request->getParsedBody();

			$title = $params['title'];

			if (titleInUse($title)) {
				echo json_encode(array('status' => 'duplicate-title', 'code' => 'Duplicate Title', 'message' => 'You have a session with title: ' . $title . ' already'));
			} else {

				$new_session = R::dispense('sessions');
				$new_session->title = $title;
				$new_session->owner = $_SESSION['email'];
				$new_session->count = 0;

				R::store($new_session);

				echo json_encode(array('status' => 'success'));

			}
		} else {
			echo json_encode(array('status' => 'session-expired', 'message' => 'Session Expired','data' => $sessions));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => $e->getMessage()));
	} 

});

// UPDATE USER ACCOUNT - PARTIAL UPDATE : JUST USERNAME
$app->post('/user/account/minimal/update', function (Request $request, Response $response) {
	
	try {

		if (checkLogin()) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'POST');

			$params = $request->getParsedBody();

			$username = $params['username'];
			$password = $params['password'];

			$account = R::findOne('users','email=?',array($_SESSION['email']));

			if (password_verify($password,$account['password'])) {
				
				$account->username = $username;

				R::store($account);
				$_SESSION['username'] = $account['username'];
				echo json_encode(array('status' => 'success'));

			} else {
				echo json_encode(array('status' => 'incorrect-password', 'code' => 'Incorrect Password', 'message' => 'The password you entered is incorrect'));				
			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'message' => 'Session Expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => $e->getMessage()));
	} 

});

// UPDATE USER ACCOUNT - COMPLETE UPDATE: BOTH USERNAME AND PASSWORD
$app->post('/user/account/complete/update', function (Request $request, Response $response) {
	
	try {

		if (checkLogin()) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'POST');

			$params = $request->getParsedBody();

			$username = $params['username'];
			$password = $params['password'];
			$newPassword = $params['newPassword'];

			$account = R::findOne('users','email=?',array($_SESSION['email']));

			if (password_verify($password,$account['password'])) {
				
				$account->username = $username;
				$account->password = password_hash($newPassword, PASSWORD_DEFAULT);

				R::store($account);
				$_SESSION['username'] = $account['username'];

				echo json_encode(array('status' => 'success'));

			} else {
				echo json_encode(array('status' => 'incorrect-password', 'code' => 'Incorrect Password', 'message' => 'The password you entered is incorrect'));				
			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'message' => 'Session Expired','data' => $sessions));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => $e->getMessage()));
	} 

});

// LIST STUDENTS REGISTRED IN A SESSION (CLASS)
$app->get('/data/session/get/students', function (Request $request, Response $response) {
	
	$response->withHeader('Content-type', 'application/json');
	$response->withHeader('Allow', 'GET');
	if (checkLogin() && isset($_SESSION['session'])) {
		$students = R::getAll('SELECT * FROM students WHERE owner=? AND session=? ORDER BY firstname ASC', array($_SESSION['email'], $_SESSION['session']));
		echo json_encode(array('status' => 'success', 'data' => $students));
	} else {
		echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
	}

});

// LIST LOGS FOR A SESSION (ClASS)
$app->get('/data/session/get/logs', function (Request $request, Response $response) {
	
	$response->withHeader('Content-type', 'application/json');
	$response->withHeader('Allow', 'GET');
	if (checkLogin() && isset($_SESSION['session'])) {
		$logs = R::getAll('SELECT DISTINCT * FROM sessionslogs WHERE owner=? AND session=? ORDER BY date DESC', array($_SESSION['email'], $_SESSION['session']));
		echo json_encode(array('status' => 'success', 'data' => $logs));
	} else {
		echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
	}

});

// LIST CHECKINS FOR AN ACTIVE SESSION (CLASS)
$app->get('/data/session/get/ckechins', function (Request $request, Response $response) {
	
	$response->withHeader('Content-type', 'application/json');
	$response->withHeader('Allow', 'GET');

	$params = $request->getQueryParams();
	$date = $params['date'];
	$time = $params['time'];

	if (checkLogin() && isset($_SESSION['session'])) {

		$checkins = R::getAll('SELECT DISTINCT l.*, s.asurite, s.firstname, s.lastname FROM logs AS l JOIN students AS s ON l.studid=s.studid WHERE l.owner=? AND l.session=? AND date=? AND time>? ORDER BY date ASC', array($_SESSION['email'], $_SESSION['session'], $date, $time));
		echo json_encode(array('status' => 'success', 'data' => $checkins));

	} else {
		echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
	}

});

// Get Session log's Data
$app->post('/data/session/log/get/attendees', function (Request $request, Response $response) {
	try {
		$response->withHeader('Content-type', 'application/json');
		$response->withHeader('Allow', 'POST');

		$params = $request->getParsedBody();

		$date = $params['date'];
		$starttime = $params['starttime'];
		$endtime = $params['endtime'];

		if (checkLogin() && isset($_SESSION['session'])) {

			$logs = R::getAll(
				'SELECT DISTINCT l.*, s.firstname, s.lastname, s.asurite FROM logs AS l JOIN students AS s ON l.studid=s.studid WHERE l.owner=? AND l.session=? AND l.date=? AND l.time>? AND l.time<?', array($_SESSION['email'], $_SESSION['session'], $date, $starttime, $endtime));

			echo json_encode(array('status' => 'success', 'data' => $logs));

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
		}
	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 
});

// Get Session log's Data
$app->delete('/data/session/log/delete', function (Request $request, Response $response) {
	try {
		$response->withHeader('Content-type', 'application/json');
		$response->withHeader('Allow', 'DELETE');

		$params = $request->getParsedBody();

		$session = $params['session'];
		$owner = $_SESSION['email'];
		$date = $params['date'];
		$starttime = $params['starttime'];
		$endtime = $params['endtime'];
		$password = $params['password'];

		if (checkLogin() && isset($_SESSION['session']) && $_SESSION['session'] == $session) {

			$account = R::findOne('users','email=?',array($_SESSION['email']));
			$log = R::findOne('sessionslogs', 'session=? AND date=? AND owner=? AND starttime=? AND endtime=?', array($session, $date, $owner, $starttime, $endtime));
			$checkins = R::find('logs', 'session=? AND owner=? AND date=? AND time>? AND time<?', array($session, $owner, $date, $starttime, $endtime));

			if (isset($log['id'])) {
				
				if(password_verify($password,$account['password'])) {

					R::trash($log);
					R::trashAll($checkins);

					echo json_encode(array('status' => 'success', 'code' => 'success', 'message' => 'Deleted'));

				} else {

					echo json_encode(array('status' => 'incorrect-password', 'code' => 'Incorrect Password', 'message' => 'The password you entered is incorrect'));

				}
				
			} else {

				echo json_encode(array('status' => 'unknown-error', 'code' => 'Unkown Error', 'message' => 'An unknown error occurred'));

			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 
});

// ADD A STUDENT TO A SESSION (CLASS)
$app->post('/data/attendees/add', function (Request $request, Response $response) {
	
	try {

		if (checkLogin() && isset($_SESSION['session'])) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'POST');

			$params = $request->getParsedBody();

			$idNum = $params['idNum'];
			$firstName = $params['firstName'];
			$lastName = $params['lastName'];
			$asurite = $params['asurite'];

			if (idInUse($idNum)) {
				
				echo json_encode(array('status' => 'id-already-added', 'code' => 'ID Number In Use', 'message' => 'ID Number: ' . $idNum . ' is already being used'));

			} else {

				$new_attendee = R::dispense('students');
				$new_attendee->studid = $idNum;
				$new_attendee->owner = $_SESSION['email'];
				$new_attendee->session = $_SESSION['session'];
				$new_attendee->firstname = $firstName;
				$new_attendee->lastname = $lastName;
				$new_attendee->asurite = $asurite;

				R::store($new_attendee);

				echo json_encode(array('status' => 'success'));				
			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' =>'Session Expired','message' => 'Session Expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// DELETE A SESSION (CLASS)
$app->delete('/data/delete/session', function (Request $request, Response $response) {
	
	try {

		if (checkLogin() && isset($_SESSION['session'])) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'DELETE');

			$params = $request->getParsedBody();

			$currentSession = $params['session'];
			$password = $params['password'];

			$account = R::findOne('users','email=?',array($_SESSION['email']));
			$session = R::findOne('sessions','title=? AND owner=?',array($_SESSION['session'],$_SESSION['email']));

			if (isset($session['id'])) {
				
				if(password_verify($password,$account['password'])) {

					R::trash($session);

					echo json_encode(array('status' => 'success', 'code' => 'success', 'message' => 'Deleted'));

				} else {

					echo json_encode(array('status' => 'incorrect-password', 'code' => 'Incorrect Password', 'message' => 'The password you entered is incorrect'));

				}
				
			} else {

				echo json_encode(array('status' => 'unknown-error', 'code' => 'Unkown Error', 'message' => 'An unknown error occurred'));

			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' =>'Session Expired','message' => 'Session Expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// DELETE A STUDENT FROM SESSION (CLASS)
$app->delete('/data/delete/attendee', function (Request $request, Response $response) {
	
	try {

		if (checkLogin()) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'DELETE');

			$params = $request->getParsedBody();

			$id = $params['id'];

			$attendee = R::findOne('students','studid=? AND owner=?',array($id, $_SESSION['email']));

			if (isset($attendee['studid'])) {

				R::trash($attendee);
				echo json_encode(array('status' => 'success', 'code' => 'success', 'message' => 'Deleted'));
				
			} else {

				echo json_encode(array('status' => 'unknown-error', 'code' => 'Unkown Error', 'message' => 'An unknown error occurred'));

			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' =>'Session Expired','message' => 'Session Expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// UPDATE STUDENT DATA
$app->post('/data/attendee/update', function (Request $request, Response $response) {
	
	try {

		if (checkLogin()) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'POST');

			$params = $request->getParsedBody();

			$firstName = $params['firstName'];
			$lastName = $params['lastName'];

			if (idInUse($idNum)) {
				
				echo json_encode(array('status' => 'id-already-added', 'code' => 'ID Number In Use', 'message' => 'ID Number: ' . $idNum . ' is already being used'));

			} else {

				$new_attendee = R::dispense('students');
				$new_attendee->studid = $idNum;
				$new_attendee->owner = $_SESSION['email'];
				$new_attendee->session = $_SESSION['session'];
				$new_attendee->firstname = $firstName;
				$new_attendee->lastname = $lastName;

				R::store($new_attendee);

				echo json_encode(array('status' => 'success'));				
			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' =>'Session Expired','message' => 'Session Expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});


// ADD STUDENT CHECK-IN (LOG)
$app->post('/data/logs/add', function (Request $request, Response $response) {
	
	try {

		if (checkLogin() && isset($_SESSION['session'])) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'POST');

			$params = $request->getParsedBody();

			$id = $params['id'];
			$date = $params['date'];
			$time = $params['time'];

			$new_log = R::dispense('logs');
			$new_log->studid = $id;
			$new_log->date = $date;
			$new_log->time = $time;
			$new_log->session = $_SESSION['session'];
			$new_log->owner = $_SESSION['email'];

			R::store($new_log);

			echo json_encode(array('status' => 'success'));				

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' =>'Session Expired','message' => 'Session Expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// ADD SESSION (CLASS) LOG
$app->post('/data/sessionLogs/add', function (Request $request, Response $response) {
	
	try {

		if (checkLogin() && isset($_SESSION['session'])) {
			$response->withHeader('Content-type', 'application/json');
			$response->withHeader('Allow', 'POST');

			$params = $request->getParsedBody();

			$date = $params['date'];
			$time = $params['starttime'];

			$new_log = R::dispense('sessionslogs');
			$new_log->date = $date;
			$new_log->starttime = $time;
			$new_log->endtime = "00:00:00";
			$new_log->session = $_SESSION['session'];
			$new_log->owner = $_SESSION['email'];

			R::store($new_log);

			echo json_encode(array('status' => 'success'));				

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' =>'Session Expired','message' => 'Session Expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// GET STUDENT'S DATA
$app->post('/data/attendee/logs', function (Request $request, Response $response) {
	
	$response->withHeader('Content-type', 'application/json');
	$response->withHeader('Allow', 'POST');

	$params = $request->getParsedBody();
	$id = $params['id'];

	if (checkLogin() && isset($_SESSION['session'])) {
		$allData = R::getAll('SELECT * FROM logs WHERE owner=? AND session=? AND studid=?', array($_SESSION['email'], $_SESSION['session'], $id));
		echo json_encode(array('status' => 'success', 'data' => $allData));
	} else {
		echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
	}

});

// USER LOGOUT
$app->get('/user/logout', function (Request $request, Response $response) {
	
	$response->withHeader('Content-type', 'application/json');
	$response->withHeader('Allow', 'GET');

	if (LogOut()) {
		echo json_encode(array('status' => 'success', 'render' => '/'));
	} else {
		echo json_encode(array('status' => 'logout-fail', 'code' => 'Logout Failed','message' => 'Please try logging out again'));
	}

});

// ======== IGNORE === EXPERIMENTAL ========= Get New ID FROM READER
$app->post('/data/getNewID', function (Request $request, Response $response) {
	
	$response->withHeader('Content-type', 'application/json');
	$response->withHeader('Allow', 'POST');

	$params = $request->getParsedBody();

	$date = $params['date'];
	$time = $params['time'];

	if (checkLogin() && isset($_SESSION['session'])) {

		$log = R::getRow('SELECT * FROM addAttendee WHERE date=? AND time>?', array($date, $time));

		echo json_encode(array('status' => 'success', 'data' => $log));

	} else {
		echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
	}

});


// SET ACTIVE SESSION (CLASS)
$app->post('/data/session/start', function (Request $request, Response $response) {

	try {

		$response->withHeader('Content-type', 'application/json');
		$response->withHeader('Allow', 'POST');

		$params = $request->getParsedBody();

		$date = $params['date'];
		$starttime = $params['starttime'];

		$title = $_SESSION['session'];
		$owner = $_SESSION['email'];

		if (checkLogin() && isset($_SESSION['session'])) {

			if (sessionBeenActive()) {

				$query = "UPDATE activesession SET session='$title', owner='$owner', date='$date', starttime='$starttime', endtime='00:00:00'";

				$sesssion = R::exec($query);

				echo json_encode(array('status' => 'success'));

			} else {

				$query = "INSERT INTO activesession (session, owner, date, starttime, endtime, activated) values('$title', '$owner', '$date', '$starttime', '00:00:00','1')";
				$session = R::exec($query);

				echo json_encode(array('status' => 'success'));

			}

		} else {
			echo json_encode(array('status' => 'session-expired', 'code' => 'Session Expired','message' => 'Session has expired'));
		}

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// END SESSION
$app->post('/data/session/end', function (Request $request, Response $response) {

	try {

		$response->withHeader('Content-type', 'application/json');
		$response->withHeader('Allow', 'POST');

		$params = $request->getParsedBody();

		$date = $params['date'];
		$starttime = $params['starttime'];
		$endtime = $params['endtime'];

		$log = R::findOne('sessionslogs','owner=? AND session=? AND date=? AND starttime=? AND endtime=?',array($_SESSION['email'], $_SESSION['session'], $date, $starttime, '00:00:00'));

		if(isset($log['id'])){

			$query = "UPDATE activesession SET endtime='$endtime'";
			$session = R::exec($query);

	        $log->endtime = $endtime;
	        R::store($log); 

	        echo json_encode(array('status' => 'success'));

		} else{
	        echo json_encode(array('status' => 'server-error', 'code' => 'Server-Error', 'message' => 'Error executing request'));
		} 

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// PASSWORD RESET
$app->post('/data/password/reset', function (Request $request, Response $response) {

	try {

		$response->withHeader('Content-type', 'application/json');
		$response->withHeader('Allow', 'POST');

		$params = $request->getParsedBody();

		$email = $params['email'];

		$account = R::findOne('users','email=?',array($email));

		if(isset($account['id'])){

			$temp_pass = SystemUtils::generateRandomString(10);

	        $account->password = password_hash($temp_pass, PASSWORD_DEFAULT);
	        R::store($account); 

			$data =array();

			$data['username'] = $account['username'];
			$data['password'] = $temp_pass;

	        echo json_encode(array('status' => 'success', 'data' => $data));

		} else{
	        echo json_encode(array('status' => 'invalid-account', 'code' => 'Account Not Found', 'message' => 'No account with this email was found!'));
		} 

	}	catch(Exception $e) {
		echo json_encode(array('status' => 'error', 'code' => 'Unkown Error', 'message' => $e->getMessage()));
	} 

});

// =======================================================================

					// ======== FUNCTIONS ========
// CHECK IF EMAIL IS ALREADY REGISTERED
function emailInuse ($email) {
	return R::findOne('users', 'email LIKE"' . $email . '"');
}

// CHECK IF USERNAME IS ALREADY REGISTERED
function UserNameInuse ($username) {
	return R::findOne('users', 'username LIKE"' . $username . '"');
}

// CHECK IF SESSION EXISTS ON A BROWSER
function checkLogin () {
    if (isset($_SESSION['userkey']) && isset($_SESSION['email']) && isset($_SESSION['username'])){
        return true;
    }else{
        return false;
    }
}

// CHECK IF SESSION (CLASS SESSION) IS ALREADY REGISTERED FOR A USER
function titleInUse ($title) {
    return (R::findOne('sessions', 'title=? AND owner=?', array($title, $_SESSION['email'])));
}

// CHECK IF A STUDENT ID IS ALREADY REGISTERED
function idInUse ($idNum) {
    return (R::findOne('students', 'studID=? AND session=?', array($idNum, $_SESSION['session'])));
}

// CHECK IF THERE HAS BEEN AN ACTIVE SESSION (CLASS) BY USER
function sessionBeenActive () {
    return (R::findOne('activeSession', 'activated=?', array(1)));
}

// GET A PARTICULAR STUDENTS INFO
function getAttendeeData ($idNum) {
    $attendeeInfo = R::getRow('SELECT * FROM students WHERE studid=?', array($idNum));
	return array('status' => 'success', 'data' => $attendeeInfo);
}

// USER LOGOUT
function LogOut () {
    session_unset();
    session_destroy();
    if (isset($_SESSION['userkey']) && isset($_SESSION['email']) && isset($_SESSION['username'])){
        return false;
    }else{
        return true; 
    }
}

// RUN BACK-END APP
$app->run();
