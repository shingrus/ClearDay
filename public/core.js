// public/core.js
var todoApp = angular.module('todoApp', []);

function mainController($scope, $http) {
    $scope.formData = {};

    $scope.todoIds = {};
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    changeDate(currentDate);



    // when submitting the add form, send the text to the node API
    $scope.createTodo = function () {
        $scope.formData.date = currentDate;
        $http.post('/api/todos/' + currentDate.getTime(), $scope.formData)
            .success(function (data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function (id) {
        if (confirm("Are you sure?"))
            $http.delete('/api/todos/' + id)
                .success(function (data) {
                    $scope.todos = data;
                    console.log(data);
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
    };

    function changeDate(date) {

        $scope.currentDay = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
        console.log("Change by:" + date);


        //TODO: add date to requets
        $http.get('/api/todos/' + date.getTime())
            .success(function (data) {
                $scope.todos = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });


    }

    //change date
    $scope.setNextDay = function () {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);

        changeDate(currentDate);
    }

    $scope.setPrevDay = function () {
        currentDate.setDate(currentDate.getDate() - 1);
        currentDate.setHours(0, 0, 0, 0);
        changeDate(currentDate);
    }

    $scope.setDone = function (todo) {
        console.log("todo: " + todo.text + "state: " + todo.done)

        $http.post('/api/setDone/' + todo._id + '/' + todo.done)
            .success(function (data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    }
}