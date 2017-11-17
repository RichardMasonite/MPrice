(function() {
    angular.module('OAuth', ["ngResource"])
        .factory('TokenRetrieval', ['TokenStore', '$resource', '$q',
            function (tokenStore, $resource, $q) {
                var userTokenRefreshPromise;

                var factoryObject = {
                    init: function () {
                        var clientKeysUserToken = $resource(webConfig.clientKeysUrl);
                        return clientKeysUserToken.get({ info: 'json', scope: 'openid' }).$promise.then(function (data) {
                            console.log('Response from Identity Server...');
                            console.log(data);
                            tokenStore.putClientKeysUserToken(data);
                            return factoryObject.retrieveAuthorizationBearerToken();
                        });
                    },
                    retrieveAuthorizationBearerToken: function () {
                        var clientKeys = tokenStore.getClientKeys();
                        var encodedClientKeys = btoa(clientKeys);
                        console.log('Retrieving ABT with ' + clientKeys + ' encoded to ' + encodedClientKeys);
                        var authorizationBearerToken = $resource(webConfig.authorizationBearerTokenUrl, null, {
                            'retrieve': {
                                method: 'POST',
                                headers: {
                                    'Authorization': 'Basic ' + encodedClientKeys,
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                params: {
                                    grant_type: 'client_credentials'
                                }
                            }
                        });
                        // Need an empty body because with no body at all, AngularJS automatically removes Content-Type from POSTs, but the security servers insist on that header.
                        return authorizationBearerToken.retrieve('').$promise.then(function (data) {
                            console.log('ABT call succeeded with...');
                            console.log(data);
                            tokenStore.putAuthorizationBearerToken(data);
                        }, function (data) {
                            console.log('ABT call FAILED...');
                            console.log(data);
                        });
                    },
                    refreshUserToken: function (attemptedUserToken) {
                        if (attemptedUserToken == tokenStore.getUserToken() && !userTokenRefreshPromise) {
							console.log('In TokenRetrieval refreshUserToken - Refresh needed so here we go....');
                            var clientKeys = tokenStore.getUserClientKeys();
                            var encodedClientKeys = btoa(clientKeys);
                            console.log('Refreshing user token with ' + clientKeys + ' encoded to ' + encodedClientKeys);
                            var userTokenRefresh = $resource(webConfig.userTokenRefreshUrl, null, {
                                'retrieve': {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': 'Basic ' + encodedClientKeys,
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    params: {
                                        grant_type: 'refresh_token',
                                        refresh_token: tokenStore.getUserRefreshToken(),
                                        scope: 'openid'
                                    }
                                }
                            });
                            // Need an empty body because with no body at all, AngularJS automatically removes Content-Type from POSTs, but the security servers insist on that header.
                            userTokenRefreshPromise = userTokenRefresh.retrieve('').$promise.then(function (data) {
                                console.log('User token refresh succeeded with...');
                                console.log(data);
                                tokenStore.putUserRefreshToken(data);
                            }, function (data) {
                                console.log('User token refresh FAILED...');
                                console.log(data);
                            }).finally(function () {
                                userTokenRefreshPromise = null;
                            });
                        }
						else if (userTokenRefreshPromise) {
							console.log('In TokenRetrieval refreshUserToken - got here while we\'re already getting a new token.  Return the promise so it waits.');
						}
						else {
							console.log('In TokenRetrieval refreshUserToken - got here with an outdated token.  Ignoring so caller simply retries.');
						}
						
                        return $q.when(userTokenRefreshPromise);
                    }
                }

                return factoryObject;
            }
        ])
        .factory('TokenStore', function () {
			return {
                putClientKeysUserToken: function (clientKeysUserToken) {
                    window.clientKeysUserToken = clientKeysUserToken;
                    window.cspr = window && window.clientKeysUserToken && window.clientKeysUserToken.userinfo && window.clientKeysUserToken.userinfo.cspr;
                    window.distributorid = window && window.clientKeysUserToken && window.clientKeysUserToken.userinfo && window.clientKeysUserToken.userinfo.distributorid;
                },
                putUserRefreshToken: function (clientKeysUserToken) {
                    window.clientKeysUserToken = clientKeysUserToken;
                },
				putAuthorizationBearerToken: function (authorizationBearerToken) {
					window.authorizationBearerToken = authorizationBearerToken;
                },

				getAuthorizationBearerToken: function () {
                    return window && window.authorizationBearerToken && window.authorizationBearerToken.access_token;
				},
				getUserToken: function () {
                    return window && window.clientKeysUserToken && window.clientKeysUserToken.access_token;
                },
                getUserRefreshToken: function () {
                    return window && window.clientKeysUserToken && window.clientKeysUserToken.refresh_token;
                },
                getUserClientKeys: function () {
                    return webConfig.userClientKeySecret;
                },
                getClientKeys: function () {
                    return window.cspr;
                },
				getDistributorId: function () {
                    return window.distributorid;
                },
				isMasoniteDist: function () {
				    return this.getDistributorId() === "0" || !this.getDistributorId(); 
				}
			};
		})
        .factory("oAuthInterceptor", [
            'TokenStore', '$q', '$window', '$injector',
            function (tokenStore, $q, $window, $injector) {
                return {
                    request: function (config) {
                        if (config.url != webConfig.authorizationBearerTokenUrl && config.url != webConfig.userTokenRefreshUrl) {
                            config.headers.Authorization = "Bearer " + tokenStore.getAuthorizationBearerToken();
                            config.headers.user_token = tokenStore.getUserToken();
                        }
                        return config || $q.when(config);
                    },
                    responseError: function (response) {
                        if (response.status == 401) {
                            var re = new RegExp(webConfig.expiredABTRegex);
                            if (re.test(response.data)) {
                                var tokenRetrieval = $injector.get('TokenRetrieval');
                                return tokenRetrieval.retrieveAuthorizationBearerToken().then(function () {
                                    var $http = $injector.get('$http');
                                    return $http(response.config);
                                });
                            }
                        }
                        else if (response.status == 400) {
							console.log('In oAuthInterceptor responseError - status 400');
                            re = new RegExp(webConfig.expiredUserTokenRegex);
                            if (re.test(response.data)) {
                                var tokenRetrieval = $injector.get('TokenRetrieval');
                                return tokenRetrieval.refreshUserToken(response.config.headers.user_token).then(function () {
                                    var $http = $injector.get('$http');
                                    return $http(response.config);
                                });
                            }
                        }
                        return $q.reject(response);
                    }
                }
            }
        ]);
}());

