import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/theme_extension.dart';
import '../utils/constants.dart';
import 'dart:async';

class FloatingAssistant extends StatefulWidget {
  final GoRouter router;
  const FloatingAssistant({super.key, required this.router});

  @override
  State<FloatingAssistant> createState() => _FloatingAssistantState();
}

class _FloatingAssistantState extends State<FloatingAssistant> {
  Offset position = Offset.zero;
  bool isInitialized = false;
  Timer? _inactivityTimer;
  bool _isIdle = false;

  void _routeListener() {
    setState(() {});
  }

  void _resetTimer() {
    _inactivityTimer?.cancel();
    if (_isIdle) {
      setState(() {
        _isIdle = false;
      });
    }
    _inactivityTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isIdle = true;
        });
      }
    });
  }

  @override
  void initState() {
    super.initState();
    widget.router.routerDelegate.addListener(_routeListener);
    _resetTimer();
  }

  @override
  void dispose() {
    _inactivityTimer?.cancel();
    widget.router.routerDelegate.removeListener(_routeListener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!isInitialized) {
      final size = MediaQuery.of(context).size;
      position = Offset(size.width - 80, size.height - 180);
      isInitialized = true;
    }
    
    // Sembunyikan floating assistant di halaman login dan halaman splash
    final location = widget.router.routerDelegate.currentConfiguration.uri.toString();
    if (location == '/' || location.contains('login') || location.contains('camera')) {
      return const SizedBox.shrink();
    }

    return Positioned(
      left: position.dx,
      top: position.dy,
      child: GestureDetector(
        onPanDown: (_) => _resetTimer(),
        onPanUpdate: (details) {
          _resetTimer();
          setState(() {
            position = Offset(
              position.dx + details.delta.dx,
              position.dy + details.delta.dy,
            );
          });
        },
        onPanEnd: (details) {
          _resetTimer();
          final size = MediaQuery.of(context).size;
          double dx = position.dx;
          if (dx < size.width / 2) {
            dx = 16.0;
          } else {
            dx = size.width - 72.0;
          }
          
          double dy = position.dy;
          if (dy < 100) dy = 100;
          if (dy > size.height - 100) dy = size.height - 100;

          setState(() {
            position = Offset(dx, dy);
          });
        },
        onTapDown: (_) => _resetTimer(),
        onTap: () {
          widget.router.push('/assistant');
        },
        child: Material(
          color: Colors.transparent,
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 300),
            opacity: _isIdle ? 0.4 : 1.0,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isIdle ? Colors.red : AppConstants.secondaryColor,
                boxShadow: [
                  BoxShadow(
                    color: (_isIdle ? Colors.red : AppConstants.secondaryColor).withValues(alpha: 0.3),
                    blurRadius: 15,
                    spreadRadius: 2,
                    offset: const Offset(0, 5),
                  )
                ],
              ),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 28),
            ),
          ),
        ),
      ),
    );
  }
}
