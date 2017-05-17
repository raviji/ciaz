(function(angular) {
    'use strict';

    var module = angular.module('slidingPuzzle', []);

    /**
     * Service
     */
    module.factory('slidingPuzzle', function($filter, $firebaseObject, $window) {
        function SlidingPuzzle(rows, cols) {
            /**
             * Puzzle grid
             * @type {Array}
             */
            this.grid = [];
            this.payload = [];
            /**
             * Moves count
             * @type {Number}
             */
            this.moves = 0;
            this.dbid = "";

            this.moveImage = function(v1, v2) {
                this.move(parseInt(v1), parseInt(v2));
            };

            this.getFBid = function(dbid) {
                //console.log(dbid)
                this.dbid = dbid;
            }

            this.move = function(srow, scol) {

                if (this.dbid != undefined) {
                    var ref = firebase.database().ref('puzzle/' + this.dbid + '/moves');
                    var obj = $firebaseObject(ref);
                    if (srow != NaN && scol != NaN) {
                        obj.move = srow + "," + scol + "";
                        obj.$save().then(function(ref) {
                            //console.log("moved")
                        }, function(error) {
                            //console.log("Error:", error);
                        });
                    }
                }
                var dirs = [
                        [1, 0],
                        [-1, 0],
                        [0, 1],
                        [0, -1]
                    ],
                    tref,
                    trow,
                    tcol;
                for (var d = 0; d < dirs.length; d++) {
                    trow = srow + dirs[d][0];
                    tcol = scol + dirs[d][1];
                    if (this.grid[trow] && this.grid[trow][tcol] && this.grid[trow][tcol].empty) {
                        tref = this.grid[srow][scol];
                        this.grid[srow][scol] = this.grid[trow][tcol];
                        this.grid[trow][tcol] = tref;
                        var sref = this.grid[srow][scol];
                        this.moves++;
                        // console.log(sref.id)
                        // console.log(tref.id)
                    }
                }

            };



            /** Load Payload Grid */
            this.LoadPayload = function(payloadData) {
                var tempTiles = [];
                var tiles = [];
                this.traverse(function(tile) {
                    tempTiles.push(tile);
                });
                //console.log(tempTiles);
                var payloadDataArray = payloadData.split(',');
                angular.forEach(payloadDataArray, function(value) {
                    tiles.push($filter('filter')(tempTiles, {
                        id: parseInt(value)
                    }, true)[0]);
                });
                //console.log(tiles);

                this.traverse(function(tile, row, col) {
                    this.grid[row][col] = tiles.shift();
                    // console.log(this.grid[row][col])

                });

                //console.log(this.payload);
                this.moves = 0;
            }

            /** * Shuffles grid */
            /*this.shuffle = function() {
                var tiles = [];
                this.traverse(function(tile) {
                    tiles.push(tile);
                });
                var shuffledItems = [];
                shuffle(tiles);
                angular.forEach(tiles, function(value, key) {
                    shuffledItems.push(value.id);
                });
                //console.log(tiles)
                this.traverse(function(tile, row, col) {
                    this.grid[row][col] = tiles.shift();
                    // console.log(this.grid[row][col])

                });

                //console.log(this.payload);
                this.moves = 0;
                return shuffledItems.join(',');
            };*/

            /**
             * Solves puzzle
             */
            this.solve = function() {
                var tiles = [];
                this.traverse(function(tile) {
                    tiles.push(tile);

                });
                tiles.sort(function(x, y) {
                    //console.log(x, y)
                    return (x.id - y.id);
                });
                this.traverse(function(tile, row, col) {
                    this.grid[row][col] = tiles.shift();
                });
            };

            /**
             * Is solved?
             * @type {Boolean}
             */

            this.isSolved = function() {
                var id = 1;
                for (var row = 0; row < rows; row++) {
                    for (var col = 0; col < cols; col++) {
                        if (this.grid[row][col].id !== id++) {
                            return false;
                        }
                    }
                }
                return true;

            };

            /**
             * Traverses grid and executes fn on every tile
             * @param fn
             */
            this.traverse = function(fn) {
                for (var row = 0; row < rows; row++) {
                    for (var col = 0; col < cols; col++) {
                        fn.call(this, this.grid && this.grid[row] ? this.grid[row][col] : undefined, row, col);
                    }
                }
            };

            // initialize grid
            var id = 1;
            this.traverse(function(tile, row, col) {
                //console.log(tile, row, col)
                if (!this.grid[row]) {
                    this.grid[row] = [];
                }
                this.grid[row][col] = {
                    id: id++,
                    empty: (row === rows - 1) && (col === cols - 1)
                };
                //console.log(this.grid[row][col]);
                if (this.grid[row][col].empty) {
                    this.empty = this.grid[row][col];
                }
            });
        }

        return function(rows, cols) {
            return new SlidingPuzzle(rows, cols);
        };
    });

    /**
     * Directive
     */
    module.directive('slidingPuzzle', function(slidingPuzzle) {
        return {
            restrict: 'EA',
            replace: true,
            template: '<table class="sliding-puzzle" ng-class="{\'puzzle-solved\': puzzle.isSolved()}">' +
                '<tr ng-repeat="($row, row) in puzzle.grid">' +
                '<td ng-repeat="($col, tile) in row" ng-click="puzzle.move($row, $col)" ng-style="tile.style" ng-class="{\'puzzle-empty\': tile.empty}" id="{{tile.id}}" >' +
                '<b>{{tile.id}}</b>' +
                '</td>' +
                '</tr>' +
                '</table>',
            scope: {
                size: '@',
                src: '@',
                api: '=',
                payload: '@',
                movement: '@',
                dbid: '@'
            },
            link: function(scope, element, attrs) {
                var rows,
                    cols,
                    loading = true,
                    image = new Image();

                function create() {
                    scope.puzzle = slidingPuzzle(rows, cols);

                    if (attrs.api) {
                        scope.api = scope.puzzle;
                        //console.log(scope.api.grid)
                    }
                    tile();

                }


                function tile() {
                    if (loading) {
                        return;
                    }

                    var width = image.width / cols,
                        height = image.height / rows;

                    scope.puzzle.traverse(function(tile, row, col) {
                        tile.style = {
                            width: width + 'px',
                            height: height + 'px',
                            background: (tile.empty ? 'none' : "url('" + scope.src + "') no-repeat -" + (col * width) + 'px -' + (row * height) + 'px')
                        };
                    });
                    if (scope.payload.length) {
                        //console.log(scope.payload);
                        scope.puzzle.LoadPayload(scope.payload);
                        scope.puzzle.getFBid(scope.dbid);
                    }
                    //scope.puzzle.moveImage(scope.movement);
                }

                scope.$watch('movement', function(movement) {
                    if (angular.isDefined(scope.puzzle)) {
                        var arr = movement.split(',');
                        scope.puzzle.moveImage(arr[0], arr[1]);
                    }
                });


                attrs.$observe('size', function(size) {
                    size = size.split('x');
                    if (size[0] >= 2 && size[1] >= 2) {
                        rows = size[0];
                        cols = size[1];
                        create();
                    }
                });

                attrs.$observe('src', function(src) {
                    loading = true;
                    image.src = src;
                    image.onload = function() {
                        loading = false;
                        scope.$apply(function() {
                            tile();
                        });
                    };
                });


            }
        };
    });
})(window.angular);