import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../features/auth/data/auth_provider.dart';

String? authGuard(BuildContext context, GoRouterState state) {
  final auth = Provider.of<AuthProvider>(context, listen: false);
  
  if (!auth.isInitialized) {
    return state.matchedLocation == '/splash' ? null : '/splash';
  }

  final isLoggedIn = auth.isAuthenticated;
  final isLoggingIn = state.matchedLocation == '/login';
  final isSplash = state.matchedLocation == '/splash';

  if (!isLoggedIn && !isLoggingIn) {
    return '/login';
  }
  
  if (isLoggedIn && (isLoggingIn || isSplash)) {
    return '/main';
  }

  return null;
}
