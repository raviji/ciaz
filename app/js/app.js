'use strict';

var app = angular.module('puzzleApp', ['slidingPuzzle', 'firebase', 'ngRoute', 'swipe', 'ui.router', 'timer', 'ja.qr']);

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


app.controller('systemCtrl', function($scope, $firebaseArray, $firebaseObject, slidingPuzzle, $timeout,serviceId) {

    $scope.loadgame = false;
    $scope.user_Id = "raviabc";
    $scope.puzzle = {};
    $scope.addUser = [];
    $scope.addUser.moves = {};
    $timeout(function() {
        $scope.fakeDelay = false;
    }, 1000)

    $('.make_qrcode').hide();
    $('.playgame').hide();

    // $scope.string = 'http://10.10.1.183/ciaz/app/#!/device?id=-Kjg0BHhbUFyQ7pevMI0&user_Id=navya';
    /*-------------- Random Array ---------*/
    /*$scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    $scope.arr.sort(function() {
        return .5 - Math.random();
    });*/

    $scope.arr = ["2,9,3,1,4,5,7,8,6", "4,1,2,9,5,3,7,8,6", "4,1,3,9,2,5,7,8,6", "1,2,3,7,4,6,5,9,8", "1,9,3,5,2,6,4,7,8"];
    var pickAPayload = function() {
        $scope.randOne = $scope.arr[Math.floor(Math.random() * $scope.arr.length)];
        return $scope.randOne;
    };

    console.log(pickAPayload())

    //Check User Exist
    var ref = firebase.database().ref('puzzle');
    var users = ref.orderByChild("userId").equalTo($scope.user_Id);
    $scope.users = $firebaseArray(users);
    $scope.users.$loaded().then(function(data) {
        if (data[0] != undefined && $scope.user_Id == data[0].userId) {
            //console.log("true")
            $scope.existUser(data[0].$id, data[0].userId);
        } else {
            //console.log("false")
            $scope.createUser();
        }
    });

    $scope.existUser = function(id, user) {
        //window.location.href = "#!/device?id=" + id + "&user_Id=" + user;
        $scope.generateGameInSystem(id)
    }
    /*-------------- Add and Get data to Database ---------*/
    $scope.createUser = function() {
        var ref = firebase.database().ref('puzzle');
        $scope.loadgame = true;
        $scope.addUser.userId = $scope.user_Id;
        $scope.addUser.payload = pickAPayload();
        $scope.addUser.moves.move = "";
        $scope.addUser.rows = 3;
        $scope.addUser.cols = 3;
        $scope.addUser.src = "./img/puzzle.png";
        var list = $firebaseArray(ref);
        list.$add($scope.addUser).then(function(ref) {
            $scope.id = ref.path.o[1];
            window.location.href = "#!/device?id=" + $scope.id + "&user_Id=" + $scope.user_Id;
            $scope.generateGameInSystem($scope.id);
        });
    };
    $scope.showChallengeBtn = false;
    /**
     * Generate Game in System
     */
    $scope.generateGameInSystem = function(id) {
        if ($scope.user_Id != undefined && id != undefined) {
            $scope.url = "puzzle/" + id;
            var ref = firebase.database().ref($scope.url);
            var obj = $firebaseObject(ref);
            $scope.qrCodeUrl = "http://10.10.1.183/ciaz/app/#!/device?id=" + id + "&user_Id=" + $scope.user_Id +"&flag=true" ;
            obj.$loaded().then(function() {
                //console.log(obj)
                $scope.puzzle.payload = obj.payload;
                $scope.puzzle.src = obj.src;
                $scope.puzzle.title = obj.title;
                $scope.puzzle.rows = obj.rows;
                $scope.puzzle.cols = obj.cols;
                $scope.puzzle.move = obj.moves;
            });
            obj.$bindTo($scope, "data");
            $scope.showChallengeBtn = true;
        }
        ;
    }

    $scope.challenge = function() {
        $('.challange_dt').hide();
        $('.make_qrcode').show();
        $scope.fakeDelay = true;
    }
    /*QR code Challenge button functionlity*/
    $scope.challengeStarted = false;
 /*   $scope.challengeStarted = serviceId.playNowSystem($scope.challengeStarted);
    console.log($scope.challengeStarted);*/
    $scope.playNowSystem = function() {
        $('.make_qrcode').hide();
        $('.playgame').show();
        $scope.challengeStarted = true;
    }

});

app.controller('deviceCtrl', function($scope, $firebaseArray, $firebaseObject,$location,$timeout,serviceId) {


});