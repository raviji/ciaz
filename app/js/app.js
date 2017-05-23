'use strict';
var config_module = angular.module('CIAZ_API_URL.config', [])
    .constant('API_BASE_URL', 'https://dev.sttarter.com:3000/');
//, 'adamgoose.webdis'
var app = angular.module('puzzleApp', ['slidingPuzzle', 'ngRoute', 'swipe', 'ui.router', 'timer', 'ja.qr', 'ngFacebook', 'CIAZ_API_URL.config', 'adamgoose.webdis']);

app.config(function($routeProvider, $stateProvider, $urlRouterProvider) {

    //$locationProvider.html5Mode(true).hashPrefix('*');
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('main', {
            url: "/",
            templateUrl: "template/main.html"
        })
        .state('device', {
            url: "/device",
            templateUrl: "template/device.html"
        });
});

// app.run(function($firebaseArray, $firebaseObject) {
//     var config = {
//         apiKey: "AIzaSyCllg0glgjSis7IUx-LzoLhiH8H6KJU7gM",
//         authDomain: "krds-ciaz.firebaseapp.com",
//         databaseURL: "https://krds-ciaz.firebaseio.com",
//         projectId: "krds-ciaz",
//         storageBucket: "krds-ciaz.appspot.com",
//         messagingSenderId: "799965870006"
//     };
//     var defaultApp = firebase.initializeApp(config);
// });

app.config(function($facebookProvider) {
    $facebookProvider.setAppId('1457713207623290');
})

app.run(function($rootScope) {
    // Load the facebook SDK asynchronously
    (function() {
        // If we've already installed the SDK, we're done
        if (document.getElementById('facebook-jssdk')) {
            return;
        }

        // Get the first script element, which we'll use to find the parent node
        var firstScriptElement = document.getElementsByTagName('script')[0];

        // Create a new script element and set its id
        var facebookJS = document.createElement('script');
        facebookJS.id = 'facebook-jssdk';

        // Set the new script's source to the source of the Facebook JS SDK
        facebookJS.src = '//connect.facebook.net/en_US/all.js';

        // Insert the Facebook JS SDK into the DOM
        firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }());
});
app.config(['WebdisProvider', function(WebdisProvider) {
    WebdisProvider.setHost('35.154.80.39');
    WebdisProvider.setPort(7379);
}]);

app.controller('systemCtrl', function($scope, $http, slidingPuzzle, $timeout, $window, $facebook, $location, API_BASE_URL, Webdis) {

    $scope.server = "https://dev.sttarter.com/ciaz/";
    $scope.isLoggedIn = false;
    $scope.loadgame = false;
    $scope.puzzle = {};
    $scope.addUser = {};

    $('.make_qrcode').hide();

    //console.log(API_BASE_URL);
    $timeout(function() {
        $scope.fakeDelay = false;
    }, 1000);

    //For Local
    $scope.challenge = function() {
        $scope.createUser("10154820261779480");

        Webdis.subscribe("10154820261779480", function(data, channel) {
            console.log('From system ' + channel + ': ' + data);
            $scope.moveVal = data;
        }, $scope);
        $scope.fakeDelay = false;
    }


    //For Facebook
    /*$scope.challenge = function() {
        $scope.fakeDelay = false;
        $facebook.login().then(function() {
            $scope.refresh();
        });
    }

    $scope.refresh = function() {
        $facebook.api("/me").then(function(response) {
            $scope.createUser(response.id);
            $scope.isLoggedIn = true;
            Webdis.subscribe(response.id, function(data, channel) {
            console.log('From system ' + channel + ': ' + data);
            $scope.moveVal = data;
        }, $scope);
        });
    };*/





    $scope.arr = ["2,9,3,1,4,5,7,8,6", "4,1,2,9,5,3,7,8,6", "4,1,3,9,2,5,7,8,6", "1,2,3,7,4,6,5,9,8", "1,9,3,5,2,6,4,7,8"];
    var pickAPayload = function() {
        $scope.randOne = $scope.arr[Math.floor(Math.random() * $scope.arr.length)];
        return $scope.randOne;
    };


    /*-------------- Add and Get data to Database ---------*/
    $scope.obj = {};
    $scope.createUser = function(id) {
        $scope.obj.userId = id;
        $scope.obj.payload = pickAPayload();
        $scope.obj.move = "";
        //console.log($scope.obj);
        $http({
            method: 'POST',
            url: API_BASE_URL + 'userSignup',
            data: $scope.obj
        }).then(function(response) {
            //console.log(response.data);
            //console.log(response.status);
            if (response.status == 200) {
                $scope.data = response.data.user;
                $scope.data.src = "img/desktop/puzzle_820.png";
                $timeout(function() {
                    $('.challange_dt').hide();
                    $('.make_qrcode').show();
                    $scope.fakeDelay = true;
                    $scope.qrCodeUrl = $scope.server + "#!/device?&userId=" + response.data.user.userId + "&flag=true";
                    //console.log($scope.qrCodeUrl);
                }, 2000);
            }
        }, function(response) { // optional
            console.log(response)
        });
    };

    /*QR code Challenge button functionlity*/

    $scope.challengeStarted = false;
    $scope.playNowSystem = function() {
        $('.make_qrcode').hide();
        $scope.challengeStarted = true;
    }

});

app.controller('deviceCtrl', function($scope, $location, $timeout, $http, API_BASE_URL, Webdis) {

    function getParameterByName(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    $scope.userId = getParameterByName("userId");
    //console.log($scope.userId);



    /*$http.get("http://35.154.80.39:7379/PUBLISH/" + $scope.userId + "/" + "2,1").then(function(data) {
        //$scope.value = data;
    }, function(err) {
        console.log(err)
    });*/


    //Publish Topic
    // $http.post('https://dev.sttarter.com:3000/publish').success(function(data) {
    //     //$scope.value = data;
    // }).error(function(err) {
    //     console.log(err)
    // });





    $scope.QRFlag = $location.search().flag;
    if ($scope.QRFlag == undefined) {
        $scope.QRFlag = false;
    }
    $('.device-play').hide();





    $scope.QRPlayNow = function() {
        //$scope.addUser.playFlag = false;
        $(".device-qrlandingPage").hide();
        $scope.showBtn = true;
        Webdis.subscribe($scope.userId, function(data, channel) {
            console.log('From device ' + channel + ': ' + data);
            $scope.moveVal = data;
        }, $scope);
    }



    /*With QRCode*/
    if ($scope.QRFlag) {
        $http({
            method: 'GET',
            url: API_BASE_URL + 'getuser?userId=' + $scope.userId
        }).then(function(response) {
            console.log(response);
            $scope.data = response.data.user;
            $scope.data.src = "img/desktop/puzzle_820.png";

        }, function(response) { // optional
            console.log(response)
        });
    }

    /*Without QRCode*/
    $scope.deviceChallengeBtn = false
    $scope.deviceChallenge = function() {
        $scope.createUser("56");
        $(".device-challenge").hide();
        $(".device-play").show();
        $scope.deviceChallengeBtn = true;
    }

    $scope.showBtn = false;
    $scope.PlayNow = function() {
        $(".device-play").hide();
        $scope.showBtn = true;
    }

    $scope.arr = ["2,9,3,1,4,5,7,8,6", "4,1,2,9,5,3,7,8,6", "4,1,3,9,2,5,7,8,6", "1,2,3,7,4,6,5,9,8", "1,9,3,5,2,6,4,7,8"];
    var pickAPayload = function() {
        $scope.randOne = $scope.arr[Math.floor(Math.random() * $scope.arr.length)];
        return $scope.randOne;
    };

    $scope.obj = {};
    $scope.createUser = function(id) {
        $scope.obj.userId = id;
        $scope.obj.payload = pickAPayload();
        $scope.obj.move = "";
        $http({
            method: 'POST',
            url: API_BASE_URL + 'userSignup',
            data: $scope.obj
        }).then(function(response) {
            console.log(response.data);
            console.log(response.status);
            if (response.status == 200) {
                console.log(response);
                $scope.data = response.data.user;
                $scope.data.src = "img/desktop/puzzle_820.png";

            }
        }, function(response) { // optional
            console.log(response)
        });
    };









    /*if ($scope.user_Id != undefined && $scope.id != undefined) {
        $scope.url = "puzzle/" + $scope.id;
        var ref = firebase.database().ref($scope.url);
        var obj = $firebaseObject(ref);
        obj.$loaded().then(function() {
            //console.log(obj);
            //$scope.test = true;
            $scope.puzzle.payload = obj.payload;
            $scope.puzzle.src = obj.src;
            $scope.puzzle.title = obj.title;
            $scope.puzzle.rows = obj.rows;
            $scope.puzzle.cols = obj.cols;
            $scope.puzzle.move = obj.moves;
        });
        obj.$bindTo($scope, "data");

        var h = $(window).height() - 20;
        var fh = h / 3;

        $scope.deviceChallenge = function() {
            $(".device-challenge").hide();
            $(".device-play").show();
        }
        $scope.qrCodePlayNow = function() {
            $scope.value = 1;
            playSer.setValue($scope.value);
            $rootScope.$broadcast('increment-value-event');
            $(".device-play").hide();
            $scope.showBtn = true;

        }

        setTimeout(function() {
            $('.device.sliding-puzzle td ').height(fh + "px");
        }, 2000);
    }
    ;*/


});