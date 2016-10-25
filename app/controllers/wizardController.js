(function() {

	// create controller
	window.controllers = window.controllers || {};
  
	window.controllers.wizardController = function($scope, $rootScope, $route, $routeParams, $location, $filter, utilsService, dataService, wizardServiceFactory) {

		this.params = $routeParams;

		// model lookups 
		$scope.audienceOptions = [{
			id: 1,
			text: 'All Active Store Personnel'
		}, {
			id: 2,
			text: 'Active Managers Only'
		}, {
			id: 3,
			text: 'Active Shift Leaders only'
		}];

		$scope.hiredOptions = [{
			id: 1,
			text: 'Since the beginning of time',
			otherField: undefined
		}, {
			id: 2,
			text: 'After selected date ',
			otherField: 'hiredAfter'
		}];
		
		// model for wizard selections
		$scope.model = {
			// step 1
			stores: [],
			// step 2:
			audience: $scope.audienceOptions[0],
			hired: $scope.hiredOptions[0],
			hiredAfter: undefined,
			// step 3
			entireLearningPath: true,
			courses: []
		};

		// summary model for final step
		$scope.summary = {
		};
		Object.defineProperty($scope.summary, 'stores', {
			get: function() {
				return $scope.model.stores.filter(function(store) {
					return store.selected;
				});
			}
		});
		Object.defineProperty($scope.summary, 'learners', {
			get: function() {
				return $scope.model.audience.text;
			}
		});
		Object.defineProperty($scope.summary, 'hired', {
			get: function() {
				return $scope.model.hired.otherField ? undefined : $scope.model.hired.text;
			}
		});
		Object.defineProperty($scope.summary, 'hiredAfter', {
			get: function() {
				if ($scope.model.hiredAfter) {
					return $filter('date')($scope.model.hiredAfter, 'shortDate');
				} else {
					return 'Not Selected';
				}
			}
		});
		Object.defineProperty($scope.summary, 'entireLearningPath', {
			get: function() {
				if ($scope.model.entireLearningPath) {
					return 'Entire Learning Path';
				} else {
					return undefined;
				}
			}
		});
		Object.defineProperty($scope.summary, 'courses', {
			get: function() {
				if (!$scope.model.entireLearningPath) {
					return $scope.model.courses.filter(function(course) {
						return course.selected;
					});
				} else {
					return [];
				}
			}
		});

		// wizard setup
		$scope.wizard = wizardServiceFactory.getService('customReportWizardController');

		/**
		 * @method previousStep
		 * @description
		 * Users clicks on previous
		 */
		$scope.previousStep = function() {
			console.log('previousStep');
			var wizard = $scope.wizard;
			if (wizard.activeStep.id !== 1) {
				//this['validationStep' + this.activeStep.id].clear();
				// TODO: here we might have to call some other funciton that saves the data
				//this.dataService.save(() => {
					var prev = wizard.steps[wizard.activeStep.id - 2];
					if (prev.id < wizard.activeStep.id) {
						wizard.activeStep.isDone = false;
					}
					wizard.setActiveStep(prev);
				//});
			}
		};

		/**
		 * @method nextStep
		 * @description
		 * Users click on next
		 */
		$scope.nextStep = function() {
			console.log('nextStep');
			var wizard = $scope.wizard, currentStep = wizard.activeStep;
			// wizard.validateStep(currentStep).then((isValid) => {
			// 	if (isValid) {
				// TODO: here we might have to call some other funciton that saves the data
				//this.dataService.save(() => {
					if (currentStep.id !== wizard.steps.length) {
						var next = wizard.steps[currentStep.id];
						if (next.id > currentStep.id) {
							if (currentStep.validateAction) {
								var validateResult = currentStep.validateAction();
								console.log(currentStep.title + ' validateResult: ' + validateResult);
								if (validateResult) {
									wizard.setActiveStep(next);
								} else {
									currentStep.hasError = true;
								}
							} else {
								currentStep.isDone = true;
								wizard.setActiveStep(next);
							}
						}
					} else {

						if (currentStep.validateAction) {
							alert('need to validate step');
						} else {
							currentStep.isDone = true;
							wizard.isComplete = true;
							wizard.close();
						}
					}
				//});
			//	}
			//});
		};

		/**
		 * @method finishStep
		 * @description
		 */
		$scope.finishStep = function finishStep() {
			this.nextStep();
		};

		/**
		 * @method clickOnStep
		 * @description
		 * Users click on a step directly
		 */
		$scope.cancel = function cancel() {
			//this.hide();
		};
		
		/**
		 * @method clickOnStep
		 * @description
		 * Users click on a step directly
		 */
		$scope.clickOnStep = function clickOnStep(step) {
			// TODO: Do we save data?
			//this.dataService.save(() => {
				$scope.wizard.setActiveStep(step);
			//});
		};

		/**
		 * @method clickOnStep
		 * @description
		 * Users click on a step directly
		 */
		$scope.navigationAction = function navigationAction(item) {
			console.log('navigationAction');
			item.action();
		};

		// add steps items
		$scope.wizard.addSteps([{
			id: 1, 
			title: 'Step 1', 
			path: 'views/customReportWizard/step1.html', 
			isFirst: true, 
			isLast: false, 
			isCurrent: true,
			validateAction: function validateStep1() {
				this.hasError =  $scope.model.stores.filter(function(store) {
					return store.selected;
				}).length < 1;
				this.errorMsg = this.hasError ? 'Please select at least on PC before proceeding' : undefined;
				this.isDone = !this.hasError;
				console.log('validateStep1 this.hasError ' + this.hasError);
				return this.hasError === false;
			}
		}, {
			id: 2, 
			title: 'Step 2', 
			path: 'views/customReportWizard/step2.html', 
			isFirst: false, 
			isLast: false, 
			isCurrent: false,
			validateAction: function validateStep2() {
				if ($scope.model.hired.otherField) {
					var otherFieldValue = $scope.model[$scope.model.hired.otherField];
					this.hasError = otherFieldValue === undefined;
					this.errorMsg = this.hasError ? 'Please select a date for Hired After Selected Date' : undefined;
				} else {
					this.hasError = false;
				}
				this.isDone = !this.hasError;
				console.log('validateStep2 this.hasError ' + this.hasError);
				return this.hasError === false;
			}
		}, {
			id: 3, 
			title: 'Step 3', 
			path: 'views/customReportWizard/step3.html', 
			isFirst: false, 
			isLast: false, 
			isCurrent: false,
			validateAction: function validateStep3() {
				if ($scope.model.entireLearningPath === false) {
					this.hasError =  $scope.model.courses.filter(function(course) {
						return course.selected;
					}).length < 1;
					this.errorMsg = this.hasError ? 'Please select at least one Course before proceeding' : undefined;
				} else {
					this.hasError = false;
				}
				this.isDone = !this.hasError;
				console.log('validateStep3 this.hasError ' + this.hasError);
				return this.hasError === false;
			}
		}, {
			id: 4, 
			title: 'Step 4', 
			path: 'views/customReportWizard/step4.html', 
			isFirst: false, 
			isLast: true, 
			isCurrent: false
		}]);

		// add navigation items
		$scope.wizard.addNavigationItems([{
			id: 1, 
			key: 'prev', 
			title: 'Previous', 
			isActive: false, 
			additionalCss: 'left',
			action: $scope.previousStep.bind($scope)
		}, {
			id: 2, 
			key: 'next', 
			title: 'Next', 
			isActive: true, 
			additionalCss: 'right',
			action: $scope.nextStep.bind($scope)
		}, {
			id: 3, 
			key: 'finish', 
			title: 'Run Report', 
			isActive: false, 
			additionalCss: 'right',
			action: $scope.finishStep.bind($scope)
		}/*, {
			id: 4, 
			key: 'cancel', 
			title: 'Close', 
			isActive: true, 
			additionalCss: 'right',
			action: $scope.cancel.bind($scope)
		}*/]);

		$scope.wizard.start();

		console.log('navigationItems', $scope.wizard.navigationItems)

		

		$scope.showHiredAfterDateinput = false;
		$scope.hiredChanged = function(option) {
			console.log('hiredChanged', option);
			$scope.showHiredAfterDateinput = (option.otherField);
		};

		// Step 1: Select PCs
		var areAllStoreSelected = function() {
			return $scope.model.stores.every(function(item) {
				return item.selected === true;
			});
		};

		var areSomeStoreSelected = function() {
			return !areAllStoreSelected() && $scope.model.stores.some(function(item) {
				return item.selected === true;
			});
		};

		$scope.allStoresChecked = false;

		Object.defineProperty($scope, 'allStoresCheckedState', {
			get: function() {
				return areAllStoreSelected() ? true : areSomeStoreSelected() ? undefined : false;
			}
		});

		// Step 2 of wizard: Select Learners
$scope.hiredAfterDatepickerPopup = {
	opened: false
};
$scope.datePickerOptions = {
    dateDisabled: false,
    formatYear: 'yyyy',
	initDate: new Date(),
    maxDate: new Date(),
	minDate: new Date(1945, 1, 1),
    startingDay: 0,
	showWeeks: false
};


		// courses
		$scope.noCoursesFound = false;
		$scope.loadingCourses = false;
		$scope.coursesTypeaheadOptions = {
			debounce: {
				default: 500,
				blur: 250
			},
			getterSetter: true
		};

		$scope.getCourses = function(str) {
			str = str.toLowerCase().trim();
			console.log('getCourses', str);
			// return $http.get('//api/path/to/courses', {
			// 	params: {
			// 		searchString: str
			// 	}
			// 	}).then(function(response){
			// 		return response.data.results.map(function(item){
			// 			return item.formatted_address;
			// 		});
			// 	});
			var _temp = '123456789'.split('').map(function(i) {
				return {
					id: i,
					name: 'Course ' + i,
					selected: true
				};
			});
			return _temp.filter(function(course) {
				return str.length === 0 || course.name.toLowerCase().indexOf(str) > -1
			});
		};


		// get data
		var onDataError = function(err) {
			utilsService.safeLog('wizardController.onDataError', err);
			$scope.error = 'Could not fetch data';
		};

		var onDataComplete  = function(data) {
			utilsService.safeLog('wizardController.onDataComplete', data);
			$scope.data = data;
			$scope.model.stores = data.stores;
		};

		// helper to get the data
		var getData = function(w) {
			console && console.log('getData: reportId', $rootScope.reportId);

			if (w === 'live') {
				var _apiBaseUrl = 'https://dunk-dev.tribridge-amplifyhr.com';
				var _endPoints = [{
					key: 'segments',
					propertyOnData: 'learning_path_items',
					path: _apiBaseUrl + '/curricula_player/api/v1/path/15/?format=json&user=[user]&companyKey=[companyKey]'
						.replace('[user]', $rootScope.token)
						.replace('[companyKey]', $rootScope.compKey)
				}, {
					key: 'stores',
					propertyOnData: 'results',
					path: 'data/luca-stores.json?' + Math.random()
				}];

				console.log('_endPoints', _endPoints);
				
				var _endPointsData = {}, _endPointCount = 0;
				var onEndPointComplete = function(endPoint, data) {
					_endPointsData[endPoint.key] = data[endPoint.propertyOnData];
					if (++_endPointCount === _endPoints.length) {
						console.log('_endPointsData', _endPointsData);
						onDataComplete(_endPointsData);
					}
				};

				utilsService.fastLoop(_endPoints, function(endPoint) {
					dataService.getData(endPoint.path)
						.then(function(data) {
							onEndPointComplete(endPoint, data);
						}, onDataError);
				});
			} else {
				//var fileName = 'data/report.json?' + Math.random();
				//var fileName = 'data/report-generated2.json?' + Math.random();
				//var fileName = 'data/new-and-trending.json?' + Math.random();
				//var fileName = 'data/report.json?' + Math.random();
				var fileName = 'data/learning-path.json?' + Math.random();
				console && console.log('fileName', fileName);
				dataService.getData(fileName)
					.then(onDataComplete, onDataError);
			}
		};

		// invoke getData
		getData('test'); // or 'live'
	};

}());
