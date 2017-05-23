'use strict';

var app = angular.module('puzzleApp', ['slidingPuzzle', 'ngRoute', 'swipe', 'ui.router', 'timer', 'ja.qr', 'ngFacebook', 'adamgoose.webdis', 'config.api']);

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

app.controller('systemCtrl', function($scope, $http, slidingPuzzle, $timeout, $window, $facebook, $location, apiUrl, qrCodeUrl, Webdis) {

    $scope.isLoggedIn = false;
    $scope.loadgame = false;
    $scope.puzzle = {};
    $scope.addUser = {};

    $('.make_qrcode').hide();

    //console.log(apiUrl);
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
            url: apiUrl + 'userSignup',
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
                    $scope.qrCodeUrl = qrCodeUrl + "#!/device?&userId=" + response.data.user.userId + "&flag=true";
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

app.controller('deviceCtrl', function($scope, $location, $timeout, $http, apiUrl, Webdis) {

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
            url: apiUrl + 'getuser?userId=' + $scope.userId
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
            url: apiUrl + 'userSignup',
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

});