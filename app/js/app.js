'use strict';

var app = angular.module('puzzleApp', ['slidingPuzzle', 'firebase', 'ngRoute', 'swipe', 'ui.router', 'timer', 'ja.qr', 'ngFacebook']);

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

app.run(function($firebaseArray, $firebaseObject) {
    var config = {
        apiKey: "AIzaSyCllg0glgjSis7IUx-LzoLhiH8H6KJU7gM",
        authDomain: "krds-ciaz.firebaseapp.com",
        databaseURL: "https://krds-ciaz.firebaseio.com",
        projectId: "krds-ciaz",
        storageBucket: "krds-ciaz.appspot.com",
        messagingSenderId: "799965870006"
    };
    var defaultApp = firebase.initializeApp(config);
});

app.config(function($facebookProvider) {
    $facebookProvider.setAppId('1351080128304970');
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

app.factory('playSer', function() {

    // private
    var value = 0;

    // public
    return {

        getValue: function() {
            return value;
        },

        setValue: function(val) {
            value = val;
        }

    };
});

app.controller('systemCtrl', function($scope, $http, $firebaseArray, $firebaseObject, slidingPuzzle, $timeout, $window, $facebook, $location, playSer) {

    var mySubscriber = function(msg, data) {
        console.log(msg, data);
    };
    var token = PubSub.subscribe('MY TOPIC', mySubscriber);
    PubSub.publish('MY TOPIC', 'hello world!');




    $scope.server = "http://10.10.0.33/";
    $scope.isLoggedIn = false;
    $scope.loadgame = false;
    $scope.puzzle = {};
    $scope.addUser = {};

    $('.make_qrcode').hide();



    $scope.challenge = function() {
        $scope.createUser("56");
        $scope.fakeDelay = false;
    /* $facebook.login().then(function() {
         refresh();
     });
     $timeout(function() {
         $('.challange_dt').hide();
         $('.make_qrcode').show();
         $scope.fakeDelay = true;
     }, 2000);*/
    }

    /*function refresh() {
        $facebook.api("/me").then(function(response) {
            //console.log(response.id);
            $scope.checkExistUser(response.id);
            $scope.user_Id = response.id;
            $scope.isLoggedIn = true;
        });
    }
    ;
    refresh();
    $timeout(function() {
        $scope.fakeDelay = false;
    }, 1000);
*/


    $scope.arr = ["2,9,3,1,4,5,7,8,6", "4,1,2,9,5,3,7,8,6", "4,1,3,9,2,5,7,8,6", "1,2,3,7,4,6,5,9,8", "1,9,3,5,2,6,4,7,8"];
    var pickAPayload = function() {
        $scope.randOne = $scope.arr[Math.floor(Math.random() * $scope.arr.length)];
        return $scope.randOne;
    };

    //Check User Exist




    /*-------------- Add and Get data to Database ---------*/
    $scope.obj = {};
    $scope.createUser = function(id) {
        $scope.obj.userId = id;
        $scope.obj.payload = pickAPayload();
        $scope.obj.move = "";
        $http({
            method: 'POST',
            url: 'http://10.10.1.158:3000/userSignup',
            data: $scope.obj
        }).then(function(response) {
            console.log(response.data);
            console.log(response.status);
            if (response.status == 200) {
                $scope.data = response.data;
                $scope.data.src = "img/desktop/puzzle_820.png";
                $timeout(function() {
                    $('.challange_dt').hide();
                    $('.make_qrcode').show();
                    $scope.fakeDelay = true;
                    $scope.qrCodeUrl = $scope.server + "#!/device?&user_Id=" + response.data.userId + "&flag=true";
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

app.controller('deviceCtrl', function($scope, $firebaseArray, $firebaseObject, $location, $timeout, playSer) {

    var mySubscriber = function(msg, data) {
        console.log(msg, data);
    };
    var token = PubSub.subscribe('MY TOPIC', mySubscriber);
    //PubSub.publish('MY TOPIC', 'test');
    PubSub.publishSync('MY TOPIC', 'testadfad adfasdf');


    console.log($location.search());
    $scope.QRFlag = $location.search().flag;
    console.log($scope.QRFlag);
    if ($scope.QRFlag == undefined) {
        $scope.QRFlag = false;

    }
    $('.device-play').hide();

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


    $scope.showBtn = false;
    $scope.PlayNow = function() {
        $(".device-play").hide();
        $scope.showBtn = true;
    }
    $scope.QRPlayNow = function() {

        //$scope.addUser.playFlag = false;
        $(".device-qrlandingPage").hide();
        $scope.showBtn = true;
    }
    $scope.user_Id = getParameterByName("user_Id");
    $scope.id = getParameterByName("id");


    if ($scope.user_Id != undefined && $scope.id != undefined) {
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
    ;
    $(".qrcodePuzzle").on('click', function() {
        $scope.tempVal = $(".qrcodePuzzle").attr('movement');
        console.log($(".qrcodePuzzle").attr('movement'));
        console.log($(".qrcodePuzzle").attr('api'));
        $scope.isPuzzleTrue = false;
        if ($scope.tempVal == "2,2") {
            console.log("true");
            $timeout(function() {
                $scope.isPuzzleTrue = true;
            }, 1000)

        }
    });

});