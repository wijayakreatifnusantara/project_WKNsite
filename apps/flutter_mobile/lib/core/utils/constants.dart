import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  // Supabase Configuration
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';

  // App Colors (WKN Theme)
  static const Color primaryColor = Color(0xFFF97316); // Orange
  static const Color secondaryColor = Color(0xFFE31E24); // Red
  static const Color backgroundColor = Color(0xFFF8FAFC);
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);

  // Backend API
  static String get apiUrl {
    if (kIsWeb) return dotenv.env['API_URL_DEFAULT'] ?? '';
    if (Platform.isWindows) return dotenv.env['API_URL_DEFAULT'] ?? '';
    if (Platform.isAndroid) return dotenv.env['API_URL_ANDROID'] ?? '';
    return dotenv.env['API_URL_DEFAULT'] ?? '';
  }
}
