angular.module("starter")

.constant('AUTH_EVENTS', {
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
	superadmin:'superadmin_role',
	admin:'admin_role',
	public: 'public_role'
})

.constant('EVENTS', {
	userChange:'userChange'
});