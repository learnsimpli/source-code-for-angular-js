var macNotesApp = angular.module('macNotesApp', ['angular-markdown-editable']);

macNotesApp.controller('notesApp', function($scope, $sce, $http, $window, $q) {
    // global variables
    $scope.notesDirectory = null;
    $scope.notesList = null;
    $scope.currentDirectory = null;
    $scope.currentDirectoryIndex = null;
    $scope.currentNote = null;
    $scope.noteEdit = false;
    $scope.currentNoteIndex = null;
    $scope.isDataLoading = false;

    //Api functions
    $scope.getDirectory = function(category = null, userId = null) {
        // return if category is empty
        if (category === null) {
            console.log('Newly created directory or directory doesnot exist');
            return;
        }

        // request api
        $scope.isDataLoading = true;
        $http({
                method: 'GET',
                url: restApiDir
            })
            .then(function successCallback(response) {
                    console.log('Directory API data has been retrieved');
                    $scope.notesDirectory = (response.data);
                    $scope.isDataLoading = false;
                    console.log($scope.notesDirectory);

                },
                function errorCallback(response) {
                    console.log('Couldnot resolve API Url...');
                    console.log('Error => ' + err);
                    $scope.isDataLoading = false;
                    $scope.notesDirectory = '';
                });
    }
    $scope.getNoteList = function(index, directory = null, userId = null) {
        // return if directory is empty
        if (directory === null) {
            console.log('directory is empty...');
            return;
        }

        // cureent directory id and index
        $scope.currentDirectory = directory;
        $scope.currentDirectoryIndex = index;

        // complete url
        let ApiUrl = restApiNote + "/?directoryId=" + directory;

        // request api
        $scope.isDataLoading = true;
        $http({
                method: 'GET',
                url: ApiUrl
            })
            .then(function successCallback(response) {
                    console.log('NoteList API data has been retrieved');
                    $scope.notesList = (response.data);
                    $scope.isDataLoading = false;

                    // check whether notes are available
                    if ($scope.notesList.length == 0) {
                        $scope.currentNoteText = '';
                    }
                    console.log($scope.notesList);

                },
                function errorCallback(err) {
                    console.log('Couldnot resolve API Url...');
                    console.log('Error => ' + err);
                    $scope.isDataLoading = false;
                    $scope.notesList = null;
                });
    }
    $scope.getNote = function(index, note = null, userId = null) {
        // return if noteId is empty
        if (index === null) {
            $scope.currentNoteText = "";
            console.log('Note ID is empty...');
        }

        // cureent directory id and index
        $scope.currentNoteText = note.description
        $scope.currentNote = note;
        $scope.currentNoteIndex = index;
        console.log($scope.currentNote);
    }

    // Update note
    $scope.updateNote = function(note = null, userId = null) {

        let currentNote=$scope.currentNote;
        console.log(currentNote);
        let decription=$.trim($scope.currentNoteText);
        var name = decription.split('\n')[0];
        // Update in DB
        var req = {
            method: 'PUT',
            url: restApiNote + "/" + currentNote.id,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {

                "name": name,
                "description": decription,
                "directoryId": $scope.currentDirectory,
                "updated": new Date().toJSON().slice(0, 19).replace('T', ' ')
            }
        }
        $http(req).then(function(response) {

                console.log(response);
                setTimeout(function() {
                    $scope.getNoteList($scope.currentDirectoryIndex, $scope.currentDirectory, userId = null);
                }, 100);
                

            },
            function() {
                console.log('Couldnot rename the directory...');

            });

        // will updated in server if rest api is available
    }

    // Add directory and note functions
    $scope.addNote = function() {
        $scope.currentNote = ' ';
        $scope.currentNoteText = '';
        $scope.newNote = {};
        $scope.newNote.name = "New note";
        $scope.newNote.description = "Description";
        $scope.newNote.updated = new Date().toJSON().slice(0, 19).replace('T', ' ');
        var req = {
            method: 'POST',
            url: restApiNote,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {

                "name": $scope.newNote.name,
                "description": $scope.newNote.description,
                "directoryId": $scope.currentDirectory,
                "updated": $scope.newNote.updated
            }
        }
        $http(req).then(function(response) {

                console.log(response);
                
                setTimeout(function() {
                    $scope.getNoteList($scope.currentDirectoryIndex, $scope.currentDirectory, userId = null);
                }, 100);
                setTimeout(function() {
                    $scope.renameNote(0, response.data.id);
                }, 100);


            },
            function() {
                console.log('Couldnot add the directory...');

            });
    }
    $scope.addDirectory = function() {
        $scope.newDir = {};
        $scope.newDir.name = "New directory";
        $scope.newDir.updated = new Date().toJSON().slice(0, 19).replace('T', ' ');
        var req = {
            method: 'POST',
            url: restApiDir,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {

                "name": $scope.newDir.name,
                "updated": $scope.newDir.updated
            }
        }
        $http(req).then(function(response) {

                console.log(response);
                $scope.getDirectory('Default');
                setTimeout(function() {
                    $scope.renameDirectory(0, response.data.id);
                }, 100);


            },
            function() {
                console.log('Couldnot add the directory...');

            });
    }

    // Rename directories and notes
    $scope.renameDirectory = function(index = null, id = null) {
        let row=$('.directory' + id);
        row.addClass("ediatbleSpan");
        row.attr('contenteditable', 'true').css({
            'border': 'black solid 1px',
            'outline': 'none'
        }).focus();
    }
    $scope.renameDirectoryDone = function(index = null, id = null) {
        console.log(index);
        let row=$('.directory' + id);
        row.removeClass("ediatbleSpan");
        row.attr('contenteditable', 'false').css({
            'border': 'none',
            'outline': 'none'
        });

        // Update in DB
        var req = {
            method: 'PUT',
            url: restApiDir + "/" + id,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {

                "name": $.trim($('.directory' + id).text()),
                "updated": new Date().toJSON().slice(0, 19).replace('T', ' ')
            }
        }
        $http(req).then(function(response) {

                console.log(response);
                
                setTimeout(function() {
                    $scope.getDirectory('Default');
                }, 100);

            },
            function() {
                console.log('Couldnot rename the directory...');

            });
    }
    $scope.renameNote = function(index = null, id = null) {
        let row=$('.note' + id);
        row.addClass("ediatbleSpan");
        row.attr('contenteditable', 'true').css({
            'border': 'black solid 1px',
            'outline': 'none'
        }).focus();
    }
    $scope.renameNoteDone = function(index = null, id = null) {
        console.log(index);
        let row=$('.note' + id);
        row.removeClass("ediatbleSpan");
        row.attr('contenteditable', 'false').css({
            'border': 'none',
            'outline': 'none'
        });
        // Update in DB
        var req = {
            method: 'PUT',
            url: restApiNote + "/" + id,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {

                "name": $.trim($('.note' + id).text()),
                "description": $scope.notesList[index]["description"],
                "directoryId": $scope.currentDirectory,
                "updated": new Date().toJSON().slice(0, 19).replace('T', ' '),
            }
        }
        $http(req).then(function(response) {

                console.log(response);
                setTimeout(function() {
                    $scope.getNoteList($scope.currentDirectoryIndex, $scope.currentDirectory, userId = null);
                }, 100);
                
                setTimeout(function() {
                    $scope.getNote(index, $scope.notesList[index]);
                }, 100);

                


            },
            function() {
                console.log('Couldnot rename the directory...');

            });
    }

    // Delete directories and notes functions
    $scope.deleteNote = function(index = null, id = null) {

        var c = confirm("Are you sure you want to delete this note?");
        if (c == true) {

            // Update in DB
            var req = {
                method: 'DELETE',
                url: restApiNote + "/" + id,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {}
            }
            $http(req).then(function(response) {

                    console.log(response);
                    $scope.getNoteList($scope.currentDirectoryIndex, $scope.currentDirectory, userId = null);


                },
                function() {
                    console.log('Couldnot rename the directory...');

                });
        }

    }
    $scope.deleteDirectory = function(index = null, id = null) {

        var c = confirm("Are you sure you want to delete this directory?");
        if (c == true) {
            // Update in DB
            var req = {
                method: 'DELETE',
                url: restApiDir + "/" + id,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {}
            }
            $http(req).then(function(response) {

                    console.log(response);
                    $scope.getDirectory('Default');


                },
                function() {
                    console.log('Couldnot rename the directory...');

                });
        }
    }

    // return unique values
    $scope.removeDuplicates = function(array, comp) {
        const unique = array
            .map(e => e[comp])
            .map((e, i, final) => final.indexOf(e) === i && i)
            .filter(e => array[e]).map(e => array[e]);
        return unique;
    }

    // Is object empty
    $scope.isObjectEmpty = function(card) {
        return Object.keys(card).length === 0;
    }

    // Init the app with initial parameters
    $scope.initAPP = function() {
        console.log('Initializing the app...');
        $scope.getDirectory('defualt');
    }

    // Initial call
    $scope.initAPP();

});